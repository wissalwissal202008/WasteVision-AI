"""
Train waste classification model (CNN).
Uses model.py and dataset_loader.py. Saves waste_model.h5 and copies to backend for API.
Run from project root: python ai-model/train_model.py
Or from ai-model: cd ai-model && python train_model.py
"""
import sys
from pathlib import Path

# Allow running from repo root (ai-model not on path)
_ai_model_dir = Path(__file__).resolve().parent
if str(_ai_model_dir) not in sys.path:
    sys.path.insert(0, str(_ai_model_dir))

from dataset_loader import CLASS_NAMES, get_generators
from model import build_model

# Paths
AI_MODEL_DIR = Path(__file__).resolve().parent
DATA_DIR = AI_MODEL_DIR / "dataset"
MODEL_H5 = AI_MODEL_DIR / "waste_model.h5"
BACKEND_WEIGHTS = AI_MODEL_DIR.parent / "backend" / "data" / "weights" / "model.keras"


def main():
    if not DATA_DIR.is_dir():
        raise FileNotFoundError(
            f"Create dataset folder with 6 class subfolders: {DATA_DIR}\n"
            f"Classes: {', '.join(CLASS_NAMES)}\n"
            "Use a public dataset (e.g. TrashNet); see README."
        )

    train_gen, val_gen = get_generators(data_dir=DATA_DIR)
    if len(train_gen.class_indices) != 6:
        raise ValueError(f"Expected 6 classes, found {list(train_gen.class_indices.keys())}")

    model = build_model(num_classes=6)
    model.fit(train_gen, validation_data=val_gen, epochs=10)

    # Save as .h5 (spec requirement)
    model.save(str(MODEL_H5))
    print(f"Saved: {MODEL_H5}")

    # Copy to backend for /predict API (Keras 3 format)
    if BACKEND_WEIGHTS.parent.is_dir():
        BACKEND_WEIGHTS.parent.mkdir(parents=True, exist_ok=True)
        model.save(str(BACKEND_WEIGHTS))
        print(f"Copied to backend: {BACKEND_WEIGHTS}")

    print("Done. Run backend and use /predict to classify images.")


if __name__ == "__main__":
    main()
