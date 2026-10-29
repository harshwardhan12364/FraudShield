"""Pydantic schemas for authentication and user management."""
import re
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator


PASSWORD_RE = re.compile(
    r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]).{10,72}$"
)

ALLOWED_ROLES = {"reporter", "analyst", "admin"}


class UserRegister(BaseModel):
    email: EmailStr
    display_name: str = Field(min_length=2, max_length=100)
    password: str = Field(min_length=10, max_length=72)

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not PASSWORD_RE.match(v):
            raise ValueError(
                "Password must be 10-72 chars and contain uppercase, lowercase, digit, and special character."
            )
        return v

    @field_validator("display_name")
    @classmethod
    def sanitize_name(cls, v: str) -> str:
        return v.strip()


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=200)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class UserResponse(BaseModel):
    id: str
    email: str
    display_name: str
    role: str
    is_active: bool
    created_at: str

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    display_name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    is_active: Optional[bool] = None
    role: Optional[str] = None

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in ALLOWED_ROLES:
            raise ValueError(f"Role must be one of {ALLOWED_ROLES}")
        return v
