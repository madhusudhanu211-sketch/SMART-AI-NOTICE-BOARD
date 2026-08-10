import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

# Resolve the backend root directory (two levels up: app/core/ -> app/ -> backend/)
BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent
ENV_FILE = BACKEND_ROOT / ".env"

class Settings(BaseSettings):
    PROJECT_NAME: str = "Smart Notice Board API"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "smart-notice-board-super-secret-jwt-key-production-grade"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200

    DATABASE_URL: str = "sqlite:///./smart_notice_board.db"

    GEMINI_API_KEY: Optional[str] = ""

    CLOUDINARY_CLOUD_NAME: Optional[str] = ""
    CLOUDINARY_API_KEY: Optional[str] = ""
    CLOUDINARY_API_SECRET: Optional[str] = ""

    model_config = SettingsConfigDict(env_file=str(ENV_FILE), extra="ignore")

settings = Settings()

