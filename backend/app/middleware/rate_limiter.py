"""Rate limiting middleware."""

from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request
from fastapi.responses import JSONResponse


def get_user_identifier(request: Request) -> str:
    """Get identifier for rate limiting (IP or user ID)."""
    # Try to get user ID from auth header
    auth_header = request.headers.get("Authorization")
    if auth_header:
        return auth_header[:50]  # Use part of token as identifier
    
    # Fall back to IP address
    return get_remote_address(request)


limiter = Limiter(key_func=get_user_identifier)


async def rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    """Handle rate limit exceeded errors."""
    return JSONResponse(
        status_code=429,
        content={
            "error": "rate_limit_exceeded",
            "message": "Too many requests. Please try again later.",
            "retry_after": str(exc.detail),
        }
    )
