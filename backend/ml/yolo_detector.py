"""
Optional YOLOv8 detector for waste: multiple objects + real bounding boxes.
Requires: pip install ultralytics
Dataset classes: 0=plastic, 1=paper, 2=glass, 3=metal, 4=organic, 5=other.
"""
import logging
from pathlib import Path
from typing import List, Optional

import config
from app.services import responses

logger = logging.getLogger(__name__)

# Map YOLO class index -> backend category key
CATEGORY_NAMES = config.CATEGORY_NAMES
DISPLAY_NAMES = {
    "plastic": "plastic",
    "paper_cardboard": "paper",
    "glass": "glass",
    "metal": "metal",
    "organic": "organic",
    "non_recyclable": "other",
}

_yolo_model = None


def _get_recycling_advice(category_key: str) -> str:
    idx = CATEGORY_NAMES.index(category_key) if category_key in CATEGORY_NAMES else 5
    row = responses.CATEGORY_INFO.get(idx, responses.CATEGORY_INFO[5])
    instructions = row[8] if len(row) > 8 else None
    bin_name = row[1]
    return (instructions or bin_name or "Check local recycling rules.")[:200]


def get_yolo_model():
    """Load YOLOv8 model once (lazy). Returns None if weights missing or ultralytics not installed."""
    global _yolo_model
    if _yolo_model is not None:
        return _yolo_model
    path = getattr(config, "YOLO_WEIGHTS_PATH", None) or (config.WEIGHTS_DIR / "yolov8_waste.pt")
    if not path or not Path(path).exists():
        return None
    try:
        from ultralytics import YOLO
        _yolo_model = YOLO(str(path))
        logger.info("YOLOv8 model loaded: %s", path)
        return _yolo_model
    except ImportError:
        logger.debug("ultralytics not installed; YOLO detection disabled")
        return None
    except Exception as e:
        logger.warning("YOLO load failed: %s", e)
        return None


def detect_from_bytes_yolo(image_bytes: bytes, conf_threshold: float = 0.25) -> Optional[List[dict]]:
    """
    Run YOLOv8 on image bytes. Returns list of detections or None if YOLO not available.
    Each: { label, category, confidence, bounding_box: [x1,y1,x2,y2] normalized, recycling_advice }.
    """
    model = get_yolo_model()
    if model is None:
        return None
    try:
        import numpy as np
        import cv2
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return None
        results = model.predict(img, conf=conf_threshold, verbose=False)
        if not results:
            return []
        detections = []
        h, w = img.shape[:2]
        for r in results:
            if r.boxes is None:
                continue
            for box in r.boxes:
                cls_id = int(box.cls.item())
                conf = float(box.conf.item())
                if cls_id < 0 or cls_id >= len(CATEGORY_NAMES):
                    cls_id = 5
                category_key = CATEGORY_NAMES[cls_id]
                label_display = responses.CATEGORY_INFO.get(cls_id, responses.CATEGORY_INFO[5])[0]
                xyxy = box.xyxy[0].cpu().numpy()
                x1, y1, x2, y2 = float(xyxy[0]), float(xyxy[1]), float(xyxy[2]), float(xyxy[3])
                # Normalize to 0-1
                x1, x2 = x1 / w, x2 / w
                y1, y2 = y1 / h, y2 / h
                detections.append({
                    "label": label_display,
                    "category": category_key,
                    "confidence": round(conf, 4),
                    "bounding_box": [round(x1, 4), round(y1, 4), round(x2, 4), round(y2, 4)],
                    "recycling_advice": _get_recycling_advice(category_key),
                })
        return detections
    except Exception as e:
        logger.warning("YOLO inference failed: %s", e)
        return None
