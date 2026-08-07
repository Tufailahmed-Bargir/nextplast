"""FastAPI application entrypoint for NexPlast AI."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import api_router
from app.config import get_settings
from app.models.loader import model_loader

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nexplast.ai")


@asynccontextmanager
async def lifespan(_: FastAPI):
    settings = get_settings()
    logger.info(
        "Starting %s (model=%s version=%s)",
        settings.app_name,
        settings.model_name,
        settings.model_version,
    )
    # Skip eager download during unit tests (set PRELOAD_MODEL=false).
    if settings.preload_model and settings.app_env != "test":
        try:
            model_loader.load()
        except Exception:  # noqa: BLE001 — health reports degraded; detect will retry
            logger.exception("Model preload failed; service will retry on first /detect")
    yield
    logger.info("Shutting down AI service")


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="NexPlast AI Service",
        description="Plastic detection, counting, and classification (YOLOv8).",
        version="1.0.0",
        lifespan=lifespan,
    )
    # Next.js server-side only — keep CORS tight for local tooling.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["*"],
    )
    app.include_router(api_router)
    return app


app = create_app()
