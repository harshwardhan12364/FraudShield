"""
FraudShield 360 — Fraud Risk Engine v1 (Rules-Based)

This engine produces a normalized risk score (0-100) with human-readable
reasons and explicit limitations. It is an investigative screening tool —
NOT a determination of guilt.

Rules are configurable and versioned. The engine is stateless; callers
supply all relevant features extracted from the database.
"""
from __future__ import annotations

import hashlib
import json
import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

ENGINE_VERSION = "rules-v1.0"

# --- Configuration -------------------------------------------------------

DEFAULT_CONFIG: Dict[str, Any] = {
    # Amounts above this (in demo units) trigger a high-amount indicator
    "high_amount_threshold": 50_000,
    # Number of reports sharing same synthetic destination before flagging
    "shared_dest_count_threshold": 2,
    # Number of reports from same reporter within 24h before flagging
    "rapid_report_count_threshold": 3,
    # Maximum normal description length (shorter may indicate low quality)
    "min_description_length": 100,
    # Points assigned per indicator (sum capped at 100)
    "points": {
        "high_amount": 20,
        "shared_destination": 25,
        "rapid_reports": 20,
        "missing_date": 10,
        "missing_amount": 10,
        "suspicious_indicators": 15,
        "low_quality_description": 10,
        "multiple_shared_indicators": 20,
    },
}


def _risk_level(score: int) -> str:
    if score >= 70:
        return "high"
    if score >= 40:
        return "medium"
    if score >= 15:
        return "low"
    return "minimal"


# --- Input / Output models -----------------------------------------------

@dataclass
class RiskFeatures:
    """All input features for the risk engine. Validated before use."""
    report_id: str
    category: str
    description: str
    incident_date: Optional[datetime]
    simulated_amount: Optional[float]
    synthetic_destination_ref: Optional[str]
    synthetic_indicators: Optional[str]

    # Contextual features from database queries
    reports_sharing_destination: int = 0   # other reports with same dest ref
    reporter_reports_last_24h: int = 0     # reporter's reports in last 24h
    shared_indicator_count: int = 0        # other reports sharing any indicator

    def validate(self) -> List[str]:
        """Return list of validation errors (empty = OK)."""
        errors = []
        if not self.report_id:
            errors.append("report_id is required")
        if not self.category:
            errors.append("category is required")
        if not self.description or len(self.description) < 5:
            errors.append("description must be at least 5 characters")
        if self.simulated_amount is not None and self.simulated_amount < 0:
            errors.append("simulated_amount must be non-negative")
        if self.reports_sharing_destination < 0:
            errors.append("reports_sharing_destination must be >= 0")
        return errors


@dataclass
class RiskResult:
    """Structured output from the risk engine."""
    report_id: str
    risk_score: int                        # 0–100
    risk_level: str                        # minimal | low | medium | high
    reasons: List[str]
    model_version: str
    analyzed_at: str
    limitations: List[str] = field(default_factory=list)
    data_quality_notes: List[str] = field(default_factory=list)
    raw_points: Dict[str, int] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "report_id": self.report_id,
            "risk_score": self.risk_score,
            "risk_level": self.risk_level,
            "reasons": self.reasons,
            "model_version": self.model_version,
            "analyzed_at": self.analyzed_at,
            "limitations": self.limitations,
            "data_quality_notes": self.data_quality_notes,
        }


# --- Engine ---------------------------------------------------------------

