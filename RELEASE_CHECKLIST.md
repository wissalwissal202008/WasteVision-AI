# Release checklist — WasteVision AI

Use this before a **demo**, **store build**, or **production deploy**. Adapt items to your hosting (VPS, PaaS, on-prem).

---

## Testing

- [ ] Backend starts without errors; `/docs` loads.
- [ ] `POST /predict` returns valid JSON for a sample JPEG/PNG.
- [ ] `POST /detect` returns a list (with or without YOLO weights).
- [ ] Mobile app reaches API from **real device** (`apiBaseUrl` correct, same network or HTTPS).
- [ ] Scan flow: camera → result → history entry visible (if applicable).
- [ ] **Stats** increment after classify/predict/detect paths used by the app.
- [ ] Switch **language** (FR / EN / AR) and verify key strings + RTL for AR.
- [ ] **Offline / wrong URL:** app shows a clear error (no silent hang).

## Build

- [ ] `frontend`: `npm install` clean; `npx expo start` / web build as needed.
- [ ] `backend`: `pip install -r requirements.txt` in a fresh venv.
- [ ] Weights present: `model.keras` (and optionally `yolov8_waste.pt`).
- [ ] Android: `expo prebuild` + release variant; **signing** keystore configured.
- [ ] iOS (if applicable): certificates, provisioning profiles, App Store metadata.

## Deployment

- [ ] **HTTPS** in production; API base URL updated in app config / env.
- [ ] **CORS** restricted to known app origins.
- [ ] **Environment variables** for secrets (no keys in git).
- [ ] **SQLite** path persistent on server; backups scheduled if data matters.
- [ ] **Uploads** directory size limits / cleanup policy.
- [ ] Process manager (systemd, PM2, Docker) restarts service on failure.

## Security

- [ ] No default admin passwords; minimal attack surface on admin endpoints.
- [ ] File upload: **size cap**, **type validation**, rate limiting if public.
- [ ] Dependencies scanned (`pip audit`, `npm audit`) — critical issues addressed.
- [ ] Error responses do **not** leak stack traces to clients in production.

## Presentation / demo

- [ ] Demo script rehearsed (see [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md)).
- [ ] README **App Preview** screenshots updated (optional).
- [ ] Repository **default branch** up to date; tag release if needed.

---

**Sign-off:** _________________  **Date:** _________________

