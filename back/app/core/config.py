import json
from typing import List, Union

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Meeting Management API"
    API_V1_STR: str = "/api/v1"

    POSTGRES_SERVER: str = "db"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "meetings_db"
    POSTGRES_PORT: int = 5432
    DATABASE_URL: str | None = None

    CORS_ORIGINS: Union[str, List[str]] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]

    @field_validator("CORS_ORIGINS", mode="after")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return []

    def get_database_url(self) -> str:
        if self.DATABASE_URL:
            # Handle possible postgres:// scheme to postgresql+asyncpg://
            url = self.DATABASE_URL
            if url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql+asyncpg://", 1)
            elif url.startswith("postgresql://") and not url.startswith(
                "postgresql+asyncpg://"
            ):
                url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
            return url
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow",
    )


settings = Settings()
