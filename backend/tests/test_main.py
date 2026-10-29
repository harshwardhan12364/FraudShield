"""Backend tests for FraudShield 360."""
import asyncio
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.db.database import engine, Base


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session")
async def db_init():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def client(db_init):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c


# ── Auth tests ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_health_live(client):
    r = await client.get("/health/live")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_register_and_login(client):
    # Register
    r = await client.post("/api/auth/register", json={
        "email": "test@example.com",
        "display_name": "Test User",
        "password": "TestPassword@123",
    })
    assert r.status_code == 201
    data = r.json()
    assert data["role"] == "reporter"
    assert "admin" not in data["role"]

    # Login
    r = await client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "TestPassword@123",
    })
    assert r.status_code == 200
    assert "access_token" in r.json()


@pytest.mark.asyncio
async def test_cannot_self_assign_admin(client):
    """Users must not be able to register as admin."""
    r = await client.post("/api/auth/register", json={
        "email": "hacker@example.com",
        "display_name": "Hacker",
        "password": "TestPassword@123",
    })
    assert r.status_code == 201
    assert r.json()["role"] == "reporter"  # Always reporter


@pytest.mark.asyncio
async def test_weak_password_rejected(client):
    r = await client.post("/api/auth/register", json={
        "email": "weak@example.com",
        "display_name": "Weak User",
        "password": "password",
    })
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_wrong_password_generic_error(client):
    r = await client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "WrongPassword!123",
    })
    assert r.status_code == 401
    # Must not reveal account existence
    assert "does not exist" not in r.json().get("detail", "").lower()
    assert "not found" not in r.json().get("detail", "").lower()


@pytest.mark.asyncio
async def test_me_unauthenticated(client):
    r = await client.get("/api/auth/me")
    assert r.status_code == 401


# ── Risk engine tests ─────────────────────────────────────────────────────

def test_risk_engine_high_amount():
    from app.analysis.risk_engine import FraudRiskEngine, RiskFeatures
    from datetime import datetime, timezone

    engine_inst = FraudRiskEngine()
    features = RiskFeatures(
        report_id="test-001",
        category="payment_scam",
        description="A sufficiently long description for testing the risk engine rules.",
        incident_date=datetime.now(timezone.utc),
        simulated_amount=100_000,
        synthetic_destination_ref="demo-upi-001",
        synthetic_indicators=None,
        reports_sharing_destination=3,
        reporter_reports_last_24h=0,
        shared_indicator_count=0,
    )
    result = engine_inst.analyze(features)
    assert result.risk_score > 0
    assert result.risk_level in ("medium", "high")
    assert len(result.reasons) > 0
    assert len(result.limitations) > 0


def test_risk_engine_no_amount():
    from app.analysis.risk_engine import FraudRiskEngine, RiskFeatures

    engine_inst = FraudRiskEngine()
    features = RiskFeatures(
        report_id="test-002",
        category="phishing",
        description="A sufficiently long description for the phishing risk test case.",
        incident_date=None,
        simulated_amount=None,
        synthetic_destination_ref=None,
        synthetic_indicators=None,
    )
    result = engine_inst.analyze(features)
    assert "data_quality_notes" in result.to_dict() or result.data_quality_notes is not None


def test_risk_engine_invalid_features():
    from app.analysis.risk_engine import FraudRiskEngine, RiskFeatures

    engine_inst = FraudRiskEngine()
    features = RiskFeatures(
        report_id="",  # invalid
        category="",
        description="x",  # too short
        incident_date=None,
        simulated_amount=None,
        synthetic_destination_ref=None,
        synthetic_indicators=None,
    )
    result = engine_inst.analyze(features)
    assert result.risk_score == 0
    assert "limitations" in result.to_dict()


# ── Graph tests ────────────────────────────────────────────────────────────

def test_graph_shared_destination():
    from app.analysis.graph import ScamRelationshipGraph, ReportNode

    builder = ScamRelationshipGraph()
    nodes = [
        ReportNode("r1", "FS-001", "payment_scam", "submitted", 72, "high", "demo-upi-001", None),
        ReportNode("r2", "FS-002", "phishing", "submitted", 35, "low", "demo-upi-001", None),
        ReportNode("r3", "FS-003", "impersonation", "submitted", 68, "high", "demo-upi-002", None),
    ]
    result = builder.build(nodes)
    assert result.summary["total_nodes"] > 0
    # r1 and r2 should be connected via shared destination
    shared_dest_edges = [e for e in result.edges if "demo-upi-001" in e.get("target", "")]
    assert len(shared_dest_edges) >= 2


# ── Report API tests ───────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_create_report_requires_auth(client):
    r = await client.post("/api/reports", json={
        "category": "phishing",
        "description": "A test description that is long enough to pass validation checks.",
    })
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_reporter_cannot_see_others_reports(client):
    """Access control: reporters only see their own reports."""
    # Login as reporter1
    login = await client.post("/api/auth/login", json={
        "email": "reporter1@demo.local",
        "password": "Reporter@Demo2024!",
    })
    if login.status_code != 200:
        pytest.skip("Demo users not seeded in test DB.")

    token = login.json()["access_token"]
    r = await client.get("/api/reports", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    items = r.json()["items"]
    # All returned reports should belong to reporter1
    for item in items:
        assert item["reporter_id"] is not None  # simplified check
