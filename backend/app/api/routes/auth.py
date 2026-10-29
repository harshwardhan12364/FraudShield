"""Authentication routes: register, login, logout, me."""
import json
import logging
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.core.security import hash_password, verify_password, create_access_token, needs_rehash
from app.db.database import get_db
from app.models.audit import AuditEvent
from app.models.user import User
from app.schemas.auth import UserLogin, UserRegister, UserResponse, TokenResponse

logger = logging.getLogger(__name__)
settings = get_settings()
router = APIRouter(prefix="/api/auth", tags=["auth"])

# Max failed attempts before soft lockout
MAX_ATTEMPTS = 5
LOCKOUT_MINUTES = 15


async def _log_event(db: AsyncSession, event_type: str, actor_id=None, detail=None, ip=None):
    event = AuditEvent(
        event_type=event_type,
        actor_id=actor_id,
        detail=json.dumps(detail) if detail else None,
        ip_address=ip,
    )
    db.add(event)
    await db.flush()


def _get_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    body: UserRegister,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Register a new reporter account. Returns generic error on conflict."""
    # Check for duplicate — but return generic error to avoid user enumeration
    existing = await db.execute(select(User).where(User.email == body.email.lower()))
    if existing.scalar_one_or_none() is not None:
        # Deliberate generic message
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration could not be completed. Please check your details.",
        )

    user = User(
        email=body.email.lower(),
        display_name=body.display_name,
        hashed_password=hash_password(body.password),
        role="reporter",  # NEVER allow self-assignment of analyst/admin
        is_active=True,
        is_verified=False,
    )
    db.add(user)
    await db.flush()
    await _log_event(db, "USER_REGISTERED", actor_id=user.id, ip=_get_ip(request))
    await db.commit()
    await db.refresh(user)
    return _user_response(user)


@router.post("/login", response_model=TokenResponse)
async def login(
    body: UserLogin,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """
    Authenticate with email and password.
    Returns JWT in HttpOnly cookie + response body.
    Uses generic error messages (no account enumeration).
    """
    ip = _get_ip(request)
    GENERIC_ERROR = "Invalid credentials."

    result = await db.execute(select(User).where(User.email == body.email.lower()))
    user = result.scalar_one_or_none()

    # Timing-safe: always hash even if user not found
    if user is None:
        hash_password("dummy_timing_equalizer_pwd_!!")
        await _log_event(db, "LOGIN_FAILED_NO_ACCOUNT", detail={"email_domain": body.email.split("@")[-1]}, ip=ip)
        await db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=GENERIC_ERROR)

    # Lockout check
    now = datetime.now(timezone.utc)
    if user.locked_until and user.locked_until > now:
        await _log_event(db, "LOGIN_BLOCKED_LOCKOUT", actor_id=user.id, ip=ip)
        await db.commit()
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Account temporarily locked.")

    if not user.is_active:
        await _log_event(db, "LOGIN_FAILED_INACTIVE", actor_id=user.id, ip=ip)
        await db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=GENERIC_ERROR)

    if not verify_password(body.password, user.hashed_password):
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= MAX_ATTEMPTS:
            user.locked_until = now + timedelta(minutes=LOCKOUT_MINUTES)
            await _log_event(db, "ACCOUNT_LOCKED", actor_id=user.id, ip=ip)
        else:
            await _log_event(db, "LOGIN_FAILED_WRONG_PASSWORD", actor_id=user.id, ip=ip)
        await db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=GENERIC_ERROR)

    # Successful login
    user.failed_login_attempts = 0
    user.locked_until = None
    user.last_login_at = now

    # Rehash if needed (parameter upgrade)
    if needs_rehash(user.hashed_password):
        user.hashed_password = hash_password(body.password)

    token_expires = timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    token = create_access_token(user.id, user.role, token_expires)

    await _log_event(db, "LOGIN_SUCCESS", actor_id=user.id, ip=ip)
    await db.commit()

    # Set HttpOnly cookie
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=settings.APP_ENV == "production",
        samesite="lax",
        max_age=settings.JWT_EXPIRE_MINUTES * 60,
        path="/",
    )

    return TokenResponse(
        access_token=token,
        expires_in=settings.JWT_EXPIRE_MINUTES * 60,
    )


@router.post("/logout")
async def logout(response: Response, current_user: User = Depends(get_current_user)):
    """Clear session cookie."""
    response.delete_cookie("access_token", path="/")
    return {"message": "Logged out successfully."}


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    """Return current authenticated user details."""
    return _user_response(current_user)


def _user_response(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "display_name": user.display_name,
        "role": user.role,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat(),
    }
