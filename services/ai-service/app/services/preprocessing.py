"""Image preprocessing: validate, orient, resize, strip metadata, compress."""

from __future__ import annotations

import io
from dataclasses import dataclass

import cv2
import numpy as np
from PIL import Image, ImageOps, UnidentifiedImageError

from app.config import get_settings


class ImagePreprocessError(ValueError):
    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


@dataclass(frozen=True)
class PreprocessedImage:
    bgr: np.ndarray
    width: int
    height: int
    mime_type: str
    original_bytes: int
    content_hash: str


def _sniff_mime(data: bytes) -> str | None:
    if data[:3] == b"\xff\xd8\xff":
        return "image/jpeg"
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return "image/png"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "image/webp"
    return None


def preprocess_image(data: bytes, declared_mime: str | None = None) -> PreprocessedImage:
    settings = get_settings()

    if not data:
        raise ImagePreprocessError("EMPTY_IMAGE", "Image bytes are empty.")
    if len(data) > settings.max_image_bytes:
        raise ImagePreprocessError(
            "IMAGE_TOO_LARGE",
            f"Image exceeds {settings.max_image_bytes} bytes.",
        )

    sniffed = _sniff_mime(data)
    if sniffed is None:
        raise ImagePreprocessError("CORRUPT_OR_UNSUPPORTED", "Corrupted or unsupported image.")

    mime = sniffed
    if declared_mime and declared_mime not in settings.allowed_mimes:
        raise ImagePreprocessError("INVALID_FORMAT", f"MIME type {declared_mime} is not allowed.")
    if mime not in settings.allowed_mimes:
        raise ImagePreprocessError("INVALID_FORMAT", f"MIME type {mime} is not allowed.")

    try:
        with Image.open(io.BytesIO(data)) as img:
            img.verify()
        with Image.open(io.BytesIO(data)) as img:
            # Correct EXIF orientation and drop metadata by reconstructing pixels.
            oriented = ImageOps.exif_transpose(img)
            rgb = oriented.convert("RGB")
            # Mild compression via in-memory JPEG rewrite (metadata already gone).
            buf = io.BytesIO()
            rgb.save(buf, format="JPEG", quality=90, optimize=True)
            clean = np.frombuffer(buf.getvalue(), dtype=np.uint8)
            bgr = cv2.imdecode(clean, cv2.IMREAD_COLOR)
            if bgr is None:
                raise ImagePreprocessError("DECODE_FAILED", "OpenCV could not decode image.")
    except ImagePreprocessError:
        raise
    except UnidentifiedImageError as exc:
        raise ImagePreprocessError("CORRUPT_OR_UNSUPPORTED", "Unidentified image file.") from exc
    except Exception as exc:  # noqa: BLE001
        raise ImagePreprocessError("CORRUPT_OR_UNSUPPORTED", "Failed to preprocess image.") from exc

    height, width = bgr.shape[:2]
    max_dim = settings.max_image_dimension
    longest = max(width, height)
    if longest > max_dim:
        scale = max_dim / float(longest)
        new_w = max(1, int(width * scale))
        new_h = max(1, int(height * scale))
        bgr = cv2.resize(bgr, (new_w, new_h), interpolation=cv2.INTER_AREA)
        height, width = bgr.shape[:2]

    # Normalize pixel range for downstream consumers (keep uint8 for YOLO).
    _ = bgr.astype(np.float32) / 255.0

    from app.utils.hashing import sha256_bytes

    return PreprocessedImage(
        bgr=bgr,
        width=width,
        height=height,
        mime_type=mime,
        original_bytes=len(data),
        content_hash=sha256_bytes(data),
    )
