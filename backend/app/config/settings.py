"""
Application configuration loaded from environment variables.

Uses pydantic-settings so values can be supplied via .env or the process environment.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central place for tunable app settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Full SQLAlchemy database URL
    database_url: str = "postgresql://postgres:postgres@localhost:5432/quickbill"

    # Browser origins allowed to call the API (CORS)
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174"

    # Versioned API path prefix
    api_v1_prefix: str = "/api/v1"

    # Dev-only: if set to true, the app will drop and recreate tables on startup.
    # This is useful when switching schema versions during local development.
    #
    # IMPORTANT: For production, keep this false and use migrations (e.g. Alembic).
    recreate_tables_on_startup: bool = False

    @property
    def cors_origin_list(self) -> list[str]:
        """Split comma-separated CORS origins into a list."""
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    """Cached settings singleton (safe for import-time use)."""
    return Settings()
