# MODEL.md — WasteVision AI

Documentation for the **classification CNN** and optional **YOLOv8** detector. Training is **offline**; inference runs in the FastAPI backend.

---

## 1. Classes (6)

Backend and CNN use the same label set:

| Key | Typical meaning |
|-----|-----------------|
| `plastic` | Plastics |
| `paper_cardboard` | Paper / cardboard |
| `glass` | Glass |
| `metal` | Metal |
| `organic` | Organic / compost |
| `non_recyclable` | Residual / non-recyclable |

Folder names under `ai-model/dataset/` must match these keys exactly for `train_model.py`.

---

## 2. Dataset structure (CNN)

```
ai-model/dataset/
  plastic/
  paper_cardboard/
  glass/
  metal/
  organic/
  non_recyclable/
```

- Put **images** (JPG/PNG) in each folder.
- Use a **public** dataset (e.g. TrashNet-style) and **remap** folder names if needed.
- Target input size for training: **224×224** (see `dataset_loader.py`).

---

## 3. Training process (CNN)

1. Install TensorFlow and dependencies (`pip install -r backend/requirements.txt` or minimal: tensorflow, pillow, numpy, opencv-python-headless).
2. Populate `ai-model/dataset/` with the six folders above.
3. Run from repo root:

   ```bash
   python ai-model/train_model.py
   ```

4. Outputs:
   - `ai-model/waste_model.h5`
   - `backend/data/weights/model.keras` (used by `/predict`, `/classify`, fallback `/detect`)

Default training uses **MobileNetV2-based** architecture (`model.py`) with **ImageDataGenerator** and a train/validation split (`dataset_loader.py`). Adjust **epochs**, **augmentation**, and **architecture** in those files for your use case.

---

## 4. YOLOv8 (optional)

- Dataset must be in **YOLO** format (images + labels).
- Configure `ai-model/data/waste.yaml` (see example file in repo if present).
- Run `python ai-model/train_yolov8.py`, then copy `best.pt` to `backend/data/weights/yolov8_waste.pt`.
- Restart the backend so `/detect` loads multi-box inference.

---

## 5. Limitations

- **Domain gap:** Models trained on one corpus (e.g. clean product photos) may **underperform** on messy bins, dark scenes, or unusual angles.
- **Six classes:** Fine-grained types (e.g. PET vs HDPE) are **not** separated.
- **Confidence:** High softmax probability is **not** guaranteed calibration; low-light or occlusion can yield **overconfident** wrong classes.
- **YOLO:** Without trained weights, `/detect` falls back to **one** full-frame classification.
- **Regulatory:** Advice text is **informational**; always follow **local** recycling rules.

---

## 6. Suggestions for improvement

1. **More data** per class, especially underrepresented categories and **hard negatives**.
2. **Stronger augmentation** (blur, noise, color jitter) for mobile camera conditions.
3. **Calibration** (temperature scaling) or **confidence thresholds** in the API to flag uncertain predictions.
4. **Separate “unknown / ask human”** class or entropy-based rejection.
5. **YOLO** trained on **in-the-wild** waste scenes for realistic boxes.
6. **Periodic retraining** using verified corrections from `history` / export endpoints.
7. **Quantization** or **TFLite** export for on-device inference (reduces server load, improves privacy).

---

## See also

- [ARCHITECTURE.md](ARCHITECTURE.md) — where CNN and YOLO sit in the stack
- [ai-model/README.md](ai-model/README.md) — quick commands
- [README.md](README.md) — weights paths and API overview

