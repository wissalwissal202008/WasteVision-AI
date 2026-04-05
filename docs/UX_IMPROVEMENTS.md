# UI/UX — Suggested improvements (non-breaking)

Small, high-impact enhancements for production polish. None of these are mandatory for the app to work.

## Loading

- **Consistent spinners** — Use the same `ActivityIndicator` size/color on Camera, Result, and Live scan overlays; avoid mixed ad-hoc loaders.
- **Skeleton or shimmer** — On **Historique** and **Stats**, brief placeholder rows while `GET /history` / `GET /stats` load.
- **Progress for uploads** — If images are large, optional upload progress (multipart) reduces perceived wait.

## Uncertain predictions

- **Low confidence threshold** — If `confidence < 0.5` (tunable), show a banner: *« Résultat incertain — vérifiez au bac »* with CTA to **rescan** or **corriger**.
- **Second choice** — When the model exposes top-k (future backend), show *« Peut-être aussi : … »* as secondary text only.

## Errors & feedback

- **Network errors** — Distinguish *timeout* vs *refused connection* with actionable text (*« Vérifiez que le serveur tourne sur … »* vs *« Pas de réseau »*).
- **Toast / snackbar** — After successful **correction** or **feedback**, a short non-blocking confirmation.
- **Haptics** — Light impact on successful analysis (iOS/Android) — optional, behind a setting.

## Accessibility & clarity

- **Touch targets** — Keep primary buttons ≥ 44 pt; ensure **TabBar** labels don’t truncate badly in **AR** (RTL).
- **Contrast** — Verify green-on-white and badge text in **dark mode** (if enabled).

## Onboarding

- Optional **“skip”** on last slide only; first slide explains **camera permission** purpose before system dialog.

---

Implement incrementally; measure with real users before adding complexity.
