"""Pydantic models for request/response validation."""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field


# ============== Auth Models ==============

class UserRegister(BaseModel):
    """User registration request."""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    master_password: str = Field(..., min_length=12, max_length=128)


class UserLogin(BaseModel):
    """User login request."""
    email: EmailStr
    master_password: str
    mfa_code: Optional[str] = None


class UserResponse(BaseModel):
    """User response (no sensitive data)."""
    id: str
    email: str
    username: str
    mfa_enabled: bool
    created_at: str


class TokenResponse(BaseModel):
    """Authentication token response."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


# ============== Vault Models ==============

class VaultEntryCreate(BaseModel):
    """Create vault entry request."""
    title: str = Field(..., min_length=1, max_length=200)
    username: Optional[str] = Field(None, max_length=200)
    password: str = Field(..., min_length=1, max_length=500)
    url: Optional[str] = Field(None, max_length=2048)
    notes: Optional[str] = Field(None, max_length=5000)
    category: Optional[str] = Field(None, max_length=50)
    favorite: bool = False


class VaultEntryUpdate(BaseModel):
    """Update vault entry request."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    username: Optional[str] = Field(None, max_length=200)
    password: Optional[str] = Field(None, min_length=1, max_length=500)
    url: Optional[str] = Field(None, max_length=2048)
    notes: Optional[str] = Field(None, max_length=5000)
    category: Optional[str] = Field(None, max_length=50)
    favorite: Optional[bool] = None


class VaultEntryResponse(BaseModel):
    """Vault entry response (password masked for list)."""
    id: str
    title: str
    username: Optional[str]
    url: Optional[str]
    category: Optional[str]
    favorite: bool
    strength_score: Optional[int] = None
    created_at: str
    updated_at: str


class VaultEntryDetail(VaultEntryResponse):
    """Vault entry with password (for single view)."""
    password: str
    notes: Optional[str]


# ============== MFA Models ==============

class MFASetupResponse(BaseModel):
    """MFA setup response."""
    secret: str  # Only shown during setup
    qr_code: str  # Base64 QR code image
    provisioning_uri: str


class MFAVerifyRequest(BaseModel):
    """MFA verification request."""
    code: str = Field(..., min_length=6, max_length=6)


class MFAStatusResponse(BaseModel):
    """MFA status response."""
    enabled: bool


# ============== Analytics Models ==============

class PasswordStrength(BaseModel):
    """Password strength details."""
    score: int  # 0-100
    label: str  # weak, fair, good, strong, excellent
    suggestions: List[str]


class AnalyticsDashboard(BaseModel):
    """Analytics dashboard response."""
    total_passwords: int
    weak_passwords: int
    reused_passwords: int
    old_passwords: int
    breached_passwords: int
    average_strength: float
    category_breakdown: dict
