# WasteVision AI — System architecture

End-to-end view of the **Expo** client, **FastAPI** backend, and **ML** stack. For a **UI / screen map**, see [docs/UI_ARCHITECTURE.md](docs/UI_ARCHITECTURE.md).

---

## High-level data flow

```
  [Expo app]  Camera / Gallery / Live scan
       |
       v
  multipart POST  (/predict | /classify | /detect)  + optional ?lang=
       |
       v
  [FastAPI]  --->  preprocess (OpenCV / PIL)
       |                |
       |                +-- CNN (model.keras)  --> class + confidence
       |                +-- YOLO (optional .pt) --> boxes + classes
       v
  SQLite (history, stats, detection logs) + uploads/
       |
       v
  JSON  --->  Result UI / live overlays
```

---

## 1. Frontend (Expo / React Native)

| Area | Role |
|------|------|
| Entry | `App.js` — gesture handler, theme, i18n, splash, onboarding, navigator. |
| Navigation | `src/utils/navigation/AppNavigator.js` — bottom tabs; scan stack. |
| Screens | `frontend/screens/`; re-exports in `src/screens/` where used. |
| API | `frontend/api/client.js` — `expo.extra.apiBaseUrl`. |
| i18n | `src/utils/i18n.js`, `frontend/locales/*.json` — FR / EN / AR. |

**Production:** set `app.json` `extra.apiBaseUrl`; use HTTPS in release.

---

## 2. Backend (FastAPI)

Routers under `app/api/`: predict, classify, detect, history, stats, feedback, correction, retrain. SQLite repositories; config in `config.py` (DB path, uploads, weights).

---

## 3. AI pipeline

- **CNN:** `backend/data/weights/model.keras` — `/predict`, `/classify`, fallback `/detect`.
- **YOLOv8 (optional):** `yolov8_waste.pt` — multi-object `/detect`.
- **Training:** `ai-model/` — see [MODEL.md](MODEL.md).

---

## 4. Camera to response

1. User captures image (or live interval).
2. Client POSTs multipart image.
3. Server validates, saves upload, runs model.
4. Server persists history/stats; returns JSON.

---

## 5. Related docs

| Document | Content |
|----------|---------|
| [MODEL.md](MODEL.md) | Dataset, training, limits |
| [STRUCTURE.md](STRUCTURE.md) | Folder tree |
| [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) | Pre-release checks |

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for hosting.
