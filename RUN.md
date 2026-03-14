# WasteVision AI – Run Everything Locally

End-to-end pipeline: **Camera → Mobile App → Backend API → AI Model → Prediction → Result**.  
Use only **free, open-source** tools. No paid APIs.

---

## Architecture

```
[Phone/Emulator]  →  Camera / Gallery  →  POST /predict (image)
       ↑                                              ↓
  Expo or Flutter app                          Backend (FastAPI)
       ↑                                              ↓
  Result: waste_type, confidence,             AI model (TensorFlow)
          recycling_advice                    loads at startup
```

---

## 1. Prerequisites

- **Python 3.10, 3.11 or 3.12** (TensorFlow does not support 3.14)
- **Node.js** (for Expo)
- **Flutter SDK** (optional, for Flutter app)
- **Same Wi‑Fi** for phone and PC (when testing on device)

---

## 2. AI model (one-time or after dataset change)

The backend uses a trained model at `backend/data/weights/model.keras`. If you don’t have it yet:

```bash
cd WasteVision-AI

# Create dataset folders: ai-model/dataset/ with plastic/, paper_cardboard/, glass/, metal/, organic/, non_recyclable/
# Add images to each folder (or use ai_model/download_dataset.py for a public dataset)

pip install tensorflow pillow numpy opencv-python-headless
python ai-model/train_model.py
```

This saves `ai-model/waste_model.h5` and copies the model to `backend/data/weights/model.keras`.  
If you skip training, the backend still starts and uses a **fallback** (random) model when no weights file exists; for real predictions you need a trained model.

---

## 3. Start the backend

```bash
cd WasteVision-AI/backend

# Optional: create and activate a venv
# python -m venv venv
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8001
```

- **API:** http://localhost:8001  
- **Docs:** http://localhost:8001/docs  
- **Model:** Loaded once at startup (see console: `[Backend] AI model loaded at startup`).

Leave this terminal open. Test: open http://localhost:8001/docs → **POST /predict** → Try it out → upload an image → Execute. Expected response includes `waste_type`, `confidence`, `recycling_advice`.

---

## 4. Run Expo app (React Native)

**Terminal 2:**

```bash
cd WasteVision-AI/frontend
npm install
npx expo start
```

- **Web:** Press **w** → app runs in browser. Camera may need browser permission or use “Choose from gallery”.
- **Phone (Expo Go):** Scan the QR code with Expo Go (same Wi‑Fi as PC).

**On a physical device:** set your PC’s IP in `frontend/app.json`:

```json
"extra": {
  "apiBaseUrl": "192.168.1.20"
}
```

Replace with your PC’s IPv4 address. Restart Expo after changing.

**In the app:** Open the **Scan** tab → allow camera → tap **Capture** (or **Choose from gallery**) → wait for “Analyzing…” → result card shows **waste type**, **confidence**, **recycling advice**. Tap **See full result** for the full Result screen.

---

## 5. Run Flutter app (Android)

**Terminal 2 (or 3):**

```bash
cd WasteVision-AI/mobile_app
# or: cd WasteVision-AI/frontend_flutter

flutter pub get
flutter run
```

- **Emulator:** Default base URL is `http://10.0.2.2:8001`.
- **Physical device:** In `lib/services/api_service.dart` set `baseUrl: 'http://YOUR_PC_IP:8001'`.

**In the app:** Tap **Camera** or **Gallery** → image is sent to **POST /predict** → result screen shows **waste type**, **confidence**, **recycling advice**.

---

## 6. Test the full pipeline

| Step | Action | Expected |
|------|--------|----------|
| 1 | Backend running | Console: `[Backend] AI model loaded at startup` (or fallback message). |
| 2 | Open http://localhost:8001/docs | Swagger UI loads. |
| 3 | POST /predict with an image | JSON with `waste_type`, `confidence`, `recycling_advice`. |
| 4 | Expo: Scan tab → Capture or Gallery | Loading indicator, then result card. |
| 5 | Flutter: Camera or Gallery | Result screen with waste type and recycling advice. |

**If the app says “Cannot reach backend”:**

- Confirm backend is running (`http://localhost:8001` in browser).
- On **device**, set **apiBaseUrl** (Expo) or **baseUrl** (Flutter) to your PC’s IP.
- Ensure phone and PC are on the **same Wi‑Fi** and firewall allows port **8001**.

---

## 7. Expected API response format

**POST /predict** returns JSON like:

```json
{
  "waste_type": "plastic",
  "confidence": 0.92,
  "recycling_advice": "1. Empty and rinse the item. 2. Remove caps...",
  "object_name": "Plastic",
  "waste_category": "plastic",
  "recommended_bin": "Yellow bin (recycling)",
  "environmental_impact": "...",
  "eco_tip": "...",
  "scan_id": 1
}
```

Categories: **plastic**, **paper_cardboard**, **glass**, **metal**, **organic**, **non_recyclable** (other).

---

## 8. Project layout (reference)

```
WasteVision-AI/
├── backend/           # FastAPI, /predict, model in ml/
├── frontend/          # Expo (React Native) app
├── mobile_app/       # Flutter Android (minimal)
├── frontend_flutter/  # Flutter (full UI)
├── ai-model/         # Train CNN (model.py, train_model.py, predict.py)
├── ai_model/         # Dataset download, TFLite export
├── RUN.md            # This file
├── SETUP.md          # Detailed setup
└── README.md
```

For more detail (dataset, training, build APK), see **SETUP.md** and **CONSTRAINTS.md**.
