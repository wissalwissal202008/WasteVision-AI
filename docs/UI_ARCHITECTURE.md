# WasteVision AI — UI & product architecture (legacy reference)

> **Note:** For **system architecture** (Expo ↔ FastAPI ↔ models), see [ARCHITECTURE.md](../ARCHITECTURE.md) at the repo root.

This document maps **screens, navigation, and UX states** (splash, onboarding, tabs, empty/error patterns).

---

## 1. Splash Screen

| Statut | Détail |
|--------|--------|
| ✅ | Premier écran : logo, animation, indicateur de chargement (~2,2 s), puis onboarding ou app. |

## 2. Onboarding

| Statut | Détail |
|--------|--------|
| ✅ | Première ouverture : 3 écrans + CTA « Commencer ». Clé `@wastevision_onboarding_done`. |

## 3. Authentication (Login / Signup)

| Statut | Détail |
|--------|--------|
| 🔲 Prévu | Non implémenté. Voir [CONSTRAINTS.md](../CONSTRAINTS.md) pour auth open source uniquement. |

## 4. Home & Stats

| Statut | Détail |
|--------|--------|
| ✅ | Accueil : CTA scan, résumé impact. Onglet Stats : objectifs, progression. |

## 5. Navigation

| Statut | Détail |
|--------|--------|
| ✅ | Bottom tabs : Accueil, Scan, Stats, Coach, Historique, Profil, Paramètres. |

## 6. Profile & Settings

| Statut | Détail |
|--------|--------|
| ✅ | Profil (invité / futur connecté), Paramètres (thème, langue, notifications, à propos). |

## 7. Notifications UI

| Statut | Détail |
|--------|--------|
| ✅ | Écran Notifications ; empty state. Push : prévu (Expo / FCM). |

## 8. Search / Filter (History)

| Statut | Détail |
|--------|--------|
| ✅ | Recherche, filtres par catégorie, empty states. |

## 9. Backend / Database

| Statut | Détail |
|--------|--------|
| ✅ | FastAPI + SQLite (historique, corrections). Auth utilisateur à ajouter avec login. |

## 10. Error & Empty States

| Statut | Détail |
|--------|--------|
| ✅ | `ErrorBoundary`, `EmptyState`, `ErrorState`, états réseau / serveur / liste vide. |

## User flow (summary)

```
Onboarding (first launch)
       ↓
Home ←→ Tabs: Home | Scan | Stats | Coach | History | Profile | Settings
```

## Suggested next steps

1. Optional auth (JWT / free-tier providers per CONSTRAINTS.md).
2. Push notifications.
3. Clear offline / retry UX.
4. History filters by date.
