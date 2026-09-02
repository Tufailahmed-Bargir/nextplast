"""Core plastic detection using YOLOv8."""

from __future__ import annotations

import time
from typing import Any

from app.config import get_settings
from app.models.loader import model_loader
from app.schemas.detection import BoundingBox, DetectionResponse, ImageMetadata
from app.services.confidence import compute_overall_confidence, decision_from_confidence
from app.services.preprocessing import PreprocessedImage, preprocess_image
from app.services.weight import estimate_weight_grams
from app.utils.classes import dominant_class, refine_plastic_label


def _boxes_from_results(results: Any, width: int, height: int) -> list[BoundingBox]:
    boxes: list[BoundingBox] = []
    if not results:
        return boxes

    result = results[0]
    names = result.names if hasattr(result, "names") else {}
    if result.boxes is None:
        return boxes

    for box in result.boxes:
        xyxy = box.xyxy[0].tolist()
        conf = float(box.conf[0].item()) if box.conf is not None else 0.0
        cls_id = int(box.cls[0].item()) if box.cls is not None else -1
        raw_name = names.get(cls_id, "Other") if isinstance(names, dict) else "Other"

        x1, y1, x2, y2 = xyxy
        w = max(0.0, (x2 - x1) / max(width, 1))
        h = max(0.0, (y2 - y1) / max(height, 1))
        x = max(0.0, x1 / max(width, 1))
        y = max(0.0, y1 / max(height, 1))
        # Clamp to unit square.
        w = min(w, 1.0 - x)
        h = min(h, 1.0 - y)

        label = refine_plastic_label(str(raw_name), w, h)

        boxes.append(
            BoundingBox(
                x=round(x, 4),
                y=round(y, 4),
                w=round(w, 4),
                h=round(h, 4),
                label=label,
                confidence=round(conf, 4),
            )
        )
    return boxes


def detect_plastic(image_bytes: bytes, declared_mime: str | None = None) -> DetectionResponse:
    started = time.perf_counter()
    settings = get_settings()
    image: PreprocessedImage = preprocess_image(image_bytes, declared_mime)

    results = model_loader.predict(image.bgr)
    boxes = _boxes_from_results(results, image.width, image.height)

    # Prefer plastic-mapped labels; if YOLO found nothing plastic-like, keep empty.
    plastic_boxes = [b for b in boxes if b.label != "Other" or len(boxes) <= 3]
    if not plastic_boxes and boxes:
        plastic_boxes = boxes

    labels = [b.label for b in plastic_boxes]
    detected_class = dominant_class(labels)
    # Count only the dominant class — matches the badge shown in the sell UI.
    # Total plastic_boxes can be higher when YOLO also remaps cups/bags/etc.
    detected_count = sum(1 for b in plastic_boxes if b.label == detected_class)
    plastic_types = sorted({b.label for b in plastic_boxes})

    # Category certainty: share of boxes agreeing with dominant class.
    if plastic_boxes:
        agree = detected_count / len(plastic_boxes)
    else:
        agree = 0.2

    confidence = compute_overall_confidence(
        box_confidences=[b.confidence for b in plastic_boxes],
        image=image,
        category_certainty=agree,
    )
    decision = decision_from_confidence(confidence)
    weight = estimate_weight_grams(
        plastic_types=plastic_types or [detected_class],
        count=max(detected_count, 1 if confidence >= 0.4 else 0),
        confidence=confidence,
    )

    # If nothing detected but image looks usable, mark for manual review with Other/0.
    if detected_count == 0:
        detected_class = "Other"
        decision = "MANUAL_REVIEW" if confidence >= 0.35 else "REJECT"
        weight = 0.0

    elapsed_ms = round((time.perf_counter() - started) * 1000, 2)
    megapixels = round((image.width * image.height) / 1_000_000, 3)

    raw_output: dict[str, Any] = {
        "ultralytics": {
            "names": getattr(results[0], "names", {}) if results else {},
            "box_count": len(plastic_boxes),
            "dominant_class_count": detected_count,
        },
        "model": {
            "name": settings.model_name,
            "version": settings.model_version,
            "path": str(settings.resolved_model_path),
        },
    }

    parsed_output = {
        "detected_class": detected_class,
        "detected_count": detected_count,
        "plastic_types": plastic_types,
        "decision": decision,
        "estimated_weight_grams": weight,
    }

    return DetectionResponse(
        detected_class=detected_class,
        detected_count=detected_count,
        confidence=confidence,
        decision=decision,  # type: ignore[arg-type]
        boxes=plastic_boxes,
        plastic_types=plastic_types,
        estimated_weight_grams=weight,
        processing_time_ms=elapsed_ms,
        model_name=settings.model_name,
        model_version=settings.model_version,
        image=ImageMetadata(
            width=image.width,
            height=image.height,
            bytes=image.original_bytes,
            content_hash=image.content_hash,
            mime_type=image.mime_type,
            megapixels=megapixels,
        ),
        raw_output=raw_output,
        parsed_output=parsed_output,
    )
