"""Health check API routes."""

from fastapi import APIRouter
from app.config import get_settings

settings = get_settings()

router = APIRouter(tags=["Health"])


@router.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }
