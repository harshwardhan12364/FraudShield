"""Fraud report model."""
import uuid
from datetime import date, datetime
from typing import List, Optional

from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


REPORT_STATUSES = ["submitted", "under_review", "substantiated", "rejected", "disputed", "closed"]
INCIDENT_CATEGORIES = [
    "phishing",
    "impersonation",
    "payment_scam",
    "account_takeover",
    "fake_investment",
    "money_mule",
    "other",
]


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    # Human-readable external ID (non-sequential, unpredictable)
    external_id: Mapped[str] = mapped_column(
        String(20), unique=True, nullable=False, index=True,
        default=lambda: "FS-" + uuid.uuid4().hex[:8].upper()
    )
    reporter_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)

    # Incident details
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    incident_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    simulated_amount: Mapped[Optional[float]] = mapped_column(Numeric(15, 2), nullable=True)
    # Synthetic payment destination — fictional demo identifier only
    synthetic_destination_ref: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    # Other synthetic indicators (comma-separated URLs, phone prefixes, etc.)
    synthetic_indicators: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Review state
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="submitted")
    review_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reviewed_by_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id"), nullable=True)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Risk analysis cache
    risk_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    risk_level: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    risk_reasons: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON
    risk_analyzed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Blockchain reference
    blockchain_tx_hash: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    evidence_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    reporter: Mapped["User"] = relationship("User", foreign_keys=[reporter_id], back_populates="reports")
    reviewer: Mapped[Optional["User"]] = relationship("User", foreign_keys=[reviewed_by_id])
    evidence_files: Mapped[List["EvidenceFile"]] = relationship("EvidenceFile", back_populates="report", lazy="select")
    blockchain_records: Mapped[List["BlockchainRecord"]] = relationship("BlockchainRecord", back_populates="report", lazy="select")
    audit_events: Mapped[List["AuditEvent"]] = relationship(
        "AuditEvent", back_populates="report", lazy="select",
        foreign_keys="AuditEvent.report_id"
    )
