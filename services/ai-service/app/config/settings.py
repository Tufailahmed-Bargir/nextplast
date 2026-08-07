"""Runtime configuration for the NexPlast AI service."""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "nexplast-ai-service"
    app_env: str = "development"
    host: str = "0.0.0.0"
    port: int = 8001

    # Shared secret checked by Next.js proxies (X-AI-API-Key).
    ai_service_api_key: str = "nexplast-dev-ai-key"

    # Model versioning — bump when swapping weights.
    model_name: str = "yolov8n"
    model_version: str = "8.3.0-n"
    model_path: str = "models/yolov8n.pt"
    model_confidence_threshold: float = 0.35
    model_iou_threshold: float = 0.45

    # Preprocessing
    max_image_bytes: int = 10 * 1024 * 1024
    max_image_dimension: int = 1280
    allowed_mime_types: str = "image/jpeg,image/png,image/webp"

    # Future extension hooks (not wired in Phase 9).
    redis_url: str | None = None
    enable_background_queue: bool = False
    preload_model: bool = True

    @property
    def allowed_mimes(self) -> set[str]:
        return {m.strip() for m in self.allowed_mime_types.split(",") if m.strip()}

    @property
    def resolved_model_path(self) -> Path:
        path = Path(self.model_path)
        if path.is_absolute():
            return path
        # Resolve relative to services/ai-service/
        return Path(__file__).resolve().parents[2] / path


@lru_cache
def get_settings() -> Settings:
    return Settings()
