import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BASE_DIR / "data" / "waste.db"
UPLOADS_DIR = BASE_DIR / "data" / "uploads"
WEIGHTS_DIR = BASE_DIR / "data" / "weights"
WEIGHTS_PATH = WEIGHTS_DIR / "model.keras"
# Optional: YOLOv8 weights for multi-object detection (e.g. best.pt from ai-model/train_yolov8.py)
YOLO_WEIGHTS_PATH = WEIGHTS_DIR / "yolov8_waste.pt"
os.makedirs(BASE_DIR / "data", exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(WEIGHTS_DIR, exist_ok=True)
# 224×224: good balance for classification; keeps inference fast (see docs/INTEGRATION.md § Performance).
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
