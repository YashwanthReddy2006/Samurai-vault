"""Authentication API routes."""

from fastapi import APIRouter, Request, HTTPException, status, Depends
from app.db.models import UserRegister, UserLogin, TokenResponse, UserResponse
from app.services import auth_service
from app.middleware import get_current_user, limiter
from app.utils import logger

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(request: Request, data: UserRegister):
    """Register a new user."""
    ip_address = request.client.host if request.client else None
    
    user, error = await auth_service.register(data, ip_address)
    
    if error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error,
        )
    
    return UserResponse(
        id=user["id"],
        email=user["email"],
        username=user["username"],
        mfa_enabled=bool(user["mfa_enabled"]),
        created_at=user["created_at"],
    )


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
async def login(request: Request, data: UserLogin):
    """Login with email and password."""
    ip_address = request.client.host if request.client else None
    
    token_response, error = await auth_service.login(
        email=data.email,
        password=data.master_password,
        mfa_code=data.mfa_code,
        ip_address=ip_address,
    )
    
    if error:
        if error == "MFA code required":
            raise HTTPException(
                status_code=status.HTTP_428_PRECONDITION_REQUIRED,
                detail=error,
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error,
        )
    
    return token_response


@router.get("/me", response_model=UserResponse)
async def get_me(request: Request, user: dict = Depends(get_current_user)):
    """Get current authenticated user."""
    return UserResponse(
        id=user["id"],
        email=user["email"],
        username=user["username"],
        mfa_enabled=bool(user["mfa_enabled"]),
        created_at=user["created_at"],
    )


@router.post("/logout")
async def logout(request: Request, user: dict = Depends(get_current_user)):
    """Logout (client should discard token)."""
    logger.info(f"User logged out: {user['email']}")
    return {"message": "Logged out successfully"}
