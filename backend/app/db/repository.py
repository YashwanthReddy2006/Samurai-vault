"""Database repository for CRUD operations."""

import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from .database import db


class UserRepository:
    """User database operations."""
    
    async def create(
        self,
        email: str,
        username: str,
        password_hash: str,
        salt: str,
    ) -> Dict[str, Any]:
        """Create a new user."""
        user_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        await db.execute(
            """
            INSERT INTO users (id, email, username, password_hash, salt, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (user_id, email, username, password_hash, salt, now, now)
        )
        
        return await self.get_by_id(user_id)
    
    async def get_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID."""
        row = await db.fetch_one(
            "SELECT * FROM users WHERE id = ?",
            (user_id,)
        )
        return dict(row) if row else None
    
    async def get_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email."""
        row = await db.fetch_one(
            "SELECT * FROM users WHERE email = ?",
            (email,)
        )
        return dict(row) if row else None
    
    async def get_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        """Get user by username."""
        row = await db.fetch_one(
            "SELECT * FROM users WHERE username = ?",
            (username,)
        )
        return dict(row) if row else None
    
    async def update_last_login(self, user_id: str):
        """Update last login timestamp."""
        now = datetime.utcnow().isoformat()
        await db.execute(
            "UPDATE users SET last_login = ?, updated_at = ? WHERE id = ?",
            (now, now, user_id)
        )
    
    async def enable_mfa(self, user_id: str, encrypted_secret: str):
        """Enable MFA for user."""
        now = datetime.utcnow().isoformat()
        await db.execute(
            """
            UPDATE users 
            SET mfa_enabled = 1, mfa_secret_encrypted = ?, updated_at = ? 
            WHERE id = ?
            """,
            (encrypted_secret, now, user_id)
        )
    
    async def disable_mfa(self, user_id: str):
        """Disable MFA for user."""
        now = datetime.utcnow().isoformat()
        await db.execute(
            """
            UPDATE users 
            SET mfa_enabled = 0, mfa_secret_encrypted = NULL, updated_at = ? 
            WHERE id = ?
            """,
            (now, user_id)
        )


class VaultRepository:
    """Vault entry database operations."""
    
    async def create(
        self,
        user_id: str,
        encrypted_data: str,
        category: Optional[str] = None,
        favorite: bool = False,
    ) -> Dict[str, Any]:
        """Create a new vault entry."""
        entry_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        await db.execute(
            """
            INSERT INTO vault_entries (id, user_id, encrypted_data, category, favorite, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (entry_id, user_id, encrypted_data, category, int(favorite), now, now)
        )
        
        return await self.get_by_id(entry_id)
    
    async def get_by_id(self, entry_id: str) -> Optional[Dict[str, Any]]:
        """Get entry by ID."""
        row = await db.fetch_one(
            "SELECT * FROM vault_entries WHERE id = ?",
            (entry_id,)
        )
        return dict(row) if row else None
    
    async def get_by_user(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all entries for a user."""
        rows = await db.fetch_all(
            "SELECT * FROM vault_entries WHERE user_id = ? ORDER BY created_at DESC",
            (user_id,)
        )
        return [dict(row) for row in rows]
    
    async def update(
        self,
        entry_id: str,
        encrypted_data: Optional[str] = None,
        category: Optional[str] = None,
        favorite: Optional[bool] = None,
    ) -> Optional[Dict[str, Any]]:
        """Update a vault entry."""
        now = datetime.utcnow().isoformat()
        
        updates = ["updated_at = ?"]
        params = [now]
        
        if encrypted_data is not None:
            updates.append("encrypted_data = ?")
            params.append(encrypted_data)
        if category is not None:
            updates.append("category = ?")
            params.append(category)
        if favorite is not None:
            updates.append("favorite = ?")
            params.append(int(favorite))
        
        params.append(entry_id)
        
        await db.execute(
            f"UPDATE vault_entries SET {', '.join(updates)} WHERE id = ?",
            tuple(params)
        )
        
        return await self.get_by_id(entry_id)
    
    async def delete(self, entry_id: str) -> bool:
        """Delete a vault entry."""
        cursor = await db.execute(
            "DELETE FROM vault_entries WHERE id = ?",
            (entry_id,)
        )
        return cursor.rowcount > 0
    
    async def count_by_user(self, user_id: str) -> int:
        """Count entries for a user."""
        row = await db.fetch_one(
            "SELECT COUNT(*) as count FROM vault_entries WHERE user_id = ?",
            (user_id,)
        )
        return row['count'] if row else 0


class AuditRepository:
    """Audit log database operations."""
    
    async def log(
        self,
        action: str,
        user_id: Optional[str] = None,
        details: Optional[str] = None,
        ip_address: Optional[str] = None,
    ):
        """Create audit log entry."""
        log_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        await db.execute(
            """
            INSERT INTO audit_log (id, user_id, action, details, ip_address, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (log_id, user_id, action, details, ip_address, now)
        )


# Global instances
user_repo = UserRepository()
vault_repo = VaultRepository()
audit_repo = AuditRepository()
