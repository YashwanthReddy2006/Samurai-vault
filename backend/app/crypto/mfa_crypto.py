"""MFA secret encryption."""

from .vault_crypto import vault_crypto


class MFACrypto:
    """Handles encryption of MFA secrets."""
    
    def encrypt_secret(self, secret: str, key: bytes) -> str:
        """Encrypt MFA TOTP secret."""
        return vault_crypto.encrypt(secret, key)
    
    def decrypt_secret(self, encrypted_secret: str, key: bytes) -> str:
        """Decrypt MFA TOTP secret."""
        return vault_crypto.decrypt(encrypted_secret, key)


# Global instance
mfa_crypto = MFACrypto()
