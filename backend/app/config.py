from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    VAULT_MASTER_KEY: str  # Base64 encoded 32-byte key
    INITIAL_USERNAME: str = "admin"
    INITIAL_PASSWORD: str = "change_me"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
