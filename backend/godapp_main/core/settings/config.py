from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class DatabaseSettings(BaseSettings):
    NAME: str = Field(alias="POSTGRES_DB")
    USER: str
    PASSWORD: str
    HOST: str = "postgres"
    PORT: int = 5432

    model_config = SettingsConfigDict(extra="allow", env_file=".env", env_file_encoding="utf-8", env_prefix="POSTGRES_")

class ConfigSettings(BaseSettings):
    SECRET_KEY: str
    DEBUG: bool = False
    ALLOWED_HOSTS: list[str] = []
    DB: DatabaseSettings = DatabaseSettings()

    model_config = SettingsConfigDict(extra="allow", env_file=".env", env_file_encoding="utf-8")
    
config = ConfigSettings()