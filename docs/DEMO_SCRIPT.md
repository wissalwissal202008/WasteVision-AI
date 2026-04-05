# Demo script (30–60 seconds) — WasteVision AI

Short guide for a **screen recording** or **live pitch**. Adjust timing to your pace (~45 s target).

---

## Before recording

1. Backend running (`uvicorn` on known port).
2. Phone on same Wi‑Fi with `apiBaseUrl` set, or use web build if demoing desktop.
3. Bright, clean object for scan (e.g. plastic bottle) and optionally a second object for live mode.
4. Close unrelated notifications; **do not disturb** on.

---

## Script (what to say + what to show)

| Time | Action on screen | Suggested narration (adapt) |
|------|------------------|-----------------------------|
| 0:00–0:08 | **Home** | "WasteVision AI helps you sort waste with your phone — free and open source." |
| 0:08–0:22 | Open **Scan**, take **photo** of one item | "I snap a photo; the app sends it to our FastAPI backend and TensorFlow model." |
| 0:22–0:35 | **Result** screen: category + recycling tip | "We get the category, confidence, and practical recycling advice in your language." |
| 0:35–0:48 | **Stats** tab | "The dashboard tracks estimated CO2 savings and counts by material." |
| 0:48–0:60 | **History** (optional) | "Past scans are stored locally on the server for history and improvement." |

---

## Optional B-roll (if time)

- **Live scan** with bounding boxes (YOLO weights installed).
- **Settings:** switch language FR → EN to show i18n.
- **Quick cut** to `localhost:8001/docs` to show the API (technical audience only).

---

## Tips

- Record **vertical 9:16** for mobile-first social posts; **1920×1080** for slides.
- Add **subtitles** for accessibility.
- End with repo URL or QR code to GitHub.

