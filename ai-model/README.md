# AI Model – Waste Classification (CNN)

Open-source CNN (TensorFlow/Keras, MobileNetV2) for 6 waste categories: **Plastic, Paper, Glass, Metal, Organic, Other**.

## Structure

| File | Purpose |
|------|--------|
| `model.py` | CNN definition (build_model) |
| `dataset_loader.py` | Load dataset from folders (TrashNet-style) |
| `train_model.py` | Train and save `waste_model.h5` |
| `predict.py` | Load model, preprocess image (OpenCV), return class + confidence |
| `waste_model.h5` | Trained weights (created by training) |

## Dataset

Use a **public open dataset** (e.g. TrashNet). Create:

```
ai-model/dataset/
  plastic/
  paper_cardboard/
  glass/
  metal/
  organic/
  non_recyclable/
```

Put images in each folder. If your dataset uses different names (e.g. `paper`, `cardboard`), copy or symlink into the names above, or adjust `CLASS_NAMES` in `dataset_loader.py`.

## Commands

```bash
# From project root
cd WasteVision-AI
pip install tensorflow pillow numpy opencv-python-headless

# Train (after placing data in ai-model/dataset/)
python ai-model/train_model.py

# Or from ai-model/
cd ai-model
python train_model.py
```

This produces `waste_model.h5` and copies the model to `backend/data/weights/model.keras` for the FastAPI `/predict` endpoint.

## Predict (CLI)

```bash
python ai-model/predict.py path/to/image.jpg
```

Output: `Class: plastic | Confidence: 0.92`
