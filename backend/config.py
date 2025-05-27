"""Configuration settings for NOTEZ FUN Backend"""
import os
from typing import List
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

class Settings:
    """Application settings"""
    
    # Basic App Configuration
    APP_NAME: str = "NOTEZ FUN API"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = ENVIRONMENT == "development"
    
    # Server Configuration
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8001))
    
    # Database Configuration
    MONGO_URL: str = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    DB_NAME: str = os.getenv("DB_NAME", "notez_fun_db")
    
    # JWT Configuration
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "notez-fun-secret-key-2024")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_DAYS: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_DAYS", 7))
    
    # CORS Configuration
    CORS_ORIGINS: List[str] = [
        origin.strip() 
        for origin in os.getenv("CORS_ORIGINS", "*").split(",")
        if origin.strip()
    ]
    
    # Security Configuration
    OWNER_PASSWORD: str = os.getenv("OWNER_PASSWORD", "onlyOwner12$")
    BCRYPT_ROUNDS: int = int(os.getenv("BCRYPT_ROUNDS", 12))
    
    # Logging Configuration
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    # Email Configuration (for future features)
    SMTP_SERVER: str = os.getenv("SMTP_SERVER", "")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", 587))
    SMTP_USERNAME: str = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    
    @property
    def is_production(self) -> bool:
        """Check if running in production"""
        return self.ENVIRONMENT == "production"
    
    @property
    def is_development(self) -> bool:
        """Check if running in development"""
        return self.ENVIRONMENT == "development"

# Global settings instance
settings = Settings()

# Validate critical settings
if not settings.MONGO_URL:
    raise ValueError("MONGO_URL environment variable is required")

if not settings.JWT_SECRET_KEY:
    raise ValueError("JWT_SECRET_KEY environment variable is required")

# Production-specific validations
if settings.is_production:
    if settings.JWT_SECRET_KEY == "notez-fun-secret-key-2024":
        raise ValueError("Please set a secure JWT_SECRET_KEY for production")
    
    if len(settings.JWT_SECRET_KEY) < 32:
        raise ValueError("JWT_SECRET_KEY should be at least 32 characters long in production")
    
    if settings.OWNER_PASSWORD == "onlyOwner12$":
        print("WARNING: Using default owner password in production. Consider changing it.")
