"""Evidence upload and blockchain verification routes."""
import json
import logging
from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user
from app.api.routes.reports import _get_authorized_report
from app.db.database import get_db
from app.models.audit import AuditEvent
from app.models.blockchain_record import BlockchainRecord
from app.models.evidence import EvidenceFile
from app.models.report import Report
from app.models.user import User
from app.services.evidence import validate_and_store_evidence
from app.services.blockchain import get_blockchain_service, BlockchainUnavailableError

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/reports", tags=["evidence"])


@router.post("/{report_id}/evidence")
async def upload_evidence(
    report_id: str,
    request: Request,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Upload an evidence file for a report.
    - File is validated server-side (magic bytes + extension + size).
    - SHA-256 is computed server-side.
    - Stored under a randomized filename.
    """
    report = await _get_authorized_report(report_id, current_user, db)

    storage_name, sha256, content_type, size = await validate_and_store_evidence(file, report_id)

    evidence = EvidenceFile(
        report_id=report.id,
        uploaded_by_id=current_user.id,
        original_filename=file.filename or "upload",
        storage_filename=storage_name,
        content_type=content_type,
        file_size_bytes=size,
        sha256_hash=sha256,
    )
    db.add(evidence)

    # Update report-level evidence hash (latest file)
    report.evidence_hash = sha256

    db.add(AuditEvent(
        event_type="EVIDENCE_UPLOADED",
        actor_id=current_user.id,
        report_id=report.id,
        detail=json.dumps({"sha256": sha256, "size": size}),
        ip_address=request.client.host if request.client else None,
    ))

    await db.commit()
    await db.refresh(evidence)

    return {
        "id": evidence.id,
        "original_filename": evidence.original_filename,
        "sha256_hash": sha256,
        "file_size_bytes": size,
        "content_type": content_type,
        "message": "Evidence uploaded successfully.",
    }


@router.post("/{report_id}/verify")
async def verify_on_blockchain(
    report_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Register report hash on blockchain OR verify an existing registration.
    Environment is clearly labelled. Never invents a receipt.
    """
    report = await _get_authorized_report(report_id, current_user, db)

    if not report.evidence_hash:
        raise HTTPException(
            status_code=400,
            detail="No evidence hash available. Upload evidence before blockchain registration."
        )

    service = get_blockchain_service()

    if not service.is_available():
        return {
            "status": "blockchain_unavailable",
            "environment": service.environment_label,
            "message": (
                "Blockchain node is not reachable. "
                "Start Hardhat: cd blockchain && npx hardhat node. "
                "Then deploy the contract and set CONTRACT_ADDRESS in .env."
            ),
            "evidence_hash": report.evidence_hash,
        }

    try:
        if report.blockchain_tx_hash:
            # Already registered — verify
            result = service.verify_report(report.external_id, report.evidence_hash)
            return {"status": "verified", **result}
        else:
            # Register
            result = service.register_report(report.external_id, report.evidence_hash)
            report.blockchain_tx_hash = result["tx_hash"]

            bc = BlockchainRecord(
                report_id=report.id,
                tx_hash=result["tx_hash"],
                block_number=result.get("block_number"),
                contract_address=result.get("contract_address"),
                evidence_hash=report.evidence_hash,
                event_type="REPORT_REGISTERED",
                chain_id=result.get("chain_id"),
                environment=result.get("environment", "LOCAL_DEVELOPMENT"),
                status="confirmed",
                raw_receipt=json.dumps(result),
            )
            db.add(bc)
            db.add(AuditEvent(
                event_type="BLOCKCHAIN_REGISTERED",
                actor_id=current_user.id,
                report_id=report.id,
                detail=json.dumps({"tx_hash": result["tx_hash"]}),
            ))
            await db.commit()
            return {"status": "registered", **result}

    except BlockchainUnavailableError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.exception("Blockchain error for report %s", report_id)
        raise HTTPException(status_code=500, detail="Blockchain operation failed.")


@router.get("/{report_id}/blockchain")
async def get_blockchain_records(
    report_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List blockchain records for a report."""
    await _get_authorized_report(report_id, current_user, db)
    q = select(BlockchainRecord).where(BlockchainRecord.report_id == report_id).order_by(BlockchainRecord.created_at.desc())
    rows = (await db.execute(q)).scalars().all()
    return [
        {
            "id": r.id,
            "tx_hash": r.tx_hash,
            "block_number": r.block_number,
            "evidence_hash": r.evidence_hash,
            "event_type": r.event_type,
            "environment": r.environment,
            "status": r.status,
            "created_at": r.created_at.isoformat(),
        }
        for r in rows
    ]
