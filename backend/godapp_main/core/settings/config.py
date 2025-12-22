from pathlib import Path

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent.parent
env_file = BACKEND_DIR / ".env.backend.dev"
postgres_env_file = BACKEND_DIR / ".env.postgres"


class DatabaseSettings(BaseSettings):
    NAME: str = Field(alias="POSTGRES_DB")
    USER: str
    PASSWORD: str
    HOST: str = "postgres"
    PORT: int = 5432

    model_config = SettingsConfigDict(
        extra="allow",
        env_file=postgres_env_file,
        env_file_encoding="utf-8",
        env_prefix="POSTGRES_",
    )


class ConfigSettings(BaseSettings):
    SECRET_KEY: str
    ENCRYPTION_KEY: SecretStr
    DEBUG: bool = False
    ALLOWED_HOSTS: list[str] = []
    DB: DatabaseSettings = DatabaseSettings()

    model_config = SettingsConfigDict(
        extra="allow", env_file=env_file, env_file_encoding="utf-8"
    )


config = ConfigSettings()
