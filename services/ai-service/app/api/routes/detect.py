"""Plastic detection endpoint."""

from __future__ import annotations

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.api.deps import require_api_key
from app.schemas.detection import DetectionResponse
from app.services.detection import detect_plastic
from app.services.preprocessing import ImagePreprocessError

router = APIRouter(tags=["detection"])


@router.post("/detect", response_model=DetectionResponse)
async def detect(
    image: UploadFile = File(..., description="Plastic photo (JPEG/PNG/WEBP)"),
    _: None = Depends(require_api_key),
) -> DetectionResponse:
    data = await image.read()
    try:
        return detect_plastic(data, declared_mime=image.content_type)
    except ImagePreprocessError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"code": exc.code, "message": exc.message},
        ) from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "DETECTION_FAILED", "message": str(exc)},
        ) from exc
