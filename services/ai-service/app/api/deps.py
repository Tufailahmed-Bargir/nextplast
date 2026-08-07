"""Shared API helpers — API key auth for Next.js proxies."""

from __future__ import annotations

from fastapi import Header, HTTPException, status

from app.config import get_settings


async def require_api_key(x_ai_api_key: str | None = Header(default=None)) -> None:
    settings = get_settings()
    expected = settings.ai_service_api_key
    if not expected:
        return
    if not x_ai_api_key or x_ai_api_key != expected:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing AI API key",
        )
