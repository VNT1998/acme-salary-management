from functools import lru_cache
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    DATABASE_PATH: str = "acme.db"
    SESSION_SECRET: str = "dev-secret-key-change-in-production-acme-salary-system-2026"
    SESSION_COOKIE_NAME: str = "acme_session"
    SESSION_COOKIE_SECURE: bool = False
    SESSION_COOKIE_SAMESITE: str = "lax"
    SESSION_EXPIRE_HOURS: int = 24
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def database_file_path(self) -> Path:
        return Path(self.DATABASE_PATH).resolve()


@lru_cache()
def get_settings() -> Settings:
    return Settings()
