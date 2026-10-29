"""
Security utilities: password hashing (Argon2id) and JWT creation/verification.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
import secrets

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, InvalidHashError
from jose import JWTError, jwt

from app.core.config import get_settings

settings = get_settings()

# Argon2id with recommended parameters for interactive logins
_ph = PasswordHasher(
    time_cost=2,
    memory_cost=65536,  # 64 MB
    parallelism=2,
    hash_len=32,
    salt_len=16,
)


def hash_password(plaintext: str) -> str:
    """Return Argon2id hash of plaintext password."""
    return _ph.hash(plaintext)


def verify_password(plaintext: str, hashed: str) -> bool:
    """Return True if plaintext matches the stored hash."""
    try:
        return _ph.verify(hashed, plaintext)
    except (VerifyMismatchError, InvalidHashError):
        return False


def needs_rehash(hashed: str) -> bool:
    return _ph.check_needs_rehash(hashed)


def create_access_token(subject: str, role: str, expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT. Subject is user ID (as string)."""
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(minutes=settings.JWT_EXPIRE_MINUTES))
    payload = {
        "sub": subject,
        "role": role,
        "iat": now,
        "exp": expire,
        "jti": secrets.token_hex(16),  # unique token ID for future revocation
    }
    return jwt.encode(payload, settings.APP_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    """Decode and verify JWT. Raises JWTError on failure."""
    return jwt.decode(token, settings.APP_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
