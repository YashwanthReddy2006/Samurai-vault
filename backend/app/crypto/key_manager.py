"""Master key derivation using Argon2id."""

import secrets
import base64
from argon2 import PasswordHasher
from argon2.low_level import hash_secret_raw, Type
from app.config import get_settings

settings = get_settings()


class KeyManager:
    """Handles master key derivation and password hashing."""
    
    def __init__(self):
        self.hasher = PasswordHasher(
            time_cost=settings.ARGON2_TIME_COST,
            memory_cost=settings.ARGON2_MEMORY_COST,
            parallelism=settings.ARGON2_PARALLELISM,
        )
    
    def generate_salt(self) -> bytes:
        """Generate a cryptographically secure random salt."""
        return secrets.token_bytes(32)
    
    def derive_key(self, master_password: str, salt: bytes) -> bytes:
        """Derive a 256-bit encryption key from master password."""
        key = hash_secret_raw(
            secret=master_password.encode('utf-8'),
            salt=salt,
            time_cost=settings.ARGON2_TIME_COST,
            memory_cost=settings.ARGON2_MEMORY_COST,
            parallelism=settings.ARGON2_PARALLELISM,
            hash_len=32,  # 256 bits
            type=Type.ID,
        )
        return key
    
    def hash_password(self, password: str) -> str:
        """Hash a password for storage (for user authentication)."""
        return self.hasher.hash(password)
    
    def verify_password(self, password: str, hash: str) -> bool:
        """Verify a password against its hash."""
        try:
            return self.hasher.verify(hash, password)
        except Exception:
            return False
    
    def encode_salt(self, salt: bytes) -> str:
        """Encode salt to base64 string for storage."""
        return base64.b64encode(salt).decode('utf-8')
    
    def decode_salt(self, salt_b64: str) -> bytes:
        """Decode salt from base64 string."""
        return base64.b64decode(salt_b64.encode('utf-8'))


# Global instance
key_manager = KeyManager()
