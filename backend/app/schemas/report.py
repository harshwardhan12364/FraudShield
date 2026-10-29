"""Pydantic schemas for fraud reports."""
from datetime import date
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator

from app.models.report import INCIDENT_CATEGORIES, REPORT_STATUSES


class ReportCreate(BaseModel):
    category: str
    description: str = Field(min_length=20, max_length=5000)
    incident_date: Optional[date] = None
    simulated_amount: Optional[float] = Field(default=None, ge=0, le=1_000_000_000)
    synthetic_destination_ref: Optional[str] = Field(default=None, max_length=100)
    synthetic_indicators: Optional[str] = Field(default=None, max_length=1000)

    @field_validator("category")
    @classmethod
    def valid_category(cls, v: str) -> str:
        if v not in INCIDENT_CATEGORIES:
            raise ValueError(f"category must be one of {INCIDENT_CATEGORIES}")
        return v

    @field_validator("synthetic_destination_ref")
    @classmethod
    def no_real_upi(cls, v: Optional[str]) -> Optional[str]:
        if v and "@" in v and any(b in v for b in ["okaxis", "okhdfcbank", "oksbi", "okicici", "ybl", "ibl"]):
            raise ValueError("Use synthetic demo identifiers only (e.g. demo-upi-001), not real UPI addresses.")
        return v


class ReportUpdate(BaseModel):
    description: Optional[str] = Field(default=None, min_length=20, max_length=5000)
    incident_date: Optional[date] = None
    simulated_amount: Optional[float] = Field(default=None, ge=0, le=1_000_000_000)
    synthetic_indicators: Optional[str] = Field(default=None, max_length=1000)


class ReviewUpdate(BaseModel):
    status: str
    review_note: Optional[str] = Field(default=None, max_length=2000)

    @field_validator("status")
    @classmethod
    def valid_status(cls, v: str) -> str:
        allowed = ["under_review", "substantiated", "rejected", "disputed", "closed"]
        if v not in allowed:
            raise ValueError(f"status must be one of {allowed}")
        return v


class EvidenceResponse(BaseModel):
    id: str
    original_filename: str
    content_type: str
    file_size_bytes: int
    sha256_hash: str
    blockchain_hash: Optional[str]
    blockchain_tx_hash: Optional[str]
    created_at: str

    model_config = {"from_attributes": True}


class ReportResponse(BaseModel):
    id: str
    external_id: str
    reporter_id: str
    category: str
    description: str
    incident_date: Optional[date]
    simulated_amount: Optional[float]
    synthetic_destination_ref: Optional[str]
    status: str
    review_note: Optional[str]
    risk_score: Optional[int]
    risk_level: Optional[str]
    blockchain_tx_hash: Optional[str]
    created_at: str
    updated_at: str
    evidence_files: List[EvidenceResponse] = []

    model_config = {"from_attributes": True}


class ReportListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: List[ReportResponse]


class DisputeCreate(BaseModel):
    reason: str = Field(min_length=20, max_length=2000)
