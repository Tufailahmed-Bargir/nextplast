"""Plastic class taxonomy and YOLO / COCO → NexPlast mapping."""

from __future__ import annotations

# Supported NexPlast detection labels (Phase 9 contract).
PLASTIC_CLASSES: tuple[str, ...] = (
    "PET Bottle",
    "HDPE Bottle",
    "Plastic Bag",
    "Milk Packet",
    "Container",
    "Cup",
    "Bottle Cap",
    "Bucket",
    "PVC",
    "Can",
    "Other",
)

# COCO class names → NexPlast plastic taxonomy.
# Fine-tuned plastic weights can emit labels already in PLASTIC_CLASSES.
COCO_TO_PLASTIC: dict[str, str] = {
    "bottle": "PET Bottle",
    "cup": "Cup",
    "bowl": "Container",
    "wine glass": "Other",
    "vase": "Container",
    "handbag": "Plastic Bag",
    "backpack": "Plastic Bag",
    "suitcase": "Plastic Bag",
    "cell phone": "Other",
    "book": "Other",
    "sports ball": "Other",
    "frisbee": "Other",
    "teddy bear": "Other",
    "toothbrush": "Other",
    "scissors": "Other",
    "remote": "Other",
    "keyboard": "Other",
    "mouse": "Other",
    "tv": "Other",
    "laptop": "Other",
    "refrigerator": "Other",
    "microwave": "Other",
    "oven": "Other",
    "toaster": "Other",
    "sink": "Other",
    "toilet": "Bucket",
    "potted plant": "Container",
    "umbrella": "Plastic Bag",
    "tie": "Other",
    "clock": "Other",
    "dining table": "Other",
    "chair": "Other",
    "couch": "Other",
    "bed": "Other",
    "bench": "Other",
}

# Average grams per item (preview only — collector weight is final).
AVG_WEIGHT_GRAMS: dict[str, float] = {
    "PET Bottle": 28.0,
    "HDPE Bottle": 45.0,
    "Plastic Bag": 8.0,
    "Milk Packet": 12.0,
    "Container": 35.0,
    "Cup": 10.0,
    "Bottle Cap": 2.5,
    "Bucket": 180.0,
    "PVC": 60.0,
    "Can": 15.0,
    "Other": 25.0,
}


def normalize_label(raw: str) -> str:
    label = raw.strip()
    if label in PLASTIC_CLASSES:
        return label
    mapped = COCO_TO_PLASTIC.get(label.lower())
    if mapped:
        return mapped
    # Loose resin-code matches from custom models.
    lower = label.lower()
    if "pet" in lower and "cap" not in lower:
        return "PET Bottle"
    if "hdpe" in lower:
        return "HDPE Bottle"
    if "bag" in lower:
        return "Plastic Bag"
    if "milk" in lower or "packet" in lower:
        return "Milk Packet"
    if "cap" in lower:
        return "Bottle Cap"
    if "bucket" in lower:
        return "Bucket"
    if "pvc" in lower:
        return "PVC"
    if "cup" in lower:
        return "Cup"
    if "can" in lower:
        return "Can"
    if "container" in lower:
        return "Container"
    return "Other"


def dominant_class(labels: list[str]) -> str:
    if not labels:
        return "Other"
    counts: dict[str, int] = {}
    for label in labels:
        counts[label] = counts.get(label, 0) + 1
    return max(counts.items(), key=lambda item: item[1])[0]
