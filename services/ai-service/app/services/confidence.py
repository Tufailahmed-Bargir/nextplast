"""Overall confidence from model scores + image quality heuristics."""

from __future__ import annotations

from app.services.preprocessing import PreprocessedImage


def compute_overall_confidence(
    *,
    box_confidences: list[float],
    image: PreprocessedImage,
    category_certainty: float,
) -> float:
    if box_confidences:
        model_conf = sum(box_confidences) / len(box_confidences)
    else:
        model_conf = 0.25

    megapixels = (image.width * image.height) / 1_000_000
    quality = 0.55
    if megapixels >= 1.0:
        quality += 0.2
    elif megapixels >= 0.4:
        quality += 0.1
    if image.original_bytes >= 80_000:
        quality += 0.1
    if image.width < 320 or image.height < 320:
        quality -= 0.2
    quality = max(0.2, min(1.0, quality))

    category = max(0.0, min(1.0, category_certainty))
    score = (0.55 * model_conf) + (0.25 * quality) + (0.20 * category)
    return round(max(0.05, min(0.99, score)), 4)


def decision_from_confidence(confidence: float) -> str:
    if confidence < 0.4:
        return "REJECT"
    if confidence < 0.55:
        return "MANUAL_REVIEW"
    return "ACCEPT"
