import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    APP_NAME: str = "CYBER FLOCK DEFENSE HUB"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = Field(
        default=os.getenv(
            "DATABASE_URL",
            f"sqlite:///{os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'cyber_flock.db').replace(chr(92), '/')}"
        )
    )

    # Security & JWT
    JWT_SECRET_KEY: str = Field(default="cyberflock_super_secret_jwt_encryption_key_change_in_production_987654321")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    # Initial Admin Seed
    ADMIN_EMAIL: str = Field(default="admin@cyberflock.defense")
    ADMIN_PASSWORD: str = Field(default="AdminSecurePassword123!")
    ADMIN_NAME: str = "Super Administrator"

    # Blockchain
    BLOCKCHAIN_RPC_URL: str = "http://localhost:8545"
    CONTRACT_ADDRESS: str = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    DEPLOYER_PRIVATE_KEY: str = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

    # Google OAuth
    GOOGLE_CLIENT_ID: str = "mock-google-client-id"
    GOOGLE_CLIENT_SECRET: str = "mock-google-client-secret"
    GOOGLE_REDIRECT_URI: str = "http://localhost:5173/auth/google/callback"

    # Market Intelligence
    ENABLE_MARKET_INTELLIGENCE: bool = True
    MARKET_DATA_PROVIDER: str = "demo"

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 120

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
