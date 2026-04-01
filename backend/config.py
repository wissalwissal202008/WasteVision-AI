import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
_DATA_DIR = BASE_DIR / "data"
# Avoid splitting data across two files after a rename to waste.db:
# - Prefer historical wastevision.db when it exists (keeps scan history / stats).
# - Else use waste.db if only that file exists (deployments that already created it).
# - Else default to wastevision.db for new installs (single canonical name, matches docs).
_LEGACY_DB = _DATA_DIR / "wastevision.db"
_ALTERNATE_DB = _DATA_DIR / "waste.db"
if _LEGACY_DB.exists():
    DATABASE_PATH = _LEGACY_DB
elif _ALTERNATE_DB.exists():
    DATABASE_PATH = _ALTERNATE_DB
else:
    DATABASE_PATH = _LEGACY_DB
UPLOADS_DIR = _DATA_DIR / "uploads"
WEIGHTS_DIR = _DATA_DIR / "weights"
WEIGHTS_PATH = WEIGHTS_DIR / "model.keras"
# Optional: YOLOv8 weights for multi-object detection (e.g. best.pt from ai-model/train_yolov8.py)
YOLO_WEIGHTS_PATH = WEIGHTS_DIR / "yolov8_waste.pt"
os.makedirs(_DATA_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(WEIGHTS_DIR, exist_ok=True)
# 224x224: good balance for classification; keeps inference fast (see docs/INTEGRATION.md).
MODEL_INPUT_SIZE = (224, 224)
NUM_CLASSES = 6
CATEGORY_NAMES = [
    "plastic",
    "paper_cardboard",
    "glass",
    "metal",
    "organic",
    "non_recyclable",
]
