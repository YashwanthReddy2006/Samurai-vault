"""TOTP (Time-based One-Time Password) implementation."""

import pyotp
import qrcode
import base64
from io import BytesIO


class TOTPManager:
    """Handles TOTP generation and verification."""
    
    ISSUER = "SamuraiVault"
    
    def generate_secret(self) -> str:
        """Generate a new TOTP secret."""
        return pyotp.random_base32()
    
    def get_provisioning_uri(self, secret: str, email: str) -> str:
        """Get provisioning URI for authenticator apps."""
        totp = pyotp.TOTP(secret)
        return totp.provisioning_uri(name=email, issuer_name=self.ISSUER)
    
    def generate_qr_code(self, provisioning_uri: str) -> str:
        """Generate QR code as base64 string."""
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(provisioning_uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        
        return base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    def verify_code(self, secret: str, code: str) -> bool:
        """Verify a TOTP code."""
        if not code or len(code) != 6:
            return False
        
        totp = pyotp.TOTP(secret)
        # Allow 1 window tolerance for clock drift
        return totp.verify(code, valid_window=1)
    
    def get_current_code(self, secret: str) -> str:
        """Get current TOTP code (for testing only)."""
        totp = pyotp.TOTP(secret)
        return totp.now()


# Global instance
totp_manager = TOTPManager()
