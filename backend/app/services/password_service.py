"""Password reuse detection service."""

from typing import List, Dict, Set
import hashlib


class PasswordService:
    """Detects password reuse across vault entries."""
    
    def _hash_password(self, password: str) -> str:
        """Create a hash for comparison (not for storage)."""
        return hashlib.sha256(password.encode()).hexdigest()
    
    def find_reused_passwords(self, entries: List[Dict]) -> Dict[str, List[str]]:
        """
        Find reused passwords across entries.
        
        Args:
            entries: List of decrypted entry dicts with 'id', 'title', 'password'
        
        Returns:
            Dict mapping password hash to list of entry titles that use it
        """
        password_map: Dict[str, List[str]] = {}
        
        for entry in entries:
            password = entry.get("password", "")
            if not password:
                continue
            
            pw_hash = self._hash_password(password)
            
            if pw_hash not in password_map:
                password_map[pw_hash] = []
            
            password_map[pw_hash].append(entry.get("title", entry.get("id", "Unknown")))
        
        # Filter to only reused passwords
        return {k: v for k, v in password_map.items() if len(v) > 1}
    
    def count_reused(self, entries: List[Dict]) -> int:
        """Count number of entries with reused passwords."""
        reused = self.find_reused_passwords(entries)
        return sum(len(titles) for titles in reused.values())
    
    def get_unique_passwords_count(self, entries: List[Dict]) -> int:
        """Count unique passwords."""
        seen: Set[str] = set()
        
        for entry in entries:
            password = entry.get("password", "")
            if password:
                seen.add(self._hash_password(password))
        
        return len(seen)


# Global instance
password_service = PasswordService()
