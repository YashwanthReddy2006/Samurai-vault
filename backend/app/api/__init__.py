from .auth_routes import router as auth_router
from .vault_routes import router as vault_router
from .mfa_routes import router as mfa_router
from .analytics_routes import router as analytics_router
from .health_routes import router as health_router

__all__ = [
    "auth_router",
    "vault_router",
    "mfa_router",
    "analytics_router",
    "health_router",
]
