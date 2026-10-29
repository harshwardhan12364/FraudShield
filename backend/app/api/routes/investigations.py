"""Investigation routes: relationship graph and audit log."""
import logging
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_analyst_or_admin
from app.db.database import get_db
from app.models.audit import AuditEvent
from app.models.report import Report
from app.models.user import User
from app.analysis.graph import get_graph_builder, ReportNode

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/investigations", tags=["investigations"])


@router.get("/graph")
async def get_relationship_graph(
    status_filter: str = Query(default=None, alias="status"),
    category: str = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_analyst_or_admin),
):
    """
    Build and return the connected-scam relationship graph.
    Only available to analysts and admins.
    """
    q = select(Report)
    if status_filter:
        q = q.where(Report.status == status_filter)
    if category:
        q = q.where(Report.category == category)

    reports = (await db.execute(q)).scalars().all()

    nodes = [
        ReportNode(
            report_id=r.id,
            external_id=r.external_id,
            category=r.category,
            status=r.status,
            risk_score=r.risk_score,
            risk_level=r.risk_level,
            synthetic_destination_ref=r.synthetic_destination_ref,
            synthetic_indicators=r.synthetic_indicators,
        )
        for r in reports
    ]

    result = get_graph_builder().build(nodes)

    return {
        "nodes": result.nodes,
        "edges": result.edges,
        "summary": result.summary,
        "disclaimer": (
            "⚠ SYNTHETIC DEMO DATA. Connections indicate shared identifiers, "
            "NOT confirmed fraud or identity. All data is fictional."
        ),
    }


@router.get("/audit-events")
async def get_audit_events(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=200),
    event_type: str = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_analyst_or_admin),
):
    """Return paginated audit log. Analyst/Admin only."""
    from sqlalchemy import func

    q = select(AuditEvent)
    if event_type:
        q = q.where(AuditEvent.event_type == event_type)

    total_q = select(func.count()).select_from(q.subquery())
    total = (await db.execute(total_q)).scalar_one()

    q = q.order_by(AuditEvent.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    events = (await db.execute(q)).scalars().all()

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": [
            {
                "id": e.id,
                "event_type": e.event_type,
                "actor_id": e.actor_id,
                "report_id": e.report_id,
                "detail": e.detail,
                "ip_address": e.ip_address,
                "created_at": e.created_at.isoformat(),
            }
            for e in events
        ],
    }
