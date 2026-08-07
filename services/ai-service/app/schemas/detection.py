"""Pydantic request/response schemas for the AI service."""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


class BoundingBox(BaseModel):
    x: float = Field(..., ge=0, le=1, description="Normalized left")
    y: float = Field(..., ge=0, le=1, description="Normalized top")
    w: float = Field(..., ge=0, le=1, description="Normalized width")
    h: float = Field(..., ge=0, le=1, description="Normalized height")
    label: str
    confidence: float = Field(..., ge=0, le=1)


class ImageMetadata(BaseModel):
    width: int
    height: int
    bytes: int
    content_hash: str
    mime_type: str
    megapixels: float


class DetectionResponse(BaseModel):
    detected_class: str
    detected_count: int
    confidence: float
    decision: Literal["ACCEPT", "MANUAL_REVIEW", "REJECT"]
    boxes: list[BoundingBox]
    plastic_types: list[str]
    estimated_weight_grams: float
    processing_time_ms: float
    model_name: str
    model_version: str
    image: ImageMetadata
    raw_output: dict[str, Any]
    parsed_output: dict[str, Any]


class HealthResponse(BaseModel):
    status: Literal["healthy", "degraded", "unhealthy"]
    service: str
    model_loaded: bool
    model_name: str
    model_version: str
    timestamp: str


class VersionResponse(BaseModel):
    service: str
    api_version: str
    model_name: str
    model_version: str
    model_path: str
