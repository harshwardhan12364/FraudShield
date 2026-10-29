"""Blockchain transaction record model."""
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class BlockchainRecord(Base):
    __tablename__ = "blockchain_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    report_id: Mapped[str] = mapped_column(ForeignKey("reports.id"), nullable=False, index=True)
    tx_hash: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    block_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    contract_address: Mapped[Optional[str]] = mapped_column(String(42), nullable=True)
    evidence_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    event_type: Mapped[str] = mapped_column(String(80), nullable=False, default="REPORT_REGISTERED")
    chain_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    environment: Mapped[str] = mapped_column(String(30), nullable=False, default="LOCAL_DEVELOPMENT")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="confirmed")
    raw_receipt: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    report: Mapped["Report"] = relationship("Report", back_populates="blockchain_records")
