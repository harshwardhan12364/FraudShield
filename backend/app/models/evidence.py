"""Evidence file model — stores metadata, not raw file content in DB."""
import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class EvidenceFile(Base):
    __tablename__ = "evidence_files"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    report_id: Mapped[str] = mapped_column(ForeignKey("reports.id"), nullable=False, index=True)
    uploaded_by_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)

    # Original filename (for display only, never used for storage path)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    # Randomized internal storage name (UUID-based)
    storage_filename: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    content_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)

    # SHA-256 hash computed server-side
    sha256_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    # Hash registered on blockchain
    blockchain_hash: Mapped[str] = mapped_column(String(64), nullable=True)
    blockchain_tx_hash: Mapped[str] = mapped_column(String(100), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    report: Mapped["Report"] = relationship("Report", back_populates="evidence_files")
    uploader: Mapped["User"] = relationship("User", foreign_keys=[uploaded_by_id])
