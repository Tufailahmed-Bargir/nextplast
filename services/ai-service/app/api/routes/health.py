"""Health and version endpoints."""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter

from app.config import get_settings
from app.models.loader import model_loader
from app.schemas.detection import HealthResponse, VersionResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    settings = get_settings()
    loaded = model_loader.is_loaded
    status = "healthy" if loaded or model_loader.load_error is None else "degraded"
    if model_loader.load_error and not loaded:
        status = "degraded"
    return HealthResponse(
        status=status,  # type: ignore[arg-type]
        service=settings.app_name,
        model_loaded=loaded,
        model_name=settings.model_name,
        model_version=settings.model_version,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


@router.get("/version", response_model=VersionResponse)
def version() -> VersionResponse:
    settings = get_settings()
    return VersionResponse(
        service=settings.app_name,
        api_version="1.0.0",
        model_name=settings.model_name,
        model_version=settings.model_version,
        model_path=str(settings.resolved_model_path),
    )
