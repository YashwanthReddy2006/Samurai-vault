"""Vault service for password management."""

from typing import Optional, List, Dict, Any
from app.crypto import vault_crypto
from app.db import vault_repo, audit_repo
from app.db.models import VaultEntryCreate, VaultEntryUpdate, VaultEntryResponse, VaultEntryDetail
from app.services.strength_service import strength_service
from app.utils import logger


class VaultService:
    """Handles vault entry CRUD operations with encryption."""
    
    async def add_entry(
        self,
        user_id: str,
        data: VaultEntryCreate,
        encryption_key: bytes,
        ip_address: Optional[str] = None,
    ) -> VaultEntryDetail:
        """Add a new vault entry."""
        # Prepare entry data
        entry_data = {
            "title": data.title,
            "username": data.username,
            "password": data.password,
            "url": data.url,
            "notes": data.notes,
        }
        
        # Encrypt the entry
        encrypted_data = vault_crypto.encrypt_entry(entry_data, encryption_key)
        
        # Store in database
        entry = await vault_repo.create(
            user_id=user_id,
            encrypted_data=encrypted_data,
            category=data.category,
            favorite=data.favorite,
        )
        
        # Log audit
        await audit_repo.log(
            action="vault_entry_added",
            user_id=user_id,
            details=f"Entry: {data.title}",
            ip_address=ip_address,
        )
        
        logger.info(f"Vault entry added for user {user_id}")
        
        # Calculate strength
        score, _, _ = strength_service.analyze(data.password)
        
        return VaultEntryDetail(
            id=entry["id"],
            title=data.title,
            username=data.username,
            password=data.password,
            url=data.url,
            notes=data.notes,
            category=data.category,
            favorite=data.favorite,
            strength_score=score,
            created_at=entry["created_at"],
            updated_at=entry["updated_at"],
        )
    
    async def get_entries(
        self,
        user_id: str,
        encryption_key: bytes,
    ) -> List[VaultEntryResponse]:
        """Get all vault entries for a user (without passwords)."""
        entries = await vault_repo.get_by_user(user_id)
        result = []
        
        for entry in entries:
            try:
                decrypted = vault_crypto.decrypt_entry(entry["encrypted_data"], encryption_key)
                
                # Calculate strength
                score, _, _ = strength_service.analyze(decrypted.get("password", ""))
                
                result.append(VaultEntryResponse(
                    id=entry["id"],
                    title=decrypted.get("title", ""),
                    username=decrypted.get("username"),
                    url=decrypted.get("url"),
                    category=entry["category"],
                    favorite=bool(entry["favorite"]),
                    strength_score=score,
                    created_at=entry["created_at"],
                    updated_at=entry["updated_at"],
                ))
            except Exception as e:
                logger.error(f"Failed to decrypt entry {entry['id']}: {e}")
                continue
        
        return result
    
    async def get_entry(
        self,
        entry_id: str,
        user_id: str,
        encryption_key: bytes,
    ) -> Optional[VaultEntryDetail]:
        """Get a single vault entry with password."""
        entry = await vault_repo.get_by_id(entry_id)
        
        if not entry or entry["user_id"] != user_id:
            return None
        
        try:
            decrypted = vault_crypto.decrypt_entry(entry["encrypted_data"], encryption_key)
            
            score, _, _ = strength_service.analyze(decrypted.get("password", ""))
            
            return VaultEntryDetail(
                id=entry["id"],
                title=decrypted.get("title", ""),
                username=decrypted.get("username"),
                password=decrypted.get("password", ""),
                url=decrypted.get("url"),
                notes=decrypted.get("notes"),
                category=entry["category"],
                favorite=bool(entry["favorite"]),
                strength_score=score,
                created_at=entry["created_at"],
                updated_at=entry["updated_at"],
            )
        except Exception as e:
            logger.error(f"Failed to decrypt entry {entry_id}: {e}")
            return None
    
    async def update_entry(
        self,
        entry_id: str,
        user_id: str,
        data: VaultEntryUpdate,
        encryption_key: bytes,
        ip_address: Optional[str] = None,
    ) -> Optional[VaultEntryDetail]:
        """Update a vault entry."""
        entry = await vault_repo.get_by_id(entry_id)
        
        if not entry or entry["user_id"] != user_id:
            return None
        
        # Decrypt existing data
        try:
            existing = vault_crypto.decrypt_entry(entry["encrypted_data"], encryption_key)
        except Exception:
            return None
        
        # Update fields
        if data.title is not None:
            existing["title"] = data.title
        if data.username is not None:
            existing["username"] = data.username
        if data.password is not None:
            existing["password"] = data.password
        if data.url is not None:
            existing["url"] = data.url
        if data.notes is not None:
            existing["notes"] = data.notes
        
        # Re-encrypt
        encrypted_data = vault_crypto.encrypt_entry(existing, encryption_key)
        
        # Update in database
        updated = await vault_repo.update(
            entry_id=entry_id,
            encrypted_data=encrypted_data,
            category=data.category if data.category is not None else entry["category"],
            favorite=data.favorite if data.favorite is not None else bool(entry["favorite"]),
        )
        
        # Log audit
        await audit_repo.log(
            action="vault_entry_updated",
            user_id=user_id,
            details=f"Entry: {entry_id}",
            ip_address=ip_address,
        )
        
        score, _, _ = strength_service.analyze(existing.get("password", ""))
        
        return VaultEntryDetail(
            id=updated["id"],
            title=existing.get("title", ""),
            username=existing.get("username"),
            password=existing.get("password", ""),
            url=existing.get("url"),
            notes=existing.get("notes"),
            category=updated["category"],
            favorite=bool(updated["favorite"]),
            strength_score=score,
            created_at=updated["created_at"],
            updated_at=updated["updated_at"],
        )
    
    async def delete_entry(
        self,
        entry_id: str,
        user_id: str,
        ip_address: Optional[str] = None,
    ) -> bool:
        """Delete a vault entry."""
        entry = await vault_repo.get_by_id(entry_id)
        
        if not entry or entry["user_id"] != user_id:
            return False
        
        result = await vault_repo.delete(entry_id)
        
        if result:
            await audit_repo.log(
                action="vault_entry_deleted",
                user_id=user_id,
                details=f"Entry: {entry_id}",
                ip_address=ip_address,
            )
        
        return result


# Global instance
vault_service = VaultService()
