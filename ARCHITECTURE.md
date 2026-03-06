# Architecture WasteVision AI – Composants d’une app mobile moderne

Référence : Splash, Onboarding, Auth, Home, Navigation, Profile, Settings, Search, Notifications, Error & Empty states.

---

## 1️⃣ Splash Screen

| Statut | Détail |
|--------|--------|
| ✅ Ajouté | Premier écran au démarrage : **logo** WasteVision, **animation** (fade + scale), **indicateur de chargement** (spinner). Affiché ~2,2 s puis passage à l’onboarding ou à l’app. |

---

## 2️⃣ Onboarding (première expérience)

| Statut | Détail |
|--------|--------|
| ✅ Ajouté | Affiché à la **première ouverture** : 3 écrans (présentation, bénéfices, CTA « Commencer »). Stockage `@wastevision_onboarding_done` pour ne plus afficher. |

**Objectif** : réduire la friction, expliquer ce que fait l’app et pourquoi l’utiliser.

---

## 2️⃣ Authentication (Login / Signup)

| Statut | Détail |
|--------|--------|
| 🔲 Prévu | Pas encore implémenté. **Prévu** : écrans Login / Signup, « Mot de passe oublié », option « Continuer en invité ». Backend auth (JWT) ou **Firebase / Supabase / Auth0** à brancher. |

---

## 3️⃣ Home Screen (Dashboard)

| Statut | Détail |
|--------|--------|
| ✅ Présent | **Accueil** : CTA « Scanner un déchet », résumé impact (nombre de scans, CO₂), accès rapide au scan. **Stats** (onglet) : objectifs, progression. |

---

## 4️⃣ Navigation

| Statut | Détail |
|--------|--------|
| ✅ Présent | **Bottom Tab Navigation** : Accueil, Scan, Stats, Coach, Historique, Profil, Paramètres. Pas de drawer/sidebar pour rester simple. |

---

## 5️⃣ User Profile

| Statut | Détail |
|--------|--------|
| ✅ Ajouté | Onglet **Profil** : infos utilisateur (mode invité ou connecté), photo, email (quand auth en place), lien vers Paramètres. |

---

## 6️⃣ Settings

| Statut | Détail |
|--------|--------|
| ✅ Ajouté | Écran **Paramètres** : notifications, thème (clair/sombre), langue, À propos, confidentialité. |

---

## 7️⃣ Notifications UI

| Statut | Détail |
|--------|--------|
| ✅ Ajouté | Écran **Notifications** (onglet Notif) : **empty state** « Aucune notification » avec message. Prévu : push (Expo / FCM), rappels, liste des alertes. |

---

## 8️⃣ Search / Filter

| Statut | Détail |
|--------|--------|
| ✅ Ajouté | **Historique** : **barre de recherche** (produit, bac), **filtres** par catégorie (Tous, Plastique, Verre, etc.). Empty state « Aucun résultat » si filtre/recherche sans résultat. |

---

## 9️⃣ Backend / Database

| Statut | Détail |
|--------|--------|
| ✅ Présent | **Backend** : FastAPI (Python), Uvicorn. **Base** : SQLite (historique des scans, corrections). Données utilisateur / auth à ajouter avec l’authentification. |

---

## 🔟 Error & Empty States

| Statut | Détail |
|--------|--------|
| ✅ Ajouté | **ErrorBoundary** pour les crashes. **Composants** : `EmptyState`, `ErrorState`, `NoInternetState`, `ServerErrorState` (icône, titre, message, bouton Réessayer). **Historique** : états « Pas de connexion », « Erreur », « Aucun scan », « Aucun résultat ». |

---

## Flow utilisateur (résumé)

```
Onboarding (1ère fois)
       ↓
Accueil (Home) ←→ Navigation (tabs)
       ↓              ├ Accueil
[Login/Signup]        ├ Scan
(prévu)               ├ Stats
       ↓              ├ Coach
Main App              ├ Historique
                      ├ Profil
                      └ Paramètres
```

---

## Prochaines étapes recommandées

1. **Auth** : brancher Firebase Auth ou Supabase (login, signup, forgot password).
2. **Notifications** : Expo Notifications ou FCM pour rappels et engagement.
3. **Erreurs** : écran « Pas de connexion », retry, messages clairs.
4. **Recherche / filtres** : dans l’historique (par catégorie, date).
