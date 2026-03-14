# Testing: Expo Camera ↔ Backend AI

Step-by-step instructions to verify the connection between the Expo app camera and the WasteVision backend `/predict` API.

---

## 1. Start the backend

From the project root:

```bash
cd backend
# Activate venv if you use one:
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
python -m uvicorn main:app --host 0.0.0.0 --port 8001
```

Leave this terminal open. You should see:

```
INFO:     Uvicorn running on http://0.0.0.0:8001
```

- API: **http://localhost:8001**
- Docs: **http://localhost:8001/docs**

---

## 2. Set backend URL for physical device (important)

If you will test on a **physical phone** with Expo Go, the phone must reach your PC. Set your PC’s local IP in the Expo app config:

1. Find your PC’s IP (e.g. `192.168.1.20`):
   - Windows: `ipconfig` → IPv4 Address
   - macOS/Linux: `ifconfig` or `ip addr`
2. Open **frontend/app.json** and set:

```json
"extra": {
  "apiBaseUrl": "192.168.1.20"
}
```

(Use your real IP; no `http://` or `:8001` — the app adds them.)

3. Restart Expo after changing `app.json`.

---

## 3. Start the Expo app

In a **new terminal** (from project root):

```bash
cd frontend
npm install
npx expo start
```

- Press **`w`** to open in the browser (web).
- Or scan the **QR code** with **Expo Go** on your phone (phone and PC on the same Wi‑Fi).

---

## 4. Take a photo and verify prediction

1. In the app, go to the **Scan** / **Camera** tab.
2. Allow camera access if prompted.
3. You should see the **camera preview**.
4. Tap **Capture** to take a photo.
5. A **loading indicator** (“Analyzing…”) should appear while the request is in progress.
6. When the backend responds, a **result card** should show:
   - **Waste type** (e.g. plastic, paper_cardboard)
   - **Confidence** (e.g. 92%)
   - **Recycling advice**
7. Tap **See full result** to open the full Result screen (optional).

---

## 5. Verify backend response shape

The `/predict` endpoint returns JSON that includes at least:

- `waste_type`: e.g. `"plastic"`
- `confidence`: e.g. `0.92`
- `recycling_advice`: e.g. `"Put in plastic recycling bin"` (or full instructions)

You can check in the browser: **http://localhost:8001/docs** → **POST /predict** → Try it out → upload an image → Execute, and inspect the response.

---

## 6. Debugging

- **Logs (development):**
  - **Captured image URI:** in the Metro/Expo console, look for `[Camera] Captured image URI: ...`
  - **API request:** `[API] Request POST http://...:8001/predict FormData with file`
  - **API base:** `[API] Native API base: http://...:8001` or `[API] Using explicit apiBaseUrl: ...`
  - **Backend response:** `[API] Response status: 200 body: ...` and `[Camera] Backend response: ...`

- **If the app says the backend is unreachable:**
  1. Confirm the backend is running (`http://localhost:8001` in the browser).
  2. On a **physical device**, set **expo.extra.apiBaseUrl** in **app.json** to your PC’s IP (step 2).
  3. Ensure phone and PC are on the **same Wi‑Fi** and that the firewall allows port **8001**.

- **If the camera doesn’t start:**
  - Grant camera permission in the device settings for Expo Go / the app.
  - On web, allow camera access in the browser, or use **Choose from gallery** to test the `/predict` flow.

---

## 7. Quick checklist

| Step | Action |
|------|--------|
| 1 | Start backend: `cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8001` |
| 2 | (Device only) Set `expo.extra.apiBaseUrl` in **frontend/app.json** to your PC IP |
| 3 | Start Expo: `cd frontend && npx expo start` |
| 4 | Open app in browser (**w**) or scan QR with Expo Go |
| 5 | Open Camera tab → allow camera → tap **Capture** |
| 6 | Confirm loading indicator, then result card with waste type, confidence, recycling advice |
