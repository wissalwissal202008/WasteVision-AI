# WasteVision AI – Automatic AI Learning from User Corrections

This document describes the **machine learning feedback loop**: how user corrections are stored, how the model is retrained incrementally, and how to keep everything working with **free, open-source** tools only.

---

## 1. Overview

| Step | Where | What |
|------|--------|------|
| 1. User corrects | App (UI only) | User selects the right category when the AI is wrong. No voice. |
| 2. Store correction | Backend **SQLite** | `PATCH /history/:id/correct` → `scan_history.corrected_category`, `is_verified = 1`. Image already in `data/uploads/`. |
| 3. Offline queue | App **AsyncStorage** | If backend is unreachable, correction is queued locally; synced when app comes to foreground (see `correctionsQueue.js`). |
| 4. Retrain | Backend **retrain.py** | Loads verified records from SQLite, fine-tunes MobileNetV2 on new data, saves weights to `data/weights/model.keras`. |
| 5. Use new model | Backend | Restart uvicorn to load the new weights; next predictions use the improved model. |

**Incremental learning:** `retrain.py` uses `get_model()`, which loads **existing weights** if present. So each run fine-tunes the current model on the latest verified corrections; previous training is not lost.

---

## 2. User correction paths

- **UI:** Result screen → “Corriger” → choose category in modal. Same for History when correcting an old scan.
- No voice: corrections are tap-only. Result screen → “Corriger” → “Correct with voice” → e.g. “This is plastic not glass”. Parsed and sent as a normal correction.

This calls `submitCorrection(scanId, correctedCategory)` (UI only; no voice). On network failure, the app stores the correction in the **offline queue** (AsyncStorage) and shows “Saved locally; will sync when online.” When the app returns to foreground, `flushPendingCorrections()` sends queued items to the backend.

---

## 3. Backend storage (SQLite)

- **Table:** `scan_history` (see `backend/app/repositories/history.py`).
- **Relevant columns:** `id`, `image_name`, `predicted_category`, `corrected_category`, `is_verified`, `created_at`.
- When a correction is applied: `corrected_category` is set and `is_verified = 1`. Images live in `backend/data/uploads/` (filename = `image_name`).

No paid service; SQLite is file-based and free.

---

## 4. Retraining (retrain.py)

- **Script:** `backend/retrain.py`.
- **Input:** Verified rows from `get_verified_for_training(limit=500)` (image path + `corrected_category`).
- **Model:** MobileNetV2 (same as inference), loaded via `get_model()` (existing weights if present).
- **Process:** Preprocess images (224×224), fit for 15 epochs, save to `config.WEIGHTS_PATH` (`data/weights/model.keras`).
- **Run manually:** `cd backend && python retrain.py`.
- **Trigger via API:** `POST /retrain` runs `retrain.py` in a **background thread** so the API stays responsive. After it finishes, **restart the backend** to load the new model.

Incremental behavior: because `get_model()` loads existing weights, each retrain run **adds** learning from new corrections instead of training from scratch.

---

## 5. Optional: automatic retrain after N corrections

To retrain automatically (e.g. after every 10 new verified corrections):

- **Option A:** Cron job on the server: e.g. every night run `python retrain.py` and restart the backend.
- **Option B:** Backend logic: in `PATCH /history/:id/correct`, increment a counter (or count verified rows); when count crosses a threshold, call the same logic as `POST /retrain` (run retrain in background). No extra paid service.

---

## 6. On-device detection (TensorFlow Lite)

For **live camera** or **offline** inference on the device:

1. Export the Keras model to TFLite: `cd backend && python export_tflite.py` → `data/weights/wastevision.tflite`.
2. Use a React Native TFLite bridge (e.g. `react-native-tensorflow/lite` or custom native module) to load the `.tflite` and run inference on camera frames.
3. Preprocess frames like the backend (224×224, same normalization).
4. Labels: same category keys; use `getCategoryColor` / `getWasteTypeLabel` for the overlay.

Corrections and retraining stay on the backend (SQLite + retrain.py). You can periodically export a new `.tflite` from the updated Keras model and ship it in the app or download it at runtime.

---

## 7. File reference

| Component | File(s) |
|-----------|--------|
| Correction API | `backend/app/api/history.py` (PATCH `/history/:id/correct`) |
| Retrain trigger | `backend/app/api/retrain.py` (POST `/retrain`) |
| Retrain script | `backend/retrain.py` |
| Model loading | `backend/ml/model_loader.py` |
| Offline queue | `frontend/services/correctionsQueue.js` |
| Sync on foreground | `frontend/App.js` (AppState → `flushPendingCorrections`) |
| Submit correction | `frontend/api/client.js` (`submitCorrection`) |
| Result screen correction | `frontend/screens/ResultScreen.js` |
| TFLite export | `backend/export_tflite.py` |

---

## 8. Constraints (free / open-source)

- **Storage:** SQLite (backend), AsyncStorage (app queue). No paid DB.
- **Retraining:** TensorFlow/Keras, run locally. No paid ML platform.
- **APIs:** No paid APIs; optional free tiers are documented in `FREE_APIS.md`. No voice/speech/TTS/STT in this app.

This keeps the entire AI learning loop free and suitable for offline-capable, privacy-friendly deployment.
