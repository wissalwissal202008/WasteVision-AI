# WasteVision AI – Production Deployment

End-to-end instructions: train model, run backend, run Expo app, build Android APK, test the pipeline. **All tools are free and open-source.**

---

## Project structure

```
WasteVision-AI/
├── ai-model/           # CNN classification + optional YOLOv8 detection
│   ├── model.py
│   ├── dataset_loader.py
│   ├── train_model.py   # Train classifier (MobileNetV2)
│   ├── train_yolov8.py # Optional: train YOLOv8 nano for detection
│   ├── predict.py
│   └── dataset/         # plastic/, paper_cardboard/, glass/, metal/, organic/, non_recyclable/
├── backend/             # FastAPI: /predict (classify), /detect (detection)
├── frontend/            # Expo React Native (frontend_expo)
├── mobile_app/         # Flutter Android (mobile_app_flutter)
├── dataset/            # Optional: raw dataset before splitting
└── docs/
```

---

## 1. Train the AI model

### Option A: Classification (current backend)

Used by **POST /predict** and **POST /detect** (fallback: one detection per image).

```bash
cd WasteVision-AI
pip install tensorflow pillow numpy opencv-python-headless

# Prepare dataset: ai-model/dataset/ with 6 folders (plastic, paper_cardboard, glass, metal, organic, non_recyclable)
python ai-model/train_model.py
```

- Saves `ai-model/waste_model.h5`
- Copies to `backend/data/weights/model.keras`

### Option B: YOLOv8 detection (optional)

For multiple objects and real bounding boxes:

```bash
pip install ultralytics
# Create ai-model/data/waste.yaml (see ai-model/data/waste.yaml.example)
python ai-model/train_yolov8.py
```

- Script exports TFLite; for the **backend**, copy the PyTorch weights to the API:
  - Copy `ai-model/runs/detect/waste/weights/best.pt` → `backend/data/weights/yolov8_waste.pt`
- Backend will then use YOLOv8 for **POST /detect** (real boxes); if the file is missing, it falls back to the classifier (one full-frame detection).

---

## 2. Export model for mobile (optional)

- **Classification:** Backend runs the model; mobile sends images to API. No export needed for basic flow.
- **TFLite (on-device):** From `ai_model/` (legacy): `python convert_tflite.py`. Use the generated `.tflite` in Expo with a TFLite React Native bridge for offline inference.

---

## 3. Start the backend

```bash
cd WasteVision-AI/backend
python -m venv venv
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8001
```

- **API:** http://localhost:8001  
- **Docs:** http://localhost:8001/docs  
- **Endpoints:**  
  - **POST /predict** – image → single classification (waste_type, confidence, recycling_advice).  
  - **POST /detect** – image → list of detections (label, confidence, bounding_box, recycling_advice).

---

## 4. Run the Expo app

```bash
cd WasteVision-AI/frontend
npm install
npx expo start
```

- **Web:** press **w**.  
- **Mobile:** scan QR with Expo Go (same Wi‑Fi as PC).

**On physical device:** set your PC IP in `frontend/app.json`:

```json
"extra": { "apiBaseUrl": "192.168.1.20" }
```

**Features:**

- **Scan tab:** Camera capture or gallery → **POST /predict** → result + recycling advice.  
- **Live detection:** Camera preview → periodic **POST /detect** → bounding boxes + labels + recycling advice; scanning animation.  
- **Conseils tab:** Recycling tips.  
- **Stats tab:** Dashboard (scans, CO₂, goals).  
- **Historique:** Prediction history.

---

## 5. Build Android APK

```bash
cd WasteVision-AI/frontend
npx expo prebuild
npx expo run:android --variant release
# Or use EAS: eas build --platform android --profile production
```

APK output (e.g. `android/app/build/outputs/apk/release/app-release.apk`). Install on device via USB or by copying the APK.

**Performance (mid-range Android):**

- Use **POST /detect** with a **throttled** capture interval (e.g. 1.2 s) to reduce load.  
- Backend: model loaded once at startup; image resize 224×224 (or 320 for YOLO) in preprocessing.  
- Optional: quantized TFLite (int8) for on-device inference to reduce latency and server load.

---

## 6. Test the full pipeline

| Step | Action | Expected |
|------|--------|----------|
| 1 | Start backend | Console: `[Backend] AI model loaded at startup` |
| 2 | Open http://localhost:8001/docs | Swagger UI |
| 3 | **POST /predict** with image | JSON: waste_type, confidence, recycling_advice |
| 4 | **POST /detect** with image | JSON: detections: [{ label, confidence, bounding_box, recycling_advice }] |
| 5 | Expo: Scan tab → Capture or Gallery | Result with waste type and recycling advice |
| 6 | Expo: Scan → Live detection | Camera + boxes/labels + recycling advice |
| 7 | Install APK on phone, set apiBaseUrl to PC IP | Same behavior as Expo Go |

---

## 7. Performance recommendations

- **Backend:** Model preload at startup (already in place). Use `opencv-python-headless` for resize. For YOLOv8, use GPU if available (`device=0`).  
- **Mobile:**  
  - Throttle live detection (e.g. 1.2 s between captures).  
  - Resize images before upload (e.g. quality 0.6, or max width 640) to reduce payload.  
- **Quantization:** For TFLite, use int8 quantization when exporting to reduce size and speed up on-device inference.  
- **Efficient resizing:** Backend preprocess already resizes to 224×224; keep this for the classifier path.

---

## 8. Free and open-source stack

- **Backend:** Python, FastAPI, TensorFlow, OpenCV, SQLite.  
- **Expo app:** React Native, Expo, expo-camera.  
- **Flutter app:** Flutter, http, image_picker.  
- **AI:** TensorFlow/Keras (classification), optional Ultralytics YOLOv8 (detection).  
- **No paid APIs** for core flow; see [CONSTRAINTS.md](../CONSTRAINTS.md) and [FREE_APIS.md](FREE_APIS.md).
