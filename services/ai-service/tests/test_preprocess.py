"""Unit tests that do not require the YOLO weights download."""

from __future__ import annotations

import io

import numpy as np
import pytest
from PIL import Image

from app.services.preprocessing import ImagePreprocessError, preprocess_image
from app.utils.classes import dominant_class, normalize_label, refine_plastic_label
from app.services.weight import estimate_weight_grams
from app.services.confidence import decision_from_confidence


def _png_bytes(size: tuple[int, int] = (640, 480)) -> bytes:
    img = Image.fromarray(np.zeros((size[1], size[0], 3), dtype=np.uint8))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def test_normalize_label_maps_coco_bottle():
    assert normalize_label("bottle") == "PET Bottle"
    assert normalize_label("PET Bottle") == "PET Bottle"
    assert normalize_label("unknown-thing") == "Other"
    assert normalize_label("vase") == "PET Bottle"


def test_refine_tall_bowl_becomes_bottle():
    # Tall box → bottle (COCO often mislabels bottles as bowl)
    assert refine_plastic_label("bowl", box_w=0.2, box_h=0.45) == "PET Bottle"
    # Wide squat bowl stays container
    assert refine_plastic_label("bowl", box_w=0.4, box_h=0.2) == "Container"


def test_dominant_class():
    assert dominant_class(["Cup", "Cup", "PET Bottle"]) == "Cup"
    # Prefer bottles when tied with container-like classes
    assert dominant_class(["PET Bottle", "Container"]) == "PET Bottle"
    assert dominant_class([]) == "Other"


def test_preprocess_valid_png():
    result = preprocess_image(_png_bytes())
    assert result.width == 640
    assert result.height == 480
    assert result.content_hash
    assert result.mime_type == "image/png"


def test_preprocess_rejects_empty():
    with pytest.raises(ImagePreprocessError) as exc:
        preprocess_image(b"")
    assert exc.value.code == "EMPTY_IMAGE"


def test_preprocess_rejects_corrupt():
    with pytest.raises(ImagePreprocessError):
        preprocess_image(b"not-an-image")


def test_weight_estimation():
    grams = estimate_weight_grams(
        plastic_types=["PET Bottle", "Bottle Cap"],
        count=3,
        confidence=0.9,
    )
    assert grams > 0


def test_decision_thresholds():
    assert decision_from_confidence(0.3) == "REJECT"
    assert decision_from_confidence(0.5) == "MANUAL_REVIEW"
    assert decision_from_confidence(0.8) == "ACCEPT"
