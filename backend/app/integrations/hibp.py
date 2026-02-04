"""HIBP (Have I Been Pwned) integration for breach detection."""

import hashlib
import httpx
from typing import Tuple
from app.config import get_settings
from app.utils import logger

settings = get_settings()


class HIBPClient:
    """Have I Been Pwned API client using k-Anonymity."""
    
    def __init__(self):
        self.api_url = settings.HIBP_API_URL
        self.timeout = 10.0
    
    async def check_password(self, password: str) -> Tuple[bool, int]:
        """
        Check if password has been breached using k-Anonymity.
        
        Only sends first 5 chars of SHA-1 hash to API.
        
        Returns: (is_breached, breach_count)
        """
        if not password:
            return False, 0
        
        # Hash the password
        sha1_hash = hashlib.sha1(password.encode('utf-8')).hexdigest().upper()
        prefix = sha1_hash[:5]
        suffix = sha1_hash[5:]
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.api_url}{prefix}",
                    timeout=self.timeout,
                    headers={"User-Agent": "SamuraiVault-PasswordManager"}
                )
                
                if response.status_code != 200:
                    logger.warning(f"HIBP API returned status {response.status_code}")
                    return False, 0
                
                # Parse response
                hashes = response.text.splitlines()
                for line in hashes:
                    parts = line.split(':')
                    if len(parts) == 2:
                        hash_suffix, count = parts
                        if hash_suffix.upper() == suffix:
                            count = int(count)
                            logger.info(f"Password found in {count} breaches")
                            return True, count
                
                return False, 0
                
        except httpx.TimeoutException:
            logger.warning("HIBP API timeout")
            return False, 0
        except Exception as e:
            logger.error(f"HIBP API error: {e}")
            return False, 0


# Global instance
hibp_client = HIBPClient()
