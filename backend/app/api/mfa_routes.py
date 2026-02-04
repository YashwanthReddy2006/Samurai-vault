"""MFA API routes."""

from fastapi import APIRouter, Request, HTTPException, status, Depends
from app.db.models import MFASetupResponse, MFAVerifyRequest, MFAStatusResponse
from app.db import user_repo
from app.mfa import totp_manager
from app.crypto import key_manager, mfa_crypto
from app.middleware import get_current_user
from app.utils import logger

router = APIRouter(prefix="/api/mfa", tags=["MFA"])


@router.get("/status", response_model=MFAStatusResponse)
async def get_mfa_status(user: dict = Depends(get_current_user)):
    """Get current MFA status."""
    return MFAStatusResponse(enabled=bool(user["mfa_enabled"]))


@router.post("/setup", response_model=MFASetupResponse)
async def setup_mfa(
    request: Request,
    user: dict = Depends(get_current_user),
):
    """Set up MFA - returns secret and QR code."""
    if user["mfa_enabled"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA is already enabled",
        )
    
    # Get master password for encryption
    master_password = request.headers.get("X-Master-Password")
    if not master_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Master password required",
        )
    
    # Generate TOTP secret
    secret = totp_manager.generate_secret()
    provisioning_uri = totp_manager.get_provisioning_uri(secret, user["email"])
    qr_code = totp_manager.generate_qr_code(provisioning_uri)
    
    # Store secret temporarily in response (user must verify to finalize)
    # In a real app, you might store it encrypted but not enable MFA until verified
    
    return MFASetupResponse(
        secret=secret,
        qr_code=qr_code,
        provisioning_uri=provisioning_uri,
    )


@router.post("/enable")
async def enable_mfa(
    request: Request,
    data: MFAVerifyRequest,
    user: dict = Depends(get_current_user),
):
    """Verify and enable MFA."""
    if user["mfa_enabled"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA is already enabled",
        )
    
    # Get master password and secret
    master_password = request.headers.get("X-Master-Password")
    secret = request.headers.get("X-MFA-Secret")
    
    if not master_password or not secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Master password and MFA secret required",
        )
    
    # Verify the code
    if not totp_manager.verify_code(secret, data.code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid MFA code",
        )
    
    # Encrypt and store the secret
    salt = key_manager.decode_salt(user["salt"])
    encryption_key = key_manager.derive_key(master_password, salt)
    encrypted_secret = mfa_crypto.encrypt_secret(secret, encryption_key)
    
    await user_repo.enable_mfa(user["id"], encrypted_secret)
    
    logger.info(f"MFA enabled for user {user['email']}")
    
    return {"message": "MFA enabled successfully"}


@router.post("/disable")
async def disable_mfa(
    request: Request,
    data: MFAVerifyRequest,
    user: dict = Depends(get_current_user),
):
    """Disable MFA (requires current MFA code)."""
    if not user["mfa_enabled"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA is not enabled",
        )
    
    # Get master password to decrypt secret
    master_password = request.headers.get("X-Master-Password")
    if not master_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Master password required",
        )
    
    # Decrypt and verify
    salt = key_manager.decode_salt(user["salt"])
    encryption_key = key_manager.derive_key(master_password, salt)
    
    try:
        secret = mfa_crypto.decrypt_secret(user["mfa_secret_encrypted"], encryption_key)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid master password",
        )
    
    if not totp_manager.verify_code(secret, data.code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid MFA code",
        )
    
    await user_repo.disable_mfa(user["id"])
    
    logger.info(f"MFA disabled for user {user['email']}")
    
    return {"message": "MFA disabled successfully"}
