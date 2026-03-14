# WasteVision AI – Technical Overview

For developers: how the AI, backend, and frontend work together.

---

## 1. High-Level Flow

```
[Mobile/Web App]  →  POST /predict (image)  →  [FastAPI Backend]
       ↑                      ↓
       │              [TensorFlow Model]
       │                      ↓
       │              JSON: category, bin, tips, impact
       └──────────────────────┘
       
User corrects?  →  PATCH /history/:id/correct  →  Stored in SQLite (verified)
Retraining      →  python retrain.py          →  New model weights
```

---

## 2. AI / ML Stack

| Component | Choice | Role |
|-----------|--------|------|
| **Framework** | TensorFlow / Keras | Training and inference |
| **Architecture** | MobileNetV2 (or similar CNN) | Image classification |
| **Input** | Resized, normalized image | e.g. 224×224 RGB |
| **Output** | 6 classes | plastic, paper_cardboard, glass, metal, organic, non_recyclable |
| **Inference** | On backend (Python) | Not on device in current version |

**Pipeline:**

1. Image upload (multipart) to `/predict`.
2. Preprocess: resize, normalize, batch of 1.
3. `model.predict()` → class probabilities.
4. Map class index to category; lookup bin, eco tips, impact text (from config or DB).
5. Return JSON to client.

**Retraining (human-in-the-loop):**

- Corrections stored in `scan_history` with `corrected_category` and `is_verified=1`.
- Export verified data: `GET /history/export/verified`.
- `retrain.py` loads this dataset, fine-tunes or retrains the model, saves new weights.
- Backend loads the updated model on next restart.

---

## 3. Backend (FastAPI)

| Concern | Implementation |
|---------|-----------------|
| **API** | FastAPI, REST |
| **Endpoints** | `/predict`, `/history`, `/history/:id/correct`, `/history/export/verified`, `/feedback` |
| **Database** | SQLite (file-based), optional migration to PostgreSQL later |
| **Storage** | Uploaded images on disk; path/config in `config.py` |
| **CORS** | Enabled for frontend (any origin in dev) |

**Main modules:**

- `app/api/predict.py` – receive image, run model, return category + metadata.
- `app/api/history.py` – list scans, correct by id, export verified.
- `app/api/feedback.py` – store user feedback (bug, suggestion, rating).
- `app/repositories/` – DB access for history and feedback.
- `app/services/predictor.py` – model loading and inference.
- `app/database.py` – SQLite connection and schema (scan_history, feedback).

---

## 4. Frontend (React Native / Expo)

| Concern | Implementation |
|---------|-----------------|
| **Framework** | React 19, React Native, Expo SDK 54 |
| **Navigation** | React Navigation, bottom tabs (no stack in main flow to avoid known crashes) |
| **Screens** | Home, Scan (camera), Result, History, Stats, Coach, Profile, Notifications, Settings |
| **Extra screens** | Onboarding, Splash, Help (FAQ + guide + support), Feedback (bug/suggestion/rating) |
| **State** | Local component state; no global store in current version |
| **API** | `fetch` in `frontend/api/client.js`; base URL resolved for web vs Expo (dev server host) |

**Important flows:**

- **Scan:** Camera or image picker → upload to `/predict` → Result screen with category, bin, tips; option to correct later from History.
- **History:** GET `/history`, search/filter locally; PATCH `/history/:id/correct` for user corrections.
- **Feedback:** POST `/feedback` with type (bug | suggestion | rating) and optional content/rating.
- **Help:** In-app only (FAQ, quick guide, “Contact support” → Feedback).

---

## 5. Data Models (Conceptual)

**Scan (history):**

- `id`, `image_name`, `object_name`, `product_type`, `predicted_category`, `recommended_bin`, `corrected_category`, `is_verified`, `created_at`.

**Feedback:**

- `id`, `type` (bug | suggestion | rating), `content`, `rating` (1–5), `created_at`.

**Config / static:**

- Category names, bin labels, eco tips, impact texts – in backend config or DB.

---

## 6. Security & Deployment (Summary)

- **Auth:** Not implemented; if added, use only free/open-source options (e.g. JWT, or free tier of Firebase/Supabase). See [CONSTRAINTS.md](CONSTRAINTS.md).
- **API:** Dev server with CORS open; for production, restrict origins and consider rate limiting.
- **Secrets:** No API keys in repo; use env vars for any future keys.
- **Build:** Expo EAS or `expo run:android` / `expo run:ios` for standalone apps; backend can run on any host (e.g. Railway, Render, VPS).

---

## 7. How to Extend

- **New category:** Add class in model and in `config.CATEGORY_NAMES` (and frontend labels).
- **New endpoint:** Add router in `app/api/`, register in `main.py`.
- **New screen:** Add in `frontend/screens/` and wire in navigation or from Settings/Profile.
- **Notifications:** Use Expo Notifications; backend can store preferences and send via FCM/APNs when implemented.

This document reflects the current architecture; update it as the stack evolves.
