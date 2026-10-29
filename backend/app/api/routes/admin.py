"""Admin routes: user management, role assignment, account control."""
import json
import logging
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin, get_current_user
from app.core.security import hash_password
from app.db.database import get_db
from app.models.audit import AuditEvent
from app.models.user import User
from app.schemas.auth import UserUpdate

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/users")
async def list_users(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    total = (await db.execute(select(func.count()).select_from(User))).scalar_one()
    rows = (await db.execute(
        select(User).order_by(User.created_at.desc())
        .offset((page - 1) * page_size).limit(page_size)
    )).scalars().all()

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": [_user_out(u) for u in rows],
    }


@router.patch("/users/{user_id}")
async def update_user(
    user_id: str,
    body: UserUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Update user role or active status. Admin only."""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Administrators cannot modify their own account via this endpoint.")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    changes = {}
    if body.display_name is not None:
        user.display_name = body.display_name
        changes["display_name"] = body.display_name
    if body.is_active is not None:
        user.is_active = body.is_active
        changes["is_active"] = body.is_active
    if body.role is not None:
        old_role = user.role
        user.role = body.role
        changes["role"] = {"from": old_role, "to": body.role}

    db.add(AuditEvent(
        event_type="ADMIN_USER_UPDATED",
        actor_id=current_user.id,
        detail=json.dumps({"target_user_id": user_id, "changes": changes}),
        ip_address=request.client.host if request.client else None,
    ))

    await db.commit()
    await db.refresh(user)
    return _user_out(user)


@router.get("/stats")
async def admin_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    from app.models.report import Report
    from app.models.blockchain_record import BlockchainRecord

    total_users = (await db.execute(select(func.count()).select_from(User))).scalar_one()
    total_reports = (await db.execute(select(func.count()).select_from(Report))).scalar_one()
    total_blockchain = (await db.execute(select(func.count()).select_from(BlockchainRecord))).scalar_one()
    total_events = (await db.execute(select(func.count()).select_from(AuditEvent))).scalar_one()

    return {
        "total_users": total_users,
        "total_reports": total_reports,
        "total_blockchain_records": total_blockchain,
        "total_audit_events": total_events,
    }


def _user_out(u: User) -> dict:
    return {
        "id": u.id,
        "email": u.email,
        "display_name": u.display_name,
        "role": u.role,
        "is_active": u.is_active,
        "failed_login_attempts": u.failed_login_attempts,
        "created_at": u.created_at.isoformat(),
        "last_login_at": u.last_login_at.isoformat() if u.last_login_at else None,
    }
