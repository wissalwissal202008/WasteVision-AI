# WasteVision AI – Smart Waste Recognition 🌱♻️

**Important constraint:** This project uses **only free APIs**, **open-source libraries**, and **no paid services or paid API keys**. It is **fully runnable locally**. See **[CONSTRAINTS.md](CONSTRAINTS.md)**.

---

**WasteVision AI** is a mobile application that:

- **Uses the phone camera to scan waste** (take a photo or pick from gallery; optional live camera)
- **Detects the type of waste using AI** (CNN image classification on the backend)
- **Displays the waste category** (Plastic, Paper, Glass, Metal, Organic, Other)
- **Gives recycling instructions** (recommended bin, step-by-step instructions, eco tips, environmental impact)

The app uses **artificial intelligence and computer vision** so you get:

- **What the object is** and what material it is made of  
- **Which recycling bin it belongs to**  
- **Recycling instructions** and environmental impact  

This helps users avoid recycling mistakes, a major challenge in modern waste management. When waste is sorted incorrectly, recyclable materials often end up in landfills instead of being recycled.

Another powerful feature is **learning from users**. If the AI makes a mistake, users can correct the detection. The system stores these corrections, allowing the model to **continuously improve** over time.

**For organizations, municipalities, and environmental initiatives**, WasteVision AI can help to:

- Improve recycling accuracy  
- Increase environmental awareness  
- Reduce waste contamination  
- Support smarter, more sustainable waste management  

**WasteVision AI demonstrates how artificial intelligence can be applied to real-world environmental challenges, making sustainability accessible to everyone.**

You can run the app **in the browser** (web), **on your phone** (Expo Go or dev build), or install it as a **real app** via an **APK** (Android) or IPA (iOS) — see [BUILD_NATIF.md](BUILD_NATIF.md).

---

## Features

| Area | Features |
|------|----------|
| **Scan** | Take a photo or pick from gallery → instant AI classification |
| **Result** | Object name, material, recycling bin, eco tips, environmental impact |
| **Correction** | Report a wrong prediction and choose the correct category (human-in-the-loop) |
| **History** | Browse past scans, search, filter by category, correct entries |
| **Dashboard** | Stats and impact (scans, CO₂, goals) |
| **Coach** | Eco tips and best practices (text chat only) |
| **Help** | FAQ, quick guide, support (feedback, bug report, app rating) |

**No voice:** No speech-to-text, no text-to-speech, no audio prompts. All interaction is text and tap only. See [docs/VOICE.md](docs/VOICE.md).

---

## Tech Stack

| Layer | Stack |
|-------|--------|
| **Frontend** | React Native, Expo, React Navigation (iOS, Android, Web) |
| **Backend** | Python, FastAPI, Uvicorn, SQLite |
| **AI model** | **Python**, **TensorFlow** (Keras), **CNN** (MobileNetV2 image classification). Trained with a **public waste dataset** – see `ai_model/dataset/README_DATASET.md` and `ai_model/download_dataset.py`. |
| **Computer vision** | **OpenCV** to capture images from a camera (desktop demo: `python -m scripts.camera_demo`) and to **preprocess images** before inference (decode, resize, normalize in `backend/ml/preprocess.py`). Mobile app uses device camera via Expo; backend uses OpenCV for decode/resize. |
| **Dataset** | Public waste datasets (e.g. Kaggle); `download_dataset.py` maps classes to: plastic, paper_cardboard, glass, metal, organic, non_recyclable. |
| **Retraining** | User corrections stored as verified data; `retrain.py` for model updates |
| **APIs** | **Free only:** OpenStreetMap, Nominatim, OpenRouteService (optional key), expo-notifications. See [docs/FREE_APIS.md](docs/FREE_APIS.md). |

### Waste categories (AI)

The CNN detects exactly **6 categories**: **Plastic**, **Paper** (paper/cardboard), **Glass**, **Metal**, **Organic waste**, **Other** (non-recyclable). Each result includes the **waste category**, **recommended bin**, **recycling instructions** (step-by-step), and eco tips.

### Train the CNN and use the camera

1. **Prepare dataset** (6 class folders under `ai_model/dataset/`):
   ```bash
   cd ai_model
   pip install kaggle   # optional, for download_dataset.py
   python download_dataset.py
   ```
2. **Train** (from `ai_model/`):
   ```bash
   python train_model.py
   ```
   Saves `model.h5` and copies to `backend/data/weights/model.keras` for the API.
3. **OpenCV camera demo** (desktop webcam, from `backend/`):
   ```bash
   python -m scripts.camera_demo
   ```
   Press **SPACE** to capture and classify, **Q** to quit.
4. **Web app (phone camera)**  
   With the backend running, open **http://&lt;your-ip&gt;:8001/app/** on your phone to use the device camera, capture a frame, and get the waste category and recycling instructions.

---

## Getting Started

**No sign-up or paid API key is required.** Run the backend and frontend locally; the app works with zero external keys. See [CONSTRAINTS.md](CONSTRAINTS.md).

**Quick run (camera → AI → result):** See **[RUN.md](RUN.md)** for step-by-step: start backend, run Expo or Flutter, test the full pipeline.

### Prerequisites

