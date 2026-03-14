"""
OpenCV camera demo: capture from webcam, preprocess with OpenCV, run WasteVision CNN.
Run from backend directory: python -m scripts.camera_demo
Requires: backend venv activated, model at data/weights/model.keras (or fresh build).
Press SPACE to capture and classify; Q to quit.
"""
import sys
from pathlib import Path

# Add backend root so we can import config and ml
backend_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_root))

import cv2
import numpy as np

# Import after path fix
import config
from ml.preprocess import _preprocess_array
from ml.model_loader import get_model, predict_proba
from app.services.responses import CATEGORY_INFO

INPUT_SIZE = config.MODEL_INPUT_SIZE
CATEGORY_NAMES = config.CATEGORY_NAMES


def main():
    model = get_model()
    if model is None:
        print("No model loaded. Train with ai_model/train_model.py and copy model to backend/data/weights/model.keras")
        return

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Could not open camera.")
        return

    print("OpenCV camera demo – SPACE: capture & classify, Q: quit")
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        display = frame.copy()
        cv2.putText(
            display, "SPACE: capture | Q: quit",
            (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2
        )
        cv2.imshow("WasteVision Camera", display)

        key = cv2.waitKey(1) & 0xFF
        if key == ord("q"):
            break
        if key == ord(" "):
            # Preprocess: BGR -> RGB, resize, normalize
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            batch = _preprocess_array(rgb)
            proba = predict_proba(batch)[0]
            idx = int(proba.argmax())
            conf = float(proba[idx])
            name = CATEGORY_NAMES[idx]
            row = CATEGORY_INFO.get(idx, CATEGORY_INFO[5])
            bin_name = row[1]
            print(f"  -> {row[0]} ({name}) @ {conf:.2f} | Bin: {bin_name}")
            if len(row) > 8:
                print(f"  Instructions: {row[8]}")

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
