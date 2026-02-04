"""JWT authentication guard middleware."""

from typing import Optional, Tuple
from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.services import auth_service


security = HTTPBearer()


async def get_current_user(request: Request) -> dict:
    """Extract and validate current user from request."""
    auth_header = request.headers.get("Authorization")
    
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = auth_header.split(" ")[1]
    user = await auth_service.get_current_user(token)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


async def get_encryption_key(request: Request) -> bytes:
    """
    Get encryption key from request.
    
    For security, the master password is sent with each request that needs
    encryption/decryption. This ensures the key is never stored server-side.
    """
    master_password = request.headers.get("X-Master-Password")
    
    if not master_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Master password required for vault operations",
        )
    
    user = await get_current_user(request)
    key = await auth_service.get_derived_key(user["id"], master_password)
    
    if not key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid master password",
        )
    
    return key
