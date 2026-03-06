# WasteVision AI – Project Structure

Two reference layouts: **current repo** (React Native + FastAPI + SQLite) and **alternative** (Flutter + MongoDB + separate AI module).

---

## Current structure (this repo)

**Stack:** React Native (Expo) · FastAPI · SQLite · TensorFlow/Keras (inside backend)

```
WasteVision-AI/
│
├── frontend/                      # Application mobile (React Native / Expo)
│   ├── App.js                     # Entrée de l’app (Splash → Onboarding → Tabs)
│   ├── app.json                   # Config Expo (package, bundleId)
│   ├── package.json
│   ├── api/
│   │   └── client.js              # Connexion backend (predict, history, feedback)
│   ├── components/                # Composants UI réutilisables
│   │   ├── Card.js
│   │   ├── PrimaryButton.js
│   │   ├── SecondaryButton.js
│   │   ├── EmptyState.js
│   │   ├── ErrorState.js
│   │   └── index.js
│   ├── constants/
│   │   └── theme.js
│   ├── navigation/
│   │   └── AppNavigator.js        # Bottom tabs (Accueil, Scan, Stats, Coach, Historique, Profil, Notif, Paramètres)
│   ├── screens/
│   │   ├── HomeScreen.js
│   │   ├── CameraScreen.js
│   │   ├── ResultScreen.js
│   │   ├── HistoryScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── AssistantScreen.js     # Coach éco
│   │   ├── ProfileScreen.js
│   │   ├── SettingsScreen.js
│   │   ├── NotificationsScreen.js
│   │   ├── FeedbackScreen.js     # Donner mon avis (bug, suggestion, note)
│   │   ├── HelpScreen.js          # FAQ, guide rapide, support
│   │   ├── SplashScreen.js
│   │   └── OnboardingScreen.js
│   ├── UX_LAYERS.md
│   └── MOBILE_APP.md
│
├── backend/                       # API et base de données
│   ├── main.py                    # FastAPI app, CORS, routers, static uploads
│   ├── config.py                  # DATABASE_PATH, UPLOADS_DIR, CATEGORY_NAMES, etc.
│   ├── requirements.txt
│   ├── retrain.py                 # Réentraînement à partir des corrections (verified)
│   ├── app/
│   │   ├── api/
│   │   │   ├── predict.py         # POST /predict (image → catégorie, bac, conseils)
│   │   │   ├── history.py         # GET /history, PATCH /:id/correct, GET /export/verified
│   │   │   └── feedback.py        # POST /feedback (bug, suggestion, rating)
│   │   ├── repositories/
│   │   │   ├── history.py
│   │   │   └── feedback.py
│   │   ├── services/
│   │   │   ├── predictor.py       # Chargement modèle + inference
│   │   │   └── responses.py      # Textes par catégorie (bac, impact, conseils)
│   │   ├── database.py            # SQLite, tables scan_history + feedback
│   │   └── models.py
│   └── ml/                        # Modèle IA (dans le backend)
│       ├── model_loader.py        # Chargement .keras
│       ├── preprocess.py          # Redimensionnement, normalisation
│       └── product_detector.py    # (optionnel) détection produit
│
├── frontend_flutter/               # Client Flutter (optionnel)
│   ├── lib/
│   │   ├── main.dart
│   │   ├── screens/
│   │   │   ├── home_screen.dart
│   │   │   ├── result_screen.dart
│   │   │   ├── correction_screen.dart
│   │   │   └── dashboard_screen.dart
│   │   └── services/
│   │       └── api_service.dart
│   ├── pubspec.yaml
│   └── README.md
├── ai_model/                       # Entraînement CNN + TFLite (optionnel)
│   ├── dataset/                    # Images par catégorie (voir README)
│   │   └── README.md
│   ├── train_model.py              # MobileNetV2, sortie model.h5
│   └── convert_tflite.py           # model.h5 → model.tflite
├── README.md
├── PITCH.md
├── TECHNICAL.md
├── ROADMAP.md
├── STRUCTURE.md                   # Ce fichier
├── ARCHITECTURE.md
├── DEVELOPMENT_PLAN.md
└── .gitignore
```

**Data:** SQLite (`backend/data/wastevision.db`), images in `backend/data/uploads/`, weights in `backend/data/weights/`. Corrections Flutter stockées dans la table `corrections`.

---

## Alternative structure (Flutter + MongoDB + separate AI)

**Stack:** Flutter (Dart) · FastAPI or Express · MongoDB · Keras + TFLite (separate `ai_model/`)

A **Flutter client** and a **standalone AI training** folder exist in this repo:

- **frontend_flutter/** – Flutter app (Home, Result, Correction, Dashboard) using `POST /classify` and `POST /correction`.
- **ai_model/** – Scripts to train a CNN (MobileNetV2) and export to TFLite; dataset in `dataset/` with one folder per category.

Use the diagram below as a **reference** for a layout with MongoDB (current backend uses SQLite).

```
WasteVisionAI/
│
├── frontend/                      # Application mobile (Flutter)
│   ├── lib/
│   │   ├── main.dart              # Entrée de l’app (Flutter)
│   │   ├── screens/
│   │   │   ├── home_screen.dart
│   │   │   ├── result_screen.dart
│   │   │   ├── dashboard_screen.dart
│   │   │   └── correction_screen.dart
│   │   ├── widgets/               # Composants UI réutilisables
│   │   └── services/
│   │       └── api_service.dart    # Connexion Backend
│   └── pubspec.yaml
│
├── backend/                       # API et base de données
│   ├── app.py                     # FastAPI / Express
│   ├── models/                    # Modèles de données (MongoDB)
│   │   ├── object_model.py
│   │   └── correction_model.py
│   ├── routes/
│   │   ├── object_routes.py
│   │   └── correction_routes.py
│   └── requirements.txt
│
├── ai_model/                      # Modèle IA (dossier dédié)
│   ├── dataset/                   # Images d’objets triées par catégorie
│   ├── train_model.py             # Script d’entraînement du CNN
│   ├── model.h5                   # Modèle entraîné (Keras)
│   └── convert_tflite.py         # Conversion pour mobile (TFLite)
│
├── README.md
└── .gitignore
```

**Mapping rapide :**

| Rôle              | Ce repo (actuel)     | Alternative (diagramme)   |
|-------------------|----------------------|---------------------------|
| Frontend          | `frontend/` (Expo)   | `frontend/lib/` (Flutter)  |
| Entrée app        | `App.js`             | `main.dart`                |
| Écrans            | `screens/*.js`       | `screens/*.dart`           |
| API client        | `api/client.js`      | `services/api_service.dart`|
| Backend API       | `backend/main.py` + `app/api/` | `app.py` + `routes/` |
| Données           | SQLite + `repositories/` | MongoDB + `models/`  |
| IA                | `backend/ml/` + `retrain.py` | `ai_model/` (train, .h5, tflite) |

---

## Choix courant du repo

- **Frontend** : React Native (Expo) pour une seule codebase iOS + Android + Web et intégration simple avec le backend.
- **Backend** : FastAPI + SQLite pour éviter une dépendance MongoDB en phase prototype ; migration possible plus tard.
- **IA** : dans le backend pour un déploiement simple (un seul serveur) ; `retrain.py` utilise les données vérifiées exportées par l’API.

Si tu veux migrer vers la structure “Flutter + MongoDB + ai_model/”, on peut détailler les étapes (sans toucher au repo actuel, ou en créant une branche dédiée).
