"""Report CRUD routes with full authorization enforcement."""
import json
import logging
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import func, select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, require_analyst_or_admin
from app.db.database import get_db
from app.models.audit import AuditEvent
from app.models.report import Report
from app.models.user import User
from app.schemas.report import (
    DisputeCreate, ReportCreate, ReportListResponse, ReportResponse, ReviewUpdate
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/reports", tags=["reports"])


async def _log(db, event_type, actor_id=None, report_id=None, detail=None, ip=None):
    db.add(AuditEvent(
        event_type=event_type,
        actor_id=actor_id,
        report_id=report_id,
        detail=json.dumps(detail) if detail else None,
        ip_address=ip,
    ))


def _ip(request: Request) -> str:
    fwd = request.headers.get("X-Forwarded-For")
    return fwd.split(",")[0].strip() if fwd else (request.client.host if request.client else "unknown")


@router.post("", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(
    body: ReportCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit a new fraud report. Any authenticated user can submit."""
    report = Report(
        reporter_id=current_user.id,
        category=body.category,
        description=body.description,
        incident_date=body.incident_date,
        simulated_amount=float(body.simulated_amount) if body.simulated_amount is not None else None,
        synthetic_destination_ref=body.synthetic_destination_ref,
        synthetic_indicators=body.synthetic_indicators,
        status="submitted",
    )
    db.add(report)
    await db.flush()
    await _log(db, "REPORT_CREATED", actor_id=current_user.id, report_id=report.id, ip=_ip(request))
    await db.commit()
    await db.refresh(report, ["evidence_files"])
    return _report_out(report)


@router.get("", response_model=ReportListResponse)
async def list_reports(
    request: Request,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    status_filter: Optional[str] = Query(default=None, alias="status"),
    category: Optional[str] = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List reports.
    Reporters see only their own reports.
    Analysts and admins see all reports in their scope.
    """
    q = select(Report).options(selectinload(Report.evidence_files))

    if current_user.role == "reporter":
        q = q.where(Report.reporter_id == current_user.id)

    if status_filter:
        q = q.where(Report.status == status_filter)
    if category:
        q = q.where(Report.category == category)

    count_q = select(func.count()).select_from(q.subquery())
    total = (await db.execute(count_q)).scalar_one()

    q = q.order_by(Report.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    rows = (await db.execute(q)).scalars().all()

    return ReportListResponse(
        total=total,
        page=page,
        page_size=page_size,
        items=[_report_out(r) for r in rows],
    )


@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = await _get_authorized_report(report_id, current_user, db)
    return _report_out(report)


@router.post("/{report_id}/analyze")
async def analyze_report(
    report_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_analyst_or_admin),
):
    """Run risk analysis on a report. Analyst/Admin only."""
    from app.analysis.risk_engine import get_engine, RiskFeatures
    from sqlalchemy import and_
    from datetime import timedelta

    report = await _get_report_by_id(report_id, db)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    # Gather contextual features
    now = datetime.now(timezone.utc)

    dest_count_q = select(func.count()).select_from(Report).where(
        and_(
            Report.synthetic_destination_ref == report.synthetic_destination_ref,
            Report.synthetic_destination_ref.isnot(None),
            Report.id != report.id,
        )
    )
    dest_count = (await db.execute(dest_count_q)).scalar_one()

    recent_q = select(func.count()).select_from(Report).where(
        and_(
            Report.reporter_id == report.reporter_id,
            Report.created_at >= now - timedelta(hours=24),
            Report.id != report.id,
        )
    )
    recent_count = (await db.execute(recent_q)).scalar_one()

    features = RiskFeatures(
        report_id=report.id,
        category=report.category,
        description=report.description,
        incident_date=datetime.combine(report.incident_date, datetime.min.time()) if report.incident_date else None,
        simulated_amount=report.simulated_amount,
        synthetic_destination_ref=report.synthetic_destination_ref,
        synthetic_indicators=report.synthetic_indicators,
        reports_sharing_destination=dest_count,
        reporter_reports_last_24h=recent_count,
        shared_indicator_count=0,  # simplified for MVP
    )

    result = get_engine().analyze(features)

    report.risk_score = result.risk_score
    report.risk_level = result.risk_level
    report.risk_reasons = json.dumps(result.reasons)
    report.risk_analyzed_at = now

    await _log(db, "RISK_ANALYSIS_RUN", actor_id=current_user.id, report_id=report.id, ip=_ip(request))
    await db.commit()

    return result.to_dict()


@router.post("/{report_id}/review")
async def review_report(
    report_id: str,
    body: ReviewUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_analyst_or_admin),
):
    """Change report status. Analyst/Admin only."""
    report = await _get_report_by_id(report_id, db)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    old_status = report.status
    report.status = body.status
    report.review_note = body.review_note
    report.reviewed_by_id = current_user.id
    report.reviewed_at = datetime.now(timezone.utc)

    await _log(db, "REPORT_STATUS_CHANGED", actor_id=current_user.id, report_id=report.id,
               detail={"from": old_status, "to": body.status, "note": body.review_note}, ip=_ip(request))
    await db.commit()
    return {"message": "Status updated.", "status": report.status}


@router.post("/{report_id}/disputes")
async def dispute_report(
    report_id: str,
    body: DisputeCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Reporter can dispute their own report's decision."""
    report = await _get_authorized_report(report_id, current_user, db)

    if current_user.role == "reporter" and report.reporter_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot dispute a report you did not submit.")

    report.status = "disputed"
    await _log(db, "REPORT_DISPUTED", actor_id=current_user.id, report_id=report.id,
               detail={"reason": body.reason[:200]}, ip=_ip(request))
    await db.commit()
    return {"message": "Dispute recorded.", "status": "disputed"}


# ── Helpers ────────────────────────────────────────────────────────────────

async def _get_report_by_id(report_id: str, db: AsyncSession) -> Optional[Report]:
    q = select(Report).options(selectinload(Report.evidence_files)).where(Report.id == report_id)
    return (await db.execute(q)).scalar_one_or_none()


async def _get_authorized_report(report_id: str, user: User, db: AsyncSession) -> Report:
    report = await _get_report_by_id(report_id, db)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")
    if user.role == "reporter" and report.reporter_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied.")
    return report


def _report_out(r: Report) -> dict:
    return {
        "id": r.id,
        "external_id": r.external_id,
        "reporter_id": r.reporter_id,
        "category": r.category,
        "description": r.description,
        "incident_date": r.incident_date,
        "simulated_amount": float(r.simulated_amount) if r.simulated_amount else None,
        "synthetic_destination_ref": r.synthetic_destination_ref,
        "status": r.status,
        "review_note": r.review_note,
        "risk_score": r.risk_score,
        "risk_level": r.risk_level,
        "blockchain_tx_hash": r.blockchain_tx_hash,
        "created_at": r.created_at.isoformat(),
        "updated_at": r.updated_at.isoformat(),
        "evidence_files": [
            {
                "id": e.id,
                "original_filename": e.original_filename,
                "content_type": e.content_type,
                "file_size_bytes": e.file_size_bytes,
                "sha256_hash": e.sha256_hash,
                "blockchain_hash": e.blockchain_hash,
                "blockchain_tx_hash": e.blockchain_tx_hash,
                "created_at": e.created_at.isoformat(),
            }
            for e in (r.evidence_files or [])
        ],
    }
