"""Audit event model — immutable log of all significant actions."""
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_type: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    actor_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    report_id: Mapped[Optional[str]] = mapped_column(ForeignKey("reports.id"), nullable=True, index=True)
    detail: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON-encoded, no secrets
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)  # IPv4/IPv6
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )

    actor: Mapped[Optional["User"]] = relationship("User", back_populates="audit_events")
    report: Mapped[Optional["Report"]] = relationship(
        "Report", back_populates="audit_events", foreign_keys=[report_id]
    )
