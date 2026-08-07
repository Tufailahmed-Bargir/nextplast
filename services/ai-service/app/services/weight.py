"""Weight estimation for preview purposes only."""

from __future__ import annotations

from app.utils.classes import AVG_WEIGHT_GRAMS


def estimate_weight_grams(
    *,
    plastic_types: list[str],
    count: int,
    confidence: float,
) -> float:
    if count <= 0:
        return 0.0

    if plastic_types:
        avg = sum(AVG_WEIGHT_GRAMS.get(t, 25.0) for t in plastic_types) / len(plastic_types)
    else:
        avg = 25.0

    # Down-weight uncertain detections for safer previews.
    confidence_factor = 0.7 + (0.3 * max(0.0, min(1.0, confidence)))
    return round(count * avg * confidence_factor, 2)
