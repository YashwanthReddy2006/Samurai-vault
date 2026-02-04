"""Breach detection service."""

from typing import List, Dict, Any
from app.integrations import hibp_client


class BreachService:
    """Password breach detection using HIBP."""
    
    async def check_password(self, password: str) -> Dict[str, Any]:
        """Check if a single password has been breached."""
        is_breached, count = await hibp_client.check_password(password)
        
        return {
            "is_breached": is_breached,
            "breach_count": count,
            "message": f"Found in {count} data breaches" if is_breached else "No breaches found"
        }
    
    async def check_passwords_bulk(self, passwords: List[str]) -> Dict[str, Dict[str, Any]]:
        """Check multiple passwords for breaches."""
        results = {}
        
        for password in passwords:
            results[password] = await self.check_password(password)
        
        return results
    
    async def count_breached(self, passwords: List[str]) -> int:
        """Count how many passwords are breached."""
        count = 0
        
        for password in passwords:
            is_breached, _ = await hibp_client.check_password(password)
            if is_breached:
                count += 1
        
        return count


# Global instance
breach_service = BreachService()
