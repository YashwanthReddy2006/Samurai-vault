"""Analytics service for security insights."""

from typing import Dict, Any, List
from datetime import datetime, timedelta
from app.crypto import vault_crypto
from app.db import vault_repo
from app.db.models import AnalyticsDashboard
from app.services.strength_service import strength_service
from app.services.password_service import password_service


class AnalyticsService:
    """Security analytics and insights."""
    
    async def get_dashboard(
        self,
        user_id: str,
        encryption_key: bytes,
    ) -> AnalyticsDashboard:
        """Get comprehensive security analytics."""
        entries = await vault_repo.get_by_user(user_id)
        
        total_passwords = len(entries)
        weak_passwords = 0
        old_passwords = 0
        strength_scores = []
        category_breakdown = {}
        decrypted_entries = []
        
        # Threshold for old passwords (90 days)
        old_threshold = datetime.utcnow() - timedelta(days=90)
        
        for entry in entries:
            try:
                decrypted = vault_crypto.decrypt_entry(entry["encrypted_data"], encryption_key)
                password = decrypted.get("password", "")
                
                decrypted_entries.append({
                    "id": entry["id"],
                    "title": decrypted.get("title", ""),
                    "password": password,
                })
                
                # Strength analysis
                score, label, _ = strength_service.analyze(password)
                strength_scores.append(score)
                
                if label in ("weak", "fair"):
                    weak_passwords += 1
                
                # Check age
                updated_at = datetime.fromisoformat(entry["updated_at"].replace('Z', '+00:00'))
                if updated_at < old_threshold:
                    old_passwords += 1
                
                # Category breakdown
                category = entry.get("category") or "Uncategorized"
                category_breakdown[category] = category_breakdown.get(category, 0) + 1
                
            except Exception:
                continue
        
        # Calculate reused passwords
        reused_passwords = password_service.count_reused(decrypted_entries)
        
        # Calculate average strength
        average_strength = sum(strength_scores) / len(strength_scores) if strength_scores else 0
        
        return AnalyticsDashboard(
            total_passwords=total_passwords,
            weak_passwords=weak_passwords,
            reused_passwords=reused_passwords,
            old_passwords=old_passwords,
            breached_passwords=0,  # Async check would be slow for bulk
            average_strength=round(average_strength, 1),
            category_breakdown=category_breakdown,
        )


# Global instance
analytics_service = AnalyticsService()