- **Node.js** (npm)
- **Python 3.10, 3.11 or 3.12** for the backend (TensorFlow does not support Python 3.14). On Windows with multiple versions: `py -3.12 -m venv venv` in the `backend` folder.
- For mobile: **Expo Go** on your phone (same Wi‑Fi as your machine)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/WasteVision-AI.git
cd WasteVision-AI
```

### 2. Backend (API)

Utilise **Python 3.10, 3.11 ou 3.12** (pas 3.14). Sur Windows avec le launcher `py` :

```bash
cd backend
# Si tu as Python 3.14 par défaut, crée le venv avec 3.12 :
py -3.12 -m venv venv
# Sinon : python -m venv venv

# Windows:
.\venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8001
```

API runs at **http://localhost:8001** (docs: http://localhost:8001/docs).

### 3. Frontend (app)

In a **separate terminal**:

```bash
cd frontend
npm install
npx expo start
```

- **Sur le PC (navigateur)** : appuyer sur **`w`** pour ouvrir l’app dans le navigateur. Voir **[OUVRIR-SUR-PC.md](OUVRIR-SUR-PC.md)** pour les étapes détaillées.  
- **Mobile (dev)** : scanner le QR code avec Expo Go (téléphone sur le même Wi‑Fi).  
- **Mobile (vraie app)** : build natif (APK/IPA). Voir **[BUILD_NATIF.md](BUILD_NATIF.md)**.

### Si "Network request failed" sur téléphone

1. **Backend allumé** : dans un terminal, le backend doit tourner (`uvicorn ... --port 8001`).
2. **Même Wi‑Fi** : le téléphone et le PC doivent être sur le même réseau.
3. **Forcer l’IP du PC** : dans `frontend/app.json`, section `expo.extra`, mets l’IP de ton PC :
   ```json
   "extra": {
     "apiBaseUrl": "http://192.168.11.110:8001"
   }
   ```
   Remplace `192.168.11.110` par l’IP affichée par Expo au démarrage (ex: `exp://192.168.11.110:8081` → IP = `192.168.11.110`). Redémarre Expo (`npx expo start`) après modification.
4. **Pare-feu** : autorise le port 8001 sur le PC (Windows Pare-feu).

---

## Project Structure

```
WasteVision-AI/
├── backend/              # FastAPI, AI model, DB
│   ├── app/
│   │   ├── api/          # predict, classify, correction, history, feedback
│   │   ├── repositories/
│   │   └── services/
│   ├── ml/               # model, preprocessing
│   ├── main.py
│   ├── config.py
│   └── retrain.py        # retrain from user corrections
├── frontend/             # React Native (Expo) – main app
│   ├── screens/
│   ├── components/
│   ├── navigation/
│   ├── api/
│   └── App.js
├── frontend_flutter/     # Flutter app (Home, Result, Correction, Dashboard)
│   └── lib/              # see frontend_flutter/README.md
├── ai-model/             # CNN (model.py, dataset_loader.py, train_model.py, predict.py, waste_model.h5) – see SETUP.md
├── mobile_app/           # Flutter Android app (camera → /predict → waste type + recycling advice)
├── ai_model/             # CNN training + TFLite export (dataset/, train_model.py, convert_tflite.py)
├── SETUP.md              # Full setup: install, train, run backend, build APK, run locally
├── PITCH.md
├── TECHNICAL.md
├── ROADMAP.md
├── STRUCTURE.md
└── README.md
```

---

## Retraining (Human-in-the-Loop)

After collecting user corrections:

```bash
cd backend
python retrain.py
```

Restart the backend to load the updated model.

---

## Documentation

- **[SETUP.md](SETUP.md)** – **Install, train model, run backend, build Android APK, run locally**
- **[CONSTRAINTS.md](CONSTRAINTS.md)** – **Free APIs and open-source only; no paid services; fully runnable locally**
- **[GOAL_AND_STACK.md](GOAL_AND_STACK.md)** – Goal (camera scan, AI detection, category, recycling instructions), 6 waste categories, technical stack (Python, TensorFlow, CNN, OpenCV, public dataset)
- **[FEATURES.md](FEATURES.md)** – Feature checklist: live camera, eco points, map, AI corrections, env stats, UI  
- **[docs/VOICE.md](docs/VOICE.md)** – Voice (optional); text and tap by default  
- **[docs/INTEGRATION.md](docs/INTEGRATION.md)** – TFLite, free APIs (OSM), offline support, performance tips  
- **[STACK_AND_FEATURES.md](STACK_AND_FEATURES.md)** – Programming languages (frontend/backend), functionalities, UI languages  
- **[IMPROVEMENTS.md](IMPROVEMENTS.md)** – 5 improvements (eco score, badges, real-time detection, env stats; no map)  
- **[PITCH.md](PITCH.md)** – 30-second pitch (startup / competition)  
- **[TECHNICAL.md](TECHNICAL.md)** – AI, API, and architecture for developers  
- **[ROADMAP.md](ROADMAP.md)** – Development phases and next steps  
- **[STRUCTURE.md](STRUCTURE.md)** – Project structure (current repo + Flutter/MongoDB alternative)  
- **[frontend/LANGUAGES.md](frontend/LANGUAGES.md)** – How UI languages work and how to add i18n  
- **[DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md)** – Product and UX specifications  

---

## License

This project is under the **MIT** license. See [LICENSE](LICENSE).
