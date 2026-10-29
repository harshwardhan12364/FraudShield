"""
FraudShield 360 — FastAPI Application Entry Point

Security features applied at startup:
- CORS with explicit origins
- Rate limiting via SlowAPI
- Security response headers middleware
- Structured error handling (no stack traces to clients)
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
try:
    from slowapi import Limiter, _rate_limit_exceeded_handler
    from slowapi.errors import RateLimitExceeded
    from slowapi.middleware import SlowAPIMiddleware
    from slowapi.util import get_remote_address
    HAS_SLOWAPI = True
except ImportError:
    HAS_SLOWAPI = False
    class Limiter:
        def __init__(self, *args, **kwargs):
            pass
        def limit(self, *args, **kwargs):
            def decorator(f):
                return f
            return decorator
    class RateLimitExceeded(Exception):
        pass
    def _rate_limit_exceeded_handler(request, exc):
        return JSONResponse({"detail": "Rate limit exceeded"}, status_code=429)
    def get_remote_address(request):
        return "127.0.0.1"

from starlette.middleware.base import BaseHTTPMiddleware

from app.api.routes import auth, reports, evidence, investigations, admin
from app.core.config import get_settings
from app.db.database import init_db
from app.services.seeder import seed_demo_data

logger = logging.getLogger(__name__)
settings = get_settings()

# ── Rate limiter ──────────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])


# ── Lifespan (startup / shutdown) ─────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("FraudShield 360 starting up. Environment: %s", settings.APP_ENV)
    await init_db()
    await seed_demo_data()
    yield
    logger.info("FraudShield 360 shutting down.")


# ── App ───────────────────────────────────────────────────────────────────
app = FastAPI(
    title="FraudShield 360 API",
    description="Secure AI-Assisted Fraud Intelligence and Blockchain Evidence Verification",
    version="1.0.0",
    docs_url="/api/docs" if settings.APP_DEBUG else None,
    redoc_url="/api/redoc" if settings.APP_DEBUG else None,
    lifespan=lifespan,
)

# Rate limiting
if HAS_SLOWAPI:
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)

# CORS — explicit allowed origins only
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.APP_FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


# Security headers middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        if settings.APP_ENV == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response


app.add_middleware(SecurityHeadersMiddleware)

# ── Global error handler ───────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception on %s %s", request.method, request.url)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal error occurred. Please try again later."},
    )

# ── Routers ────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(reports.router)
app.include_router(evidence.router)
app.include_router(investigations.router)
app.include_router(admin.router)


# ── Health endpoints ───────────────────────────────────────────────────────
@app.get("/health/live", tags=["health"])
async def live():
    return {"status": "ok"}


@app.get("/health/ready", tags=["health"])
async def ready():
    from app.db.database import engine
    try:
        async with engine.connect() as conn:
            await conn.execute(__import__("sqlalchemy").text("SELECT 1"))
        return {"status": "ready", "database": "connected"}
    except Exception:
        return JSONResponse(status_code=503, content={"status": "not_ready", "database": "unavailable"})


@app.get("/api/stats", tags=["stats"])
async def public_stats():
    """Returns aggregate demo statistics (no PII)."""
    from app.db.database import AsyncSessionLocal
    from app.models.report import Report
    from app.models.user import User
    from sqlalchemy import select, func

    async with AsyncSessionLocal() as db:
        total_reports = (await db.execute(select(func.count()).select_from(Report))).scalar_one()
        pending = (await db.execute(
            select(func.count()).select_from(Report).where(Report.status.in_(["submitted", "under_review"]))
        )).scalar_one()
        high_risk = (await db.execute(
            select(func.count()).select_from(Report).where(Report.risk_level == "high")
        )).scalar_one()
        total_users = (await db.execute(select(func.count()).select_from(User))).scalar_one()

    return {
        "total_reports": total_reports,
        "pending_review": pending,
        "high_risk_reports": high_risk,
        "registered_users": total_users,
        "disclaimer": "All figures are based on synthetic demo data.",
    }
