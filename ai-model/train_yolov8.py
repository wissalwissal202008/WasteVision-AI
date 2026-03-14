"""
Train YOLOv8 nano for waste detection (optional).
Requires: pip install ultralytics
Dataset: YOLO format (images + labels with class index per object).
Classes: 0=plastic, 1=paper, 2=glass, 3=metal, 4=organic, 5=other.
Export to TFLite for mobile: model.export(format="tflite", imgsz=320, int8=True) for quantization.
"""
from pathlib import Path

try:
    from ultralytics import YOLO
except ImportError:
    print("Install ultralytics: pip install ultralytics")
    raise SystemExit(1)

# Paths
DATA_YAML = Path(__file__).resolve().parent / "data" / "waste.yaml"
MODEL_NAME = "yolov8n.pt"
OUTPUT_DIR = Path(__file__).resolve().parent / "runs" / "detect"


def main():
    if not DATA_YAML.exists():
        print(f"Create {DATA_YAML} with YOLO dataset structure.")
        print("Example waste.yaml:")
        print("  path: ../dataset_waste  # or absolute path")
        print("  train: images/train")
        print("  val: images/val")
        print("  nc: 6")
        print("  names: [plastic, paper, glass, metal, organic, other]")
        return

    model = YOLO(MODEL_NAME)
    model.train(
        data=str(DATA_YAML),
        epochs=50,
        imgsz=320,
        batch=16,
        device=0,
        project=str(OUTPUT_DIR),
        name="waste",
    )
    best = OUTPUT_DIR / "waste" / "weights" / "best.pt"
    if best.exists():
        print(f"Best weights: {best}")
        export_model = YOLO(str(best))
        export_model.export(format="tflite", imgsz=320, int8=False)
        print("Exported TFLite to same folder. Copy to backend or mobile as needed.")


if __name__ == "__main__":
    main()
