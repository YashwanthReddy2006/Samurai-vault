"""Vault API routes."""

from typing import List
from fastapi import APIRouter, Request, HTTPException, status, Depends
from app.db.models import (
    VaultEntryCreate,
    VaultEntryUpdate,
    VaultEntryResponse,
    VaultEntryDetail,
    PasswordStrength,
)
from app.services import vault_service, strength_service, breach_service
from app.middleware import get_current_user, get_encryption_key

router = APIRouter(prefix="/api/vault", tags=["Vault"])


@router.get("/list", response_model=List[VaultEntryResponse])
async def list_entries(
    request: Request,
    user: dict = Depends(get_current_user),
):
    """List all vault entries (passwords masked)."""
    key = await get_encryption_key(request)
    entries = await vault_service.get_entries(user["id"], key)
    return entries


@router.post("/add", response_model=VaultEntryDetail, status_code=status.HTTP_201_CREATED)
async def add_entry(
    request: Request,
    data: VaultEntryCreate,
    user: dict = Depends(get_current_user),
):
    """Add a new password entry."""
    key = await get_encryption_key(request)
    ip_address = request.client.host if request.client else None
    
    entry = await vault_service.add_entry(
        user_id=user["id"],
        data=data,
        encryption_key=key,
        ip_address=ip_address,
    )
    
    return entry


@router.get("/{entry_id}", response_model=VaultEntryDetail)
async def get_entry(
    entry_id: str,
    request: Request,
    user: dict = Depends(get_current_user),
):
    """Get a single entry with password."""
    key = await get_encryption_key(request)
    
    entry = await vault_service.get_entry(
        entry_id=entry_id,
        user_id=user["id"],
        encryption_key=key,
    )
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entry not found",
        )
    
    return entry


@router.put("/{entry_id}", response_model=VaultEntryDetail)
async def update_entry(
    entry_id: str,
    data: VaultEntryUpdate,
    request: Request,
    user: dict = Depends(get_current_user),
):
    """Update a password entry."""
    key = await get_encryption_key(request)
    ip_address = request.client.host if request.client else None
    
    entry = await vault_service.update_entry(
        entry_id=entry_id,
        user_id=user["id"],
        data=data,
        encryption_key=key,
        ip_address=ip_address,
    )
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entry not found or access denied",
        )
    
    return entry


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_entry(
    entry_id: str,
    request: Request,
    user: dict = Depends(get_current_user),
):
    """Delete a password entry."""
    ip_address = request.client.host if request.client else None
    
    result = await vault_service.delete_entry(
        entry_id=entry_id,
        user_id=user["id"],
        ip_address=ip_address,
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entry not found or access denied",
        )


@router.post("/check-strength", response_model=PasswordStrength)
async def check_password_strength(
    request: Request,
    password: str,
):
    """Check password strength (no auth required)."""
    score, label, suggestions = strength_service.analyze(password)
    
    return PasswordStrength(
        score=score,
        label=label,
        suggestions=suggestions,
    )


@router.post("/check-breach")
async def check_password_breach(
    request: Request,
    password: str,
):
    """Check if password is in known breaches."""
    result = await breach_service.check_password(password)
    return result
