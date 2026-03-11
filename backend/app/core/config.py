from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # App
    APP_NAME: str = "Hired"
    DEBUG: bool = False

    # Database - Railway injects DATABASE_URL automatically
    DATABASE_URL: str = "postgresql://hired_user:hired_pass@localhost:5432/hired_db"

    # JWT
    SECRET_KEY: str = "your-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Groq
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    # JSearch RapidAPI
    JSEARCH_API_KEY: str = ""
    JSEARCH_BASE_URL: str = "https://jsearch.p.rapidapi.com"

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://perceptive-education-production.up.railway.app"
    ]

    model_config = {"env_file": ".env", "extra": "ignore"}

settings = Settings()

# Fix Railway Postgres URL: replace postgres:// with postgresql://
if settings.DATABASE_URL.startswith("postgres://"):
    settings.DATABASE_URL = settings.DATABASE_URL.replace("postgres://", "postgresql://", 1)