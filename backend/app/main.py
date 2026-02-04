"""SamuraiVault - Password Manager API."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import get_settings
from app.db import db
from app.api import auth_router, vault_router, mfa_router, analytics_router, health_router
from app.middleware import limiter, rate_limit_handler
from app.utils import logger

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    await db.connect()
    await db.init_schema()
    logger.info("Database initialized")
    
    yield
    
    # Shutdown
    await db.disconnect()
    logger.info("Application shutdown complete")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="A secure password manager with samurai theme",
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

# Add rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_handler)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(vault_router)
app.include_router(mfa_router)
app.include_router(analytics_router)


@app.get("/")
async def root():
    """Root endpoint - redirect to docs."""
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "docs": "/docs",
        "health": "/api/health",
    }
