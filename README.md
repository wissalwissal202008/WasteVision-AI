# WasteVision AI

**Real-time waste detection for your phone.** Point the camera at waste, get instant classification and recycling instructions. All tools are **free and open-source**; no paid APIs required.

![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-green)
![Expo](https://img.shields.io/badge/Expo-React%20Native-000020)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## What it does

| Step | Description |
|------|-------------|
| **Camera** | Open the app and point at waste (photo or live preview). |
| **AI** | Backend runs a CNN classifier — or **YOLOv8** for multi-object detection with bounding boxes. |
| **Result** | See waste type (plastic, paper, glass, metal, organic, other), confidence, and **recycling advice**. |

**Extra:** Correction of wrong predictions (human-in-the-loop), scan history, dashboard (stats, CO₂ impact), recycling tips, and optional Android APK.

---

## Features

- **Scan** — Take a photo or pick from gallery → instant classification.
- **Live detection** — Camera preview with periodic detection, bounding boxes, labels, and recycling instructions.
- **Recycling advice** — Recommended bin, step-by-step instructions, eco tips.
- **Corrections** — Report wrong predictions to improve the system.
- **History** — Browse past scans, filter by category.
- **Dashboard** — Stats, CO₂ impact, goals.
- **Recycling tips** — Tips and best practices (FR / EN / AR).
- **Android APK** — Build and install on your phone.

**AI:** 6 categories — Plastic, Paper/Cardboard, Glass, Metal, Organic, Other. Optional **YOLOv8** for multiple objects and real bounding boxes.

---

## Tech stack

| Layer | Stack |
|-------|--------|
| **Mobile** | React Native, Expo (iOS, Android, Web) |
| **Backend** | Python, FastAPI, Uvicorn, SQLite |
| **AI** | TensorFlow/Keras (MobileNetV2 classifier); optional **Ultralytics YOLOv8** for detection |
| **Vision** | OpenCV (preprocessing); Expo Camera (mobile) |

Everything runs locally; no paid APIs. See [CONSTRAINTS.md](CONSTRAINTS.md) and [docs/FREE_APIS.md](docs/FREE_APIS.md).

---

## Quick start

### Prerequisites

- **Node.js** (npm)
- **Python 3.10, 3.11 or 3.12** (TensorFlow does not support 3.14)
- **Expo Go** on your phone (same Wi‑Fi as your machine) for testing

### 1. Clone

```bash
git clone https://github.com/YOUR_USERNAME/WasteVision-AI.git
cd WasteVision-AI
```

### 2. Backend

```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8001
```

API: **http://localhost:8001** · Docs: **http://localhost:8001/docs**

### 3. Frontend (Expo)

In a **new terminal**:

```bash
cd frontend
npm install
npx expo start
```

- **Web:** press **w** in the terminal.
- **Mobile:** scan the QR code with Expo Go (phone on same Wi‑Fi).

**If the app can’t reach the API on a real device:** set your PC IP in `frontend/app.json`:

```json
"expo": {
  "extra": {
    "apiBaseUrl": "http://192.168.1.20:8001"
  }
}
```

Replace `192.168.1.20` with your machine’s IP. Restart Expo after editing.

---

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/predict` | Image → single classification (waste_type, confidence, recycling_advice). |
| **POST** | `/detect` | Image → list of detections (label, confidence, bounding_box, recycling_advice). Uses YOLOv8 if `backend/data/weights/yolov8_waste.pt` exists; otherwise classifier (one full-frame result). |

Both accept an image file (multipart/form-data). See **http://localhost:8001/docs** for request/response schemas.

---

## Optional: YOLOv8 (multi-object detection)

For **multiple objects and real bounding boxes** on **POST /detect**:

1. **Train YOLOv8** (dataset in YOLO format, 6 classes: plastic, paper, glass, metal, organic, other):

   ```bash
   pip install ultralytics
   # Create ai-model/data/waste.yaml (see ai-model/data/waste.yaml.example)
   python ai-model/train_yolov8.py
   ```

2. **Copy weights to backend:**

   ```text
   ai-model/runs/detect/waste/weights/best.pt  →  backend/data/weights/yolov8_waste.pt
   ```

3. Restart the backend. You should see: `[Backend] YOLOv8 detector loaded at startup.`

If `yolov8_waste.pt` is missing, **POST /detect** still works using the CNN classifier (one detection per image).

---

## Train the classifier (CNN)

Used by **POST /predict** and as fallback for **POST /detect**:

```bash
# Dataset: 6 folders under ai-model/dataset/
#   plastic, paper_cardboard, glass, metal, organic, non_recyclable
pip install tensorflow pillow numpy opencv-python-headless
python ai-model/train_model.py
```

This saves the model and copies it to `backend/data/weights/model.keras`.

---

## Build Android APK

```bash
cd frontend
npx expo prebuild
npx expo run:android --variant release
```

APK path (example): `android/app/build/outputs/apk/release/app-release.apk`. Install on your device via USB or by copying the file.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for full deployment and testing steps.

---

## Project structure

```text
WasteVision-AI/
├── backend/           # FastAPI: /predict, /detect, DB, corrections
│   ├── app/           # API routes, services, repositories
│   ├── ml/            # classifier, YOLO detector, preprocessing
│   └── main.py
├── frontend/         # Expo React Native app (camera, scan, live detection, tips, history)
├── ai-model/         # CNN + YOLOv8 training (train_model.py, train_yolov8.py)
├── mobile_app/       # Flutter Android app
├── docs/             # DEPLOYMENT.md, INTEGRATION.md, etc.
└── README.md
```

---

## Documentation

- **[RUN.md](RUN.md)** — Step-by-step: start backend, run Expo, test pipeline.
- **[SETUP.md](SETUP.md)** — Install, train model, run backend, build APK.
- **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** — Production: train, export, backend, Expo, APK, testing.
- **[CONSTRAINTS.md](CONSTRAINTS.md)** — Free and open-source only; no paid services.
- **[BUILD_NATIF.md](BUILD_NATIF.md)** — Build native app (APK/IPA).

---

## License

MIT. See [LICENSE](LICENSE).

---

**WasteVision AI** — Use the camera to sort waste and get recycling instructions. 🌱♻️
