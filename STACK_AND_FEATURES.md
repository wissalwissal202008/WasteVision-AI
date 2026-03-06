# WasteVision AI – Programming languages, functionalities & UI languages

Quick reference: what runs where, what the app does, and how UI languages work.

---

## 1. Programming languages (frontend & backend)

| Part | Programming language | Main technologies |
|------|----------------------|-------------------|
| **Frontend (main app)** | **JavaScript** | React, React Native, Expo, React Navigation |
| **Frontend (optional)** | **Dart** | Flutter (`frontend_flutter/`) – alternative client |
| **Backend** | **Python** | FastAPI, Uvicorn, SQLite, Pydantic |
| **AI / ML** | **Python** | TensorFlow, Keras (MobileNetV2), NumPy, PIL |
| **Training scripts** | **Python** | `retrain.py`, `ai_model/train_model.py`, `convert_tflite.py` |

Summary:
- **Frontend**: JavaScript (React Native/Expo); optional Flutter in Dart.
- **Backend & AI**: Python only.

---

## 2. Main functionalities

| Area | What it does |
|------|----------------|
| **Scan** | User takes a photo or picks from gallery → image sent to backend → AI classifies (6 waste categories). |
| **Result** | Shows: object name, material, recycling bin, environmental impact, eco tip. User can open correction. |
| **Correction** | User selects correct category when AI is wrong → sent to backend; data used for retraining (human-in-the-loop). |
| **History** | List of past scans, search, filter by category. Correct an entry from here. |
| **Dashboard / Stats** | Count of scans, CO₂ saved, weekly goal, impact block. |
| **Coach** | Eco tips and good practices. |
| **Help** | FAQ, quick guide, link to support (feedback). |
| **Feedback** | Report bug, send suggestion, rate app (1–5). Stored via `POST /feedback`. |
| **Settings** | Notifications, dark mode (UI), language (display only), version, help, feedback, legal. |
| **Onboarding & Splash** | First-time slides; splash screen at launch. |

Backend exposes: `POST /predict` (or `/classify`), `GET /history`, `PATCH /history/:id/correct`, `GET /history/export/verified`, `POST /feedback`.

---

## 3. UI languages (what the user sees)

| Topic | Current state |
|-------|----------------|
| **Interface language** | **French only.** All labels and messages are hardcoded in French in the frontend. |
| **i18n / localization** | **Not implemented.** No `react-i18next` or similar; no translation files. |
| **Settings “Langue”** | Displays “Français” only; changing language is not implemented. |
| **Dates** | Formatted with `toLocaleDateString("fr-FR", ...)` (e.g. in History). |

To add multiple UI languages (e.g. French, English, Arabic): see **[frontend/LANGUAGES.md](frontend/LANGUAGES.md)** for a step-by-step (i18next, expo-localization, locales, and language selector in Settings).

---

## 4. One-page summary

| Question | Answer |
|----------|--------|
| **Frontend language?** | JavaScript (React Native/Expo). Optional: Dart (Flutter). |
| **Backend language?** | Python (FastAPI). |
| **AI language?** | Python (TensorFlow/Keras). |
| **Main functionalities?** | Scan → result → correction, history, dashboard, coach, help, feedback, settings. |
| **UI languages?** | French only; multi-language possible via i18n (see LANGUAGES.md). |
