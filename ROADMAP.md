# WasteVision AI – Development Roadmap

This roadmap aligns the **strategic plan** (frontend, backend, AI, extras, deployment) with the **current state** of the project and next steps.

---

## Phase 1 – Quick Prototype ✅ (Done)

| Goal | Status | Notes |
|------|--------|-------|
| Simple frontend: scan + result | ✅ | React Native/Expo, Camera + Result screens, tabs |
| Minimal backend: receive image, return response | ✅ | FastAPI `POST /predict`, image upload, JSON response |
| Basic AI: 3–4 categories | ✅ | 6 categories (plastic, paper/carton, glass, metal, organic, non-recyclable) |

**Deliverables:** Working scan → result flow, history, corrections, feedback, help center, empty/error states.

---

## Phase 2 – Advanced AI 🔄 (In progress / Next)

| Goal | Status | Notes |
|------|--------|-------|
| Multi-class, accuracy > 85% | 🔄 | Current model baseline; measure accuracy, tune hyperparameters, consider more data |
| User corrections integrated | ✅ | PATCH `/history/:id/correct`, `is_verified`, export verified |
| Retraining pipeline | ✅ | `retrain.py` + verified export; run periodically to improve model |

**Next steps:**

- Define and run accuracy metrics (validation set, confusion matrix).
- Add more labeled data or augmentations if needed.
- Optionally: try transfer learning from a larger dataset (e.g. Open Images, custom waste dataset).
- Consider TensorFlow Lite / ONNX for future on-device inference.

---

## Phase 3 – UX & Engagement 🔄 (Partly done)

| Goal | Status | Notes |
|------|--------|-------|
| Ecological dashboard | ✅ | Stats tab, impact (scans, CO₂), goals |
| Badges / gamification | 🔲 | Not started; define badges (e.g. “10 scans”, “5 corrections”) |
| Notifications | 🔄 | Notifications screen + empty state; push not yet implemented |

**Next steps:**

- Design simple badge system (backend flags or counts, frontend display).
- Integrate **Expo Notifications** + backend (e.g. FCM) for push: reminders, tips, updates.
- Optional: in-app “eco score” or weekly summary.

---

## Phase 4 – Testing & Deployment 🔲 (Planned)

| Goal | Status | Notes |
|------|--------|-------|
| Beta with real users | 🔲 | Recruit testers (schools, municipalities, community) |
| Collect feedback | ✅ | In-app feedback (bug, suggestion, rating) + Help center |
| Play Store / App Store | 🔲 | EAS Build for Android/iOS; store listings, privacy policy |

**Next steps:**

- Set up **EAS Build** (or local `expo run:android` / `expo run:ios`) for release builds.
- Deploy backend to a public host (e.g. Railway, Render, VPS); configure production API URL in app.
- Prepare store assets: screenshots, description, privacy policy, optional terms.
- Run a closed beta, collect feedback, iterate.

---

## Phase 5 – Optional Enhancements 🔲 (Backlog)

| Idea | Description |
|------|-------------|
| **Multi-object detection** | Detect several objects in one image; classify each and show multiple bins. |
| **Real-time camera mode** | Analyze stream (e.g. every N frames) instead of single photo. |
| **Offline / on-device** | Export model to TFLite or ONNX; run inference on device when offline. |
| **Auth & sync** | User accounts, sync history and preferences across devices. |
| **Localization** | Multiple languages (UI + category labels + tips). |

---

## Summary Table

| Phase | Focus | Status |
|-------|--------|--------|
| 1 | Prototype (frontend + backend + basic AI) | ✅ Done |
| 2 | AI accuracy, retraining, data | 🔄 In progress |
| 3 | Dashboard, gamification, notifications | 🔄 Partly done |
| 4 | Beta, feedback, store deployment | 🔲 Planned |
| 5 | Multi-object, real-time, offline, auth | 🔲 Backlog |

Use this roadmap for sprint planning and to report progress to partners or in README/PITCH.
