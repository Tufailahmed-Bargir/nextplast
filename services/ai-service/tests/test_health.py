"""Health endpoint smoke tests (no model download required)."""

from __future__ import annotations

import os

os.environ["APP_ENV"] = "test"

from fastapi.testclient import TestClient

from app.config.settings import get_settings
from app.main import create_app

get_settings.cache_clear()


def test_health_and_version():
    app = create_app()
    client = TestClient(app)
    health = client.get("/health")
    assert health.status_code == 200
    body = health.json()
    assert body["service"] == "nexplast-ai-service"
    assert "model_version" in body

    version = client.get("/version")
    assert version.status_code == 200
    assert version.json()["api_version"] == "1.0.0"