class FraudRiskEngine:
    """
    Rule-based fraud risk engine.
    
    All rules are additive and capped at 100. Each rule is independently
    testable. No ML model is used in v1; the engine is fully transparent.
    """

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = {**DEFAULT_CONFIG, **(config or {})}

    def analyze(self, features: RiskFeatures) -> RiskResult:
        """Run all rules and return a RiskResult."""
        # 1. Validate inputs
        errors = features.validate()
        if errors:
            logger.warning("Risk engine received invalid features: %s", errors)
            return RiskResult(
                report_id=features.report_id,
                risk_score=0,
                risk_level="minimal",
                reasons=[],
                model_version=ENGINE_VERSION,
                analyzed_at=datetime.now(timezone.utc).isoformat(),
                limitations=["Analysis could not be completed due to invalid input: " + "; ".join(errors)],
                data_quality_notes=errors,
            )

        reasons: List[str] = []
        data_quality_notes: List[str] = []
        raw_points: Dict[str, int] = {}
        pts = self.config["points"]

        # Rule 1: High simulated transaction amount
        if features.simulated_amount is not None:
            if features.simulated_amount >= self.config["high_amount_threshold"]:
                raw_points["high_amount"] = pts["high_amount"]
                reasons.append(
                    f"Simulated transaction amount (demo units: {features.simulated_amount:,.0f}) "
                    f"exceeds the configured screening threshold of {self.config['high_amount_threshold']:,}."
                )
        else:
            data_quality_notes.append("Simulated amount not provided — amount-based rules not applied.")
            raw_points["missing_amount"] = pts["missing_amount"]

        # Rule 2: Multiple reports share same synthetic destination reference
        if features.reports_sharing_destination >= self.config["shared_dest_count_threshold"]:
            raw_points["shared_destination"] = pts["shared_destination"]
            reasons.append(
                f"{features.reports_sharing_destination} other report(s) reference the same synthetic "
                f"destination identifier. This may indicate a pattern worth investigating."
            )

        # Rule 3: Reporter submitted many reports in a short period
        if features.reporter_reports_last_24h >= self.config["rapid_report_count_threshold"]:
            raw_points["rapid_reports"] = pts["rapid_reports"]
            reasons.append(
                f"The reporter submitted {features.reporter_reports_last_24h} reports in the last 24 hours, "
                f"which exceeds the configured demo frequency threshold."
            )

        # Rule 4: Missing incident date
        if features.incident_date is None:
            raw_points["missing_date"] = pts["missing_date"]
            data_quality_notes.append("Incident date not provided — temporal analysis not possible.")

        # Rule 5: Suspicious synthetic indicators present
        if features.synthetic_indicators:
            indicator_list = [i.strip() for i in features.synthetic_indicators.split(",") if i.strip()]
            if indicator_list:
                raw_points["suspicious_indicators"] = pts["suspicious_indicators"]
                reasons.append(
                    f"Report includes {len(indicator_list)} synthetic indicator(s) flagged for investigation."
                )

        # Rule 6: Multiple reports share synthetic indicators
        if features.shared_indicator_count >= 2:
            raw_points["multiple_shared_indicators"] = pts["multiple_shared_indicators"]
            reasons.append(
                f"{features.shared_indicator_count} reports share at least one synthetic indicator with this report."
            )

        # Rule 7: Low quality description
        if len(features.description) < self.config["min_description_length"]:
            raw_points["low_quality_description"] = pts["low_quality_description"]
            data_quality_notes.append(
                "Description is shorter than the recommended minimum. "
                "A brief description limits the quality of the analysis."
            )

        # Aggregate score (capped at 100)
        total = min(sum(raw_points.values()), 100)
        level = _risk_level(total)

        limitations = [
            "This risk score is a screening signal produced by a rule-based prototype engine.",
            "A high score does not constitute proof of fraud or criminal activity.",
            "A low score does not exclude the possibility of fraud.",
            "All amounts, identifiers and indicators in this demo are synthetic and fictional.",
            f"Engine version: {ENGINE_VERSION}. Rules and thresholds are configurable.",
        ]

        return RiskResult(
            report_id=features.report_id,
            risk_score=total,
            risk_level=level,
            reasons=reasons if reasons else ["No significant risk indicators detected by current rules."],
            model_version=ENGINE_VERSION,
            analyzed_at=datetime.now(timezone.utc).isoformat(),
            limitations=limitations,
            data_quality_notes=data_quality_notes,
            raw_points=raw_points,
        )


# Singleton instance
_engine = FraudRiskEngine()


def get_engine() -> FraudRiskEngine:
    return _engine
