# WasteVision AI – Smart Waste Recognition 🌱♻️

**WasteVision AI** is designed to make waste sorting **simple**, **intelligent**, and **educational**.

Imagine holding an object — a plastic bottle, a food container, or a metal can — and not knowing where to dispose of it. Instead of guessing, you take a photo with the app. The app uses **artificial intelligence and computer vision** to recognize the object and provide:

- **What the object is**
- **What material it is made of**
- **Which recycling bin it belongs to**
- **Its environmental impact**

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
| **Coach** | Eco tips and best practices |
| **Help** | FAQ, quick guide, support (feedback, bug report, app rating) |

---

## Tech Stack

| Layer | Stack |
|-------|--------|
| **Frontend** | React Native, Expo, React Navigation (iOS, Android, Web) |
| **Backend** | Python, FastAPI, Uvicorn, SQLite |
| **AI** | TensorFlow/Keras, MobileNetV2 – 6 classes: plastic, paper/carton, glass, metal, organic, non-recyclable |
| **Retraining** | User corrections stored as verified data; `retrain.py` for model updates |

---

## Getting Started

### Prerequisites

- **Node.js** (npm)
- **Python 3.10+** (pip)
- For mobile: **Expo Go** on your phone (same Wi‑Fi as your machine)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/WasteVision-AI.git
cd WasteVision-AI
```

### 2. Backend (API)

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
├── ai_model/             # CNN training + TFLite export (dataset/, train_model.py, convert_tflite.py)
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

- **[STACK_AND_FEATURES.md](STACK_AND_FEATURES.md)** – Programming languages (frontend/backend), functionalities, UI languages  
- **[PITCH.md](PITCH.md)** – 30-second pitch (startup / competition)  
- **[TECHNICAL.md](TECHNICAL.md)** – AI, API, and architecture for developers  
- **[ROADMAP.md](ROADMAP.md)** – Development phases and next steps  
- **[STRUCTURE.md](STRUCTURE.md)** – Project structure (current repo + Flutter/MongoDB alternative)  
- **[frontend/LANGUAGES.md](frontend/LANGUAGES.md)** – How UI languages work and how to add i18n  
- **[DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md)** – Product and UX specifications  

---

## License

This project is under the **MIT** license. See [LICENSE](LICENSE).
