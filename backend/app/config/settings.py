"""Application configuration settings."""

import os
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Application
    APP_NAME: str = "SamuraiVault"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Security
    SECRET_KEY: str = os.urandom(32).hex()
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Crypto
    ARGON2_TIME_COST: int = 3
    ARGON2_MEMORY_COST: int = 65536
    ARGON2_PARALLELISM: int = 4
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./vault.db"
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    
    # HIBP API
    HIBP_API_URL: str = "https://api.pwnedpasswords.com/range/"
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://127.0.0.1:3000",
        # Production origins - will be updated after deployment
        "https://*.onrender.com",
    ]
    ALLOW_ALL_ORIGINS: bool = os.getenv("ALLOW_ALL_ORIGINS", "false").lower() == "true"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
