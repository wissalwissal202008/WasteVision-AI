# WasteVision AI – Setup & Run (Full Guide)

This project is **open source only**, **runnable locally**, and requires **no paid APIs**. Follow these steps to install, train the model, run the backend, and build the Android app.

---

## Project structure

```
WasteVision-AI/
├── ai-model/              # CNN training & inference
│   ├── model.py            # CNN definition (MobileNetV2)
│   ├── dataset_loader.py   # Load dataset (TrashNet-style folders)
│   ├── train_model.py      # Train and save waste_model.h5
│   ├── predict.py          # CLI inference
│   ├── dataset/            # Your data: plastic/, paper_cardboard/, glass/, metal/, organic/, non_recyclable/
│   └── waste_model.h5      # Trained model (created by training)
├── backend/                # FastAPI server
│   ├── main.py             # App entry
│   ├── routes.py           # API route registration
│   ├── ml/
│   │   ├── model_loader.py  # Load model for /predict
│   │   └── preprocess.py   # OpenCV image preprocessing
│   └── app/api/             # Endpoints (predict, history, etc.)
└── mobile_app/             # Flutter Android app
    ├── lib/
    │   ├── main.dart
    │   ├── screens/        # Home (camera), Result (waste type + recycling advice)
    │   └── services/       # API client (POST /predict)
    └── pubspec.yaml
```

---

## 1. Prerequisites

- **Python 3.10, 3.11 or 3.12** (TensorFlow does not support 3.14)
- **Node.js** (optional; for React Native frontend in `frontend/`)
- **Flutter SDK** (for `mobile_app` Android build)
- **Android Studio / Android SDK** (for APK build or emulator)

---

## 2. Install backend & AI dependencies

```bash
cd WasteVision-AI

# Backend
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate
pip install -r requirements.txt
cd ..

# AI model (same venv or new one)
pip install tensorflow pillow numpy opencv-python-headless
```

---

## 3. Prepare dataset (public open data)

Use a **public open dataset** (e.g. TrashNet). Create 6 folders under `ai-model/dataset/`:

```
ai-model/dataset/
  plastic/
  paper_cardboard/
  glass/
  metal/
  organic/
  non_recyclable/
```

Put images in each folder. If your dataset uses different names, copy or symlink into these names. You can also use the existing script in `ai_model/download_dataset.py` (Kaggle) and point it to a path that matches this layout.

---

## 4. Train the model

From the **project root**:

```bash
python ai-model/train_model.py
```

Or from inside `ai-model/`:

```bash
cd ai-model
python train_model.py
```

This will:

- Train the CNN (MobileNetV2) on your dataset
- Save **waste_model.h5** in `ai-model/`
- Copy the model to **backend/data/weights/model.keras** for the API

---

## 5. Run the backend API

From the **project root**:

```bash
cd backend
# Activate venv if not already
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
python -m uvicorn main:app --host 0.0.0.0 --port 8001
```

- API: **http://localhost:8001**
- Docs: **http://localhost:8001/docs**
- **Endpoint:** `POST /predict` — send an image file, get waste type, recommended bin, recycling instructions, and confidence.

---

## 6. Run the Flutter mobile app (Android)

### Option A: Emulator

1. Start an Android emulator.
2. Backend must be running (step 5). Emulator uses `10.0.2.2` to reach host: default in app is `http://10.0.2.2:8001`.
3. Run the app:

```bash
cd mobile_app
flutter pub get
# If android/ is missing:
flutter create . --platforms=android
flutter run
```

### Option B: Physical device (same Wi‑Fi as PC)

1. In `mobile_app/lib/services/api_service.dart`, set `baseUrl` to `http://YOUR_PC_IP:8001`.
2. Run backend with `--host 0.0.0.0` (step 5).
3. Connect the phone via USB (or use wireless debugging), then:

```bash
cd mobile_app
flutter run
```

---

## 7. Build Android APK

```bash
cd mobile_app
flutter pub get
flutter build apk --release
```

APK path: **build/app/outputs/flutter-apk/app-release.apk**

Install on device: `adb install build/app/outputs/flutter-apk/app-release.apk` or copy the APK to the phone.

---

## 8. Run everything locally (summary)

1. **Train once:**  
   `python ai-model/train_model.py` (after placing data in `ai-model/dataset/`).

2. **Start backend:**  
   `cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8001`

3. **Run mobile app:**  
   `cd mobile_app && flutter run`  
   (Or install the APK from step 7 and open the app; ensure backend URL in the app points to your PC.)

4. In the app: **Camera** or **Gallery** → image is sent to **/predict** → result shows **waste category**, **recommended bin**, and **recycling instructions**.

---

## Features checklist

| Feature | Where |
|--------|--------|
| Use phone camera | mobile_app (image_picker) |
| Detect waste with AI | backend /predict + ml/model_loader.py |
| Show waste category | Result screen (waste_category) |
| Recycling instructions | Result screen (recycling_instructions from API) |
| 6 categories | Plastic, Paper, Glass, Metal, Organic, Other (non_recyclable) |
| Open source only | TensorFlow, FastAPI, OpenCV, Flutter |
| Local inference | Backend loads model from backend/data/weights/model.keras |
| POST /predict | Accepts image, returns waste type + confidence |

---

## Optional: React Native (Expo) frontend

The repo also includes a **React Native (Expo)** app in `frontend/`. To run it:

```bash
cd frontend
npm install
npx expo start
```

Set the backend URL (e.g. in `app.json` or env) to `http://YOUR_IP:8001` when using a physical device.

---

## Troubleshooting

- **"No module named 'model'"** when running `train_model.py` from project root: run from inside `ai-model/` or ensure you use `python ai-model/train_model.py` (the script adds `ai-model` to `sys.path`).
- **Connection refused** on phone: use your PC’s LAN IP in the app’s `ApiService` and run backend with `--host 0.0.0.0`.
- **Camera permission**: the app requests camera permission at runtime; grant it in device settings if needed.
