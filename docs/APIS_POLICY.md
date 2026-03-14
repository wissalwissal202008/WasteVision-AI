# WasteVision AI – API Policy

## Use only free or open-source APIs

**Whenever an external service is required, use only free or open-source APIs.**

- **Do not** integrate paid APIs (e.g. Google Maps, paid geocoding, paid image recognition, paid push services) for core or optional features.
- **If a paid API is suggested** in docs or code comments, **replace it** with a free or open-source equivalent from the approved list below.
- External services are used **only when necessary** (e.g. maps, geocoding, routing, push, CO₂ data). The main detection uses the **own backend** and optional **on-device TensorFlow Lite**; no third-party prediction API is required.

## Approved services (free / open-source)

The **only** external APIs and services you should use are listed in **[FREE_APIS.md](FREE_APIS.md)**. **WasteVision does not use map or geolocation**; do not add a Recycling Map. That document includes (for reference only; map/location not used in app):

| Need | Free / open-source option | Integration |
|------|---------------------------|-------------|
| Map tiles | OpenStreetMap | No key. [Instructions](FREE_APIS.md#maps--geolocation) |
| Geocoding | Nominatim (OSM) | No key; respect 1 req/s. [Instructions](FREE_APIS.md#maps--geolocation) |
| Recycling points | Overpass API (OSM) | No key. [Instructions](FREE_APIS.md#maps--geolocation) |
| Routing | OpenRouteService | Free key, 2 500 req/day. [Instructions](FREE_APIS.md#maps--geolocation) |
| Push (remote) | FCM or OneSignal | Free tier. [Instructions](FREE_APIS.md#push-notifications) |
| CO₂ / impact | OpenClimate | Free, open-source. [Instructions](FREE_APIS.md#co--environmental-impact) |
| Detection | Own backend + optional TFLite | No external prediction API. |

**Integration instructions** for each service are in **FREE_APIS.md**. Use that file as the single reference when adding or changing any external API.

## Summary

- **Policy:** Free or open-source APIs only; replace any paid suggestion with an approved free equivalent.
- **List and how-to:** [FREE_APIS.md](FREE_APIS.md).
- **Optional production integrations (TFLite, offline):** [INTEGRATION.md](INTEGRATION.md). Map/location is not used.
