# WasteVision AI – Free APIs Only

**This app uses only free or open-source APIs.** No Google Maps, no paid keys, no paid tiers required. The project is **fully runnable locally** with no required API keys; see [CONSTRAINTS.md](../CONSTRAINTS.md).

- **Policy:** See [APIS_POLICY.md](APIS_POLICY.md). If a paid API is suggested anywhere, replace it with a free equivalent from this document.
- All services below are **free** (within stated limits). Core features (scan, classify, history) need **no API keys**; optional features (map, routing, remote push) use only the listed free options.

---

## Maps & geolocation

| Feature | API | Notes / usage |
|--------|-----|----------------|
| **Map tiles** | **OpenStreetMap** | Free, open-source. Used in the app for displaying the map (tile URL: `https://tile.openstreetmap.org/{z}/{x}/{y}.png`). No API key. See `frontend/screens/MapScreen.js`. |
| **Address search / geocoding** | **Nominatim (OSM)** | Free (OpenStreetMap). Converts coordinates ↔ addresses. Use for “search an address” or showing recycling point addresses. Base URL: `https://nominatim.openstreetmap.org/` – respect [usage policy](https://operations.osmfoundation.org/policies/nominatim/) (e.g. 1 req/s). |
| **Routing / directions** | **OpenRouteService** | Free up to **2 500 requests/day**. Compute routes from user to recycling points. [openrouteservice.org](https://openrouteservice.org/) – sign up for a free API key. |

| **Recycling points** | **Overpass API (OSM)** | Free, no key. Query OSM for recycling/waste nodes. Use in e.g. `frontend/services/mapApis.js`. |

### How to integrate (maps)

1. **OpenStreetMap tiles** – Set tile URL to `https://tile.openstreetmap.org/{z}/{x}/{y}.png`. No API key.
2. **Nominatim** – Search: `GET https://nominatim.openstreetmap.org/search?q=<address>&format=json`. Reverse: same host `/reverse?lat=&lon=&format=json`. Add `User-Agent` header; max 1 req/s.
3. **Overpass (recycling points)** – POST to `https://overpass-api.de/api/interpreter` with Overpass query for nodes; parse JSON, show markers; fallback to mock if request fails.
4. **OpenRouteService** – Free key at openrouteservice.org; store in env (e.g. `OPENROUTE_API_KEY`).

---

## Push notifications

| Feature | API | Notes / usage |
|--------|-----|----------------|
| **Remote push** | **Firebase Cloud Messaging (FCM)** | Free for standard usage. Send notifications from your backend to devices. Integrate with `expo-notifications` (Expo) or React Native Firebase. |
| **Alternative** | **OneSignal Free Plan** | Free up to **30 000 monthly active users**. Similar to FCM: device tokens, send from dashboard or API. Good if you prefer a hosted dashboard. |

Local notifications use **expo-notifications** (no external service). For *remote* pushes (e.g. “New recycling point near you”), use only FCM or OneSignal **free tier**.

### How to integrate (push)

1. **Local:** `expo-notifications` – no API key. Schedule reminders in the app (e.g. `notificationsService.js`).
2. **Remote – FCM:** Create a Firebase project (free), configure with Expo; send from backend using device token. Do not use paid Firebase plans.
3. **Remote – OneSignal:** Sign up (free tier), register device, send from dashboard or free API. Stay within free monthly active user limit.

---

## CO₂ / environmental impact

| Feature | API | Notes / usage |
|--------|-----|----------------|
| **CO₂ / environmental impact** | **OpenClimate** | Free, open-source. [OpenClimate Python client](https://openclimate-pyclient.readthedocs.io/) and [API](https://github.com/Open-Earth-Foundation/OpenClimate/blob/develop/api/API.md). Best from **backend**; app can keep fixed estimate per scan (`KG_CO2_PER_SCAN`) for “CO₂ saved” in the dashboard. |

### How to integrate (CO₂)

1. **App (simple):** Keep fixed constant per scan in `frontend/services/ecoScore.js` (`KG_CO2_PER_SCAN`). No API call.
2. **Backend (optional):** Install OpenClimate client; fetch region data and expose an endpoint. No paid API.

---

## Summary

- **Maps:** OSM tiles (in use) + Nominatim (geocoding) + OpenRouteService (routing, 2 500 req/day).
- **Push:** expo-notifications (local) + FCM or OneSignal (remote, free tier).
- **CO₂:** OpenClimate API for more accurate impact data when configured.

**Summary:** Use only the APIs listed above. Do not integrate Google Maps, paid geocoding, or other paid services. The project is **fully runnable locally**: backend + frontend + AI run on your machine; **no API key is required** for core flow (scan → classify → result → history). Optional: OpenStreetMap/Nominatim/Overpass (no key), OpenRouteService (free key), FCM/OneSignal (free tier), Kaggle (free account for dataset download). See [CONSTRAINTS.md](../CONSTRAINTS.md) and [APIS_POLICY.md](APIS_POLICY.md).
