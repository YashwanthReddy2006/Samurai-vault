"""Analytics API routes."""

from fastapi import APIRouter, Request, Depends
from app.db.models import AnalyticsDashboard
from app.services import analytics_service
from app.middleware import get_current_user, get_encryption_key

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/dashboard", response_model=AnalyticsDashboard)
async def get_dashboard(
    request: Request,
    user: dict = Depends(get_current_user),
):
    """Get security analytics dashboard data."""
    key = await get_encryption_key(request)
    
    dashboard = await analytics_service.get_dashboard(
        user_id=user["id"],
        encryption_key=key,
    )
    
    return dashboard
