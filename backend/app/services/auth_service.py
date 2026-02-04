"""Authentication service."""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Tuple
from jose import jwt, JWTError

from app.config import get_settings
from app.crypto import key_manager
from app.db import user_repo, audit_repo
from app.db.models import UserRegister, UserResponse, TokenResponse
from app.mfa import totp_manager
from app.utils import logger

settings = get_settings()


class AuthService:
    """Handles user authentication and session management."""
    
    def _create_token(self, user_id: str, expires_delta: timedelta) -> str:
        """Create a JWT token."""
        expire = datetime.utcnow() + expires_delta
        payload = {
            "sub": user_id,
            "exp": expire,
            "iat": datetime.utcnow(),
        }
        return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    
    def _decode_token(self, token: str) -> Optional[str]:
        """Decode and validate a JWT token, return user_id."""
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            return payload.get("sub")
        except JWTError:
            return None
    
    async def register(
        self,
        data: UserRegister,
        ip_address: Optional[str] = None,
    ) -> Tuple[Optional[Dict[str, Any]], str]:
        """Register a new user."""
        # Check if email exists
        existing = await user_repo.get_by_email(data.email)
        if existing:
            return None, "Email already registered"
        
        # Check if username exists
        existing = await user_repo.get_by_username(data.username)
        if existing:
            return None, "Username already taken"
        
        # Generate salt and hash password
        salt = key_manager.generate_salt()
        password_hash = key_manager.hash_password(data.master_password)
        salt_b64 = key_manager.encode_salt(salt)
        
        # Create user
        user = await user_repo.create(
            email=data.email,
            username=data.username,
            password_hash=password_hash,
            salt=salt_b64,
        )
        
        # Log audit
        await audit_repo.log(
            action="user_registered",
            user_id=user["id"],
            ip_address=ip_address,
        )
        
        logger.info(f"User registered: {data.email}")
        return user, ""
    
    async def login(
        self,
        email: str,
        password: str,
        mfa_code: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> Tuple[Optional[TokenResponse], str]:
        """Authenticate user and return tokens."""
        # Get user
        user = await user_repo.get_by_email(email)
        if not user:
            await audit_repo.log(action="login_failed_no_user", details=email, ip_address=ip_address)
            return None, "Invalid credentials"
        
        # Verify password
        if not key_manager.verify_password(password, user["password_hash"]):
            await audit_repo.log(
                action="login_failed_wrong_password",
                user_id=user["id"],
                ip_address=ip_address,
            )
            return None, "Invalid credentials"
        
        # Check MFA
        if user["mfa_enabled"]:
            if not mfa_code:
                return None, "MFA code required"
            
            # Decrypt MFA secret
            salt = key_manager.decode_salt(user["salt"])
            derived_key = key_manager.derive_key(password, salt)
            
            from app.crypto import mfa_crypto
            try:
                mfa_secret = mfa_crypto.decrypt_secret(user["mfa_secret_encrypted"], derived_key)
            except Exception:
                return None, "MFA verification failed"
            
            if not totp_manager.verify_code(mfa_secret, mfa_code):
                await audit_repo.log(
                    action="login_failed_mfa",
                    user_id=user["id"],
                    ip_address=ip_address,
                )
                return None, "Invalid MFA code"
        
        # Create tokens
        access_token = self._create_token(
            user["id"],
            timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        
        # Update last login
        await user_repo.update_last_login(user["id"])
        
        # Log audit
        await audit_repo.log(
            action="login_success",
            user_id=user["id"],
            ip_address=ip_address,
        )
        
        logger.info(f"User logged in: {email}")
        
        return TokenResponse(
            access_token=access_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserResponse(
                id=user["id"],
                email=user["email"],
                username=user["username"],
                mfa_enabled=bool(user["mfa_enabled"]),
                created_at=user["created_at"],
            )
        ), ""
    
    async def get_current_user(self, token: str) -> Optional[Dict[str, Any]]:
        """Get current user from token."""
        user_id = self._decode_token(token)
        if not user_id:
            return None
        return await user_repo.get_by_id(user_id)
    
    async def get_derived_key(self, user_id: str, password: str) -> Optional[bytes]:
        """Get derived encryption key for a user."""
        user = await user_repo.get_by_id(user_id)
        if not user:
            return None
        
        salt = key_manager.decode_salt(user["salt"])
        return key_manager.derive_key(password, salt)


# Global instance
auth_service = AuthService()
