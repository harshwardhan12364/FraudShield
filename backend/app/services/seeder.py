"""
Demo data seeder — creates synthetic reports, users, and blockchain records.
All identifiers are clearly fictional. No real personal data.
"""
from __future__ import annotations
import json
import logging
import uuid
from datetime import datetime, date, timezone, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.db.database import AsyncSessionLocal
from app.models.user import User
from app.models.report import Report
from app.models.audit import AuditEvent
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

DEMO_USERS = [
    {
        "email": "admin@fraudshield.local",
        "display_name": "System Administrator",
        "password": settings.BOOTSTRAP_ADMIN_PASSWORD or "Admin@FraudShield360!",
        "role": "admin",
    },
    {
        "email": "analyst@fraudshield.local",
        "display_name": "Senior Analyst",
        "password": "Analyst@Demo2024!",
        "role": "analyst",
    },
    {
        "email": "reporter1@demo.local",
        "display_name": "Demo Reporter Alice",
        "password": "Reporter@Demo2024!",
        "role": "reporter",
    },
    {
        "email": "reporter2@demo.local",
        "display_name": "Demo Reporter Bob",
        "password": "Reporter@Demo2024!",
        "role": "reporter",
    },
]

DEMO_REPORTS = [
    {
        "category": "payment_scam",
        "description": (
            "SYNTHETIC DEMO: Received a call from someone claiming to be a bank official. "
            "Was asked to transfer demo-amount to a 'safe account'. "
            "The destination reference matched a known demo pattern."
        ),
        "incident_date": date(2024, 8, 15),
        "simulated_amount": 75000.0,
        "synthetic_destination_ref": "demo-upi-001",
        "synthetic_indicators": "demo-url-fake-bank.example,demo-phone-+9100000001",
        "status": "under_review",
    },
    {
        "category": "phishing",
        "description": (
            "SYNTHETIC DEMO: Received an email with a link to a fake banking portal. "
            "The URL was designed to look legitimate but led to a cloned page. "
            "No real credentials were entered in this simulation."
        ),
        "incident_date": date(2024, 8, 20),
        "simulated_amount": 0.0,
        "synthetic_destination_ref": "demo-upi-002",
        "synthetic_indicators": "demo-url-fake-bank.example,demo-url-clone.example",
        "status": "submitted",
    },
    {
        "category": "impersonation",
        "description": (
            "SYNTHETIC DEMO: Individual received messages from an account impersonating a government agency. "
            "Was directed to pay a fictional fee via synthetic payment reference demo-upi-001."
        ),
        "incident_date": date(2024, 9, 1),
        "simulated_amount": 5000.0,
        "synthetic_destination_ref": "demo-upi-001",
        "synthetic_indicators": "demo-phone-+9100000002",
        "status": "substantiated",
        "review_note": "Synthetic destination ref matches report FS-001 — pattern confirmed in demo dataset.",
    },
    {
        "category": "fake_investment",
        "description": (
            "SYNTHETIC DEMO: Promised 40% monthly returns on a fictitious crypto investment platform. "
            "Funds transferred to demo-upi-003. Platform website was demo-url-fake-invest.example."
        ),
        "incident_date": date(2024, 9, 10),
        "simulated_amount": 200000.0,
        "synthetic_destination_ref": "demo-upi-003",
        "synthetic_indicators": "demo-url-fake-invest.example",
        "status": "submitted",
    },
    {
        "category": "account_takeover",
        "description": (
            "SYNTHETIC DEMO: Received an OTP (not real) request followed by unauthorized access to a demo account. "
            "Pattern consistent with SIM swap simulation."
        ),
        "incident_date": date(2024, 9, 18),
        "simulated_amount": 15000.0,
        "synthetic_destination_ref": "demo-upi-004",
        "status": "rejected",
        "review_note": "Insufficient synthetic evidence for substantiation in demo review.",
    },
    {
        "category": "payment_scam",
        "description": (
            "SYNTHETIC DEMO: QR code scam simulation. Reporter was sent a payment request QR code "
            "via messaging app. Destination was demo-upi-001."
        ),
        "incident_date": date(2024, 10, 2),
        "simulated_amount": 12000.0,
        "synthetic_destination_ref": "demo-upi-001",
        "status": "submitted",
    },
]


async def seed_demo_data():
    """Create demo users and reports if they do not already exist."""
    async with AsyncSessionLocal() as db:
        try:
            # Check if already seeded
            existing = (await db.execute(select(User).where(User.email == "admin@fraudshield.local"))).scalar_one_or_none()
            if existing:
                logger.info("Demo data already seeded. Skipping.")
                return

            logger.info("Seeding demo data...")

            # Create users
            created_users: dict[str, User] = {}
            for u_data in DEMO_USERS:
                user = User(
                    email=u_data["email"],
                    display_name=u_data["display_name"],
                    hashed_password=hash_password(u_data["password"]),
                    role=u_data["role"],
                    is_active=True,
                    is_verified=True,
                )
                db.add(user)
                await db.flush()
                created_users[u_data["email"]] = user

            reporter1 = created_users["reporter1@demo.local"]
            reporter2 = created_users["reporter2@demo.local"]
            analyst = created_users["analyst@fraudshield.local"]

            # Create reports
            reporters = [reporter1, reporter2, reporter1, reporter2, reporter1, reporter2]
            for i, r_data in enumerate(DEMO_REPORTS):
                report = Report(
                    reporter_id=reporters[i].id,
                    **{k: v for k, v in r_data.items() if k not in ["review_note"]},
                )
                if "review_note" in r_data:
                    report.review_note = r_data["review_note"]
                    report.reviewed_by_id = analyst.id
                    report.reviewed_at = datetime.now(timezone.utc)

                # Seed a fake risk score for demo
                report.risk_score = [72, 35, 68, 85, 20, 60][i]
                report.risk_level = ["high", "low", "high", "high", "minimal", "medium"][i]
                report.risk_reasons = json.dumps([
                    "Synthetic demo risk indicator applied.",
                    "This is a pre-seeded demonstration result.",
                ])
                report.risk_analyzed_at = datetime.now(timezone.utc)

                db.add(report)

            db.add(AuditEvent(event_type="DEMO_DATA_SEEDED", detail=json.dumps({"users": len(DEMO_USERS), "reports": len(DEMO_REPORTS)})))
            await db.commit()
            logger.info("Demo data seeded successfully.")

        except Exception as e:
            await db.rollback()
            logger.warning("Demo seeding failed (may already exist): %s", e)
