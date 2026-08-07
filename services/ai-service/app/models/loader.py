"""Configurable YOLO model loader with version metadata."""

from __future__ import annotations

import logging
import threading
from pathlib import Path
from typing import Any

from app.config import get_settings

logger = logging.getLogger(__name__)


class ModelLoader:
    """Loads Ultralytics YOLOv8 weights once and exposes version metadata."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._model: Any | None = None
        self._loaded_path: Path | None = None
        self._load_error: str | None = None

    @property
    def is_loaded(self) -> bool:
        return self._model is not None

    @property
    def load_error(self) -> str | None:
        return self._load_error

    @property
    def loaded_path(self) -> Path | None:
        return self._loaded_path

    def load(self) -> Any:
        if self._model is not None:
            return self._model

        with self._lock:
            if self._model is not None:
                return self._model

            settings = get_settings()
            model_path = settings.resolved_model_path
            model_path.parent.mkdir(parents=True, exist_ok=True)

            try:
                from ultralytics import YOLO

                # Ultralytics downloads official weights when the name is known
                # and the file is missing (e.g. yolov8n.pt).
                source = str(model_path) if model_path.exists() else settings.model_name
                logger.info("Loading YOLO model from %s", source)
                model = YOLO(source)
                self._model = model
                self._loaded_path = model_path
                self._load_error = None
                logger.info(
                    "Model ready: %s version=%s",
                    settings.model_name,
                    settings.model_version,
                )
                return model
            except Exception as exc:  # noqa: BLE001
                self._load_error = str(exc)
                logger.exception("Failed to load YOLO model")
                raise

    def predict(self, image_bgr: Any, **kwargs: Any) -> Any:
        model = self.load()
        settings = get_settings()
        return model.predict(
            source=image_bgr,
            conf=kwargs.get("conf", settings.model_confidence_threshold),
            iou=kwargs.get("iou", settings.model_iou_threshold),
            verbose=False,
        )


model_loader = ModelLoader()
