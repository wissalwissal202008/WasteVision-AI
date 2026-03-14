# WasteVision AI – Project Constraints

**IMPORTANT: The entire project must respect the following.**

---

## 1. Free APIs only

- Use **only free APIs** for any external service (maps, geocoding, routing, push, CO₂, etc.).
- **No paid services.** No Google Maps, no paid geocoding, no paid image recognition, no paid push or analytics.
- **No API keys that require payment.** Optional free keys (e.g. OpenRouteService free tier, free Kaggle account for dataset download) are allowed; document them in [docs/FREE_APIS.md](docs/FREE_APIS.md).

See **[docs/APIS_POLICY.md](docs/APIS_POLICY.md)** and **[docs/FREE_APIS.md](docs/FREE_APIS.md)** for the approved list and integration rules.

---

## 2. Open-source libraries only

- All dependencies must be **open-source** (permissive licenses such as MIT, Apache 2.0, BSD).
- **Frontend:** React Native, Expo, React Navigation, etc. — all from the open-source ecosystem.
- **Backend:** Python, FastAPI, TensorFlow, OpenCV, SQLite, etc. — no proprietary SDKs or paid libraries.
- Do not add commercial or proprietary SDKs that require a paid plan for core or optional features.

---

## 3. No paid services

- Do not integrate any service that requires a **paid subscription** or **paid tier** for the features used in this project.
- If a doc or comment suggests a paid API, **replace it** with a free or open-source equivalent from [docs/FREE_APIS.md](docs/FREE_APIS.md).

---

## 4. No API keys that require payment

- **No API keys that require payment** anywhere in the repo or in the default run instructions.
- Optional **free** API keys (e.g. OpenRouteService free key, Kaggle for dataset download) must be clearly documented as optional; the app must run without them (with reduced or fallback behavior if applicable).

---

## 5. Fully runnable locally

- The project must be **fully runnable locally** without signing up for any paid or cloud service.
- **Backend:** Runs on your machine (e.g. `uvicorn` on `localhost:8001`). No required cloud deployment.
- **Frontend:** Connects to the backend at `localhost` (web) or the same LAN (Expo). No required hosted backend.
- **AI:** Model runs on the backend (TensorFlow) or optionally on-device (TFLite). No required third-party prediction API.
- **Data:** SQLite and local files. No required cloud database.
- **Optional features** (e.g. map tiles, recycling points, remote push) use only free APIs and optional free keys as documented; core flow (camera → classify → result → history) works with **zero API keys**.

---

## Summary

| Rule | Meaning |
|------|--------|
| Free APIs only | Only use APIs listed in docs/FREE_APIS.md; no paid external services. |
| Open-source only | All dependencies must be open-source; no proprietary/paid libraries. |
| No paid services | No paid subscriptions or paid tiers for any feature. |
| No paid API keys | No keys that require payment; optional free keys are allowed and documented. |
| Runnable locally | Backend + frontend + AI run on your machine; no required cloud or sign-up. |

When in doubt, prefer **local and free**: e.g. local notifications (expo-notifications), local backend, OSM/Overpass (no key), and optional free keys only where documented.
