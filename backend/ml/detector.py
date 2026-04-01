"""
Waste detection: use YOLOv8 if available (multi-object + real boxes), else classifier (one full-frame detection).
Each detection: label, confidence, bounding_box [x1, y1, x2, y2] normalized 0-1.
"""
import logging
from typing import List

import config
from ml.preprocess import preprocess_from_bytes
from ml.model_loader import predict_proba
from ml.classifier import recycling_advice_for_category
from app.services import responses

logger = logging.getLogger(__name__)

# Categories for detection (same as classification)
CATEGORY_NAMES = config.CATEGORY_NAMES
DISPLAY_NAMES = {
    "plastic": "plastic",
    "paper_cardboard": "paper",
    "glass": "glass",
    "metal": "metal",
    "organic": "organic",
    "non_recyclable": "other",
}


def _detect_with_classifier(image_bytes: bytes, lang: str | None = None) -> List[dict]:
    """Single detection for full image (current CNN). Used when YOLO is not available."""
    batch = preprocess_from_bytes(image_bytes)
    proba = predict_proba(batch)
    proba = proba[0]
    class_index = int(proba.argmax())
    confidence = float(proba[class_index])
    if confidence < 0.15:
        return []
    category_key = CATEGORY_NAMES[class_index]
    display_name = responses.CATEGORY_INFO.get(class_index, responses.CATEGORY_INFO[5])[0]
    return [
        {
            "label": display_name,
            "category": category_key,
            "confidence": round(confidence, 4),
            "bounding_box": [0.0, 0.0, 1.0, 1.0],
            "recycling_advice": recycling_advice_for_category(category_key, lang),
        }
    ]


def detect_from_bytes(image_bytes: bytes, lang: str | None = None) -> List[dict]:
    """
    Run detection on image bytes.
    Uses YOLOv8 if backend/data/weights/yolov8_waste.pt exists, else classifier (one detection).
    Returns list of { label, category, confidence, bounding_box: [x1,y1,x2,y2], recycling_advice }.
    """
    try:
        from ml.yolo_detector import detect_from_bytes_yolo
        detections = detect_from_bytes_yolo(image_bytes, lang=lang)
        if detections is not None:
            return detections
    except Exception as e:
        logger.debug("YOLO not used: %s", e)
    try:
        return _detect_with_classifier(image_bytes, lang=lang)
    except Exception as e:
        logger.warning("Detection preprocess/classifier failed: %s", e)
        raise ValueError(f"Image not valid: {e!s}") from e
