import os
from pathlib import Path

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent.parent
env_file = BACKEND_DIR / ".env.backend.dev"
postgres_env_file = BACKEND_DIR / ".env.postgres"


class EnvModule:
    _module = os.getenv("DJANGO_SETTINGS_MODULE").split(".")[-1]

    @classmethod
    def is_local(cls) -> bool:
        return cls._module == "local"


class DatabaseSettings(BaseSettings):
    NAME: str = Field(alias="POSTGRES_DB")
    USER: str
    PASSWORD: str
    HOST: str = Field(
        alias="POSTGRES_HOST" if not EnvModule.is_local() else "POSTGRES_HOST_LOCAL"
    )
    PORT: int = Field(
        alias="POSTGRES_PORT" if not EnvModule.is_local() else "POSTGRES_PORT_LOCAL"
    )

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
