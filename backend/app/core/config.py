from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import Literal


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_ENV: Literal["development", "production", "test"] = "development"
    APP_SECRET_KEY: str = "insecure_dev_key"
    APP_FRONTEND_ORIGIN: str = "http://localhost:5173"
    APP_DEBUG: bool = True

    DATABASE_URL: str = "sqlite+aiosqlite:///./fraudshield.db"

    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60

    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE_MB: int = 10
    ALLOWED_EXTENSIONS: str = "pdf,jpg,jpeg,png,txt,csv"

    BLOCKCHAIN_ENV: Literal["LOCAL_DEVELOPMENT", "MST_TESTNET"] = "LOCAL_DEVELOPMENT"
    LOCAL_RPC_URL: str = "http://127.0.0.1:8545"
    LOCAL_CHAIN_ID: int = 31337
    MST_RPC_URL: str = ""
    MST_CHAIN_ID: int = 0
    CONTRACT_ADDRESS: str = ""
    DEPLOYER_PRIVATE_KEY: str = ""

    RATE_LIMIT_AUTH: str = "5/minute"
    RATE_LIMIT_REPORT: str = "10/minute"

    BOOTSTRAP_ADMIN_EMAIL: str = "admin@fraudshield.local"
    BOOTSTRAP_ADMIN_PASSWORD: str = ""

    @property
    def allowed_extensions_set(self) -> set[str]:
        return {e.strip().lower() for e in self.ALLOWED_EXTENSIONS.split(",")}

    @property
    def max_file_bytes(self) -> int:
        return self.MAX_FILE_SIZE_MB * 1024 * 1024

    @property
    def active_rpc_url(self) -> str:
        if self.BLOCKCHAIN_ENV == "MST_TESTNET":
            return self.MST_RPC_URL
        return self.LOCAL_RPC_URL

    @property
    def active_chain_id(self) -> int:
        if self.BLOCKCHAIN_ENV == "MST_TESTNET":
            return self.MST_CHAIN_ID
        return self.LOCAL_CHAIN_ID


@lru_cache()
def get_settings() -> Settings:
    return Settings()
