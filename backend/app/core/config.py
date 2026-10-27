import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "Smart Farmer Platform - Kurnool Pilot"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = Field(default="super-secret-kurnool-smart-farmer-key-change-in-prod-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days for pilot ease of use

    # MongoDB connection parameters
    MONGO_HOST: str = "localhost"
    MONGO_PORT: int = 27017
    MONGO_DB: str = "smart_farmer_pilot"
    MONGODB_URL: str = Field(default="")
    DATABASE_NAME: str = Field(default="")

    def model_post_init(self, __context):
        if not self.MONGODB_URL:
            self.MONGODB_URL = f"mongodb://{self.MONGO_HOST}:{self.MONGO_PORT}"
        if not self.DATABASE_NAME:
            self.DATABASE_NAME = self.MONGO_DB

    # Pilot District
    DEFAULT_DISTRICT: str = "Kurnool"
    DEFAULT_STATE: str = "Andhra Pradesh"

    # Security & Rate Limiting
    MAX_LOGIN_ATTEMPTS: int = 5
    OTP_EXPIRY_SECONDS: int = 300
    RATE_LIMIT_PER_MINUTE: int = 120

    # Service Adapters Modes (MOCK / LIVE)
    IVR_MODE: str = "SIMULATOR"  # Options: SIMULATOR, TWILIO, EXOTEL
    SMS_MODE: str = "MOCK"       # Options: MOCK, GUPSHUP, MSG91
    PAYMENT_MODE: str = "SANDBOX"# Options: SANDBOX, RAZORPAY
    AI_CROP_MODE: str = "MOCK"   # Options: MOCK, TENSORFLOW_SERVING
    WEATHER_MODE: str = "MOCK"   # Options: MOCK, IMD_OPEN_METEO
    MARKET_PRICE_MODE: str = "MOCK" # Options: MOCK, AGMARKNET

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()
