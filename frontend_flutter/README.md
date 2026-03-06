# WasteVision AI – Flutter frontend

Application Flutter pour le tri des déchets par IA : prise de photo, résultat (nom, matériau, bac, conseils), correction et tableau de bord.

## Prérequis

- Flutter SDK (3.0+)
- Backend WasteVision en cours d’exécution (FastAPI sur le port 8001)

## Configuration de l’URL du backend

Dans `lib/services/api_service.dart`, la valeur par défaut est `http://10.0.2.2:8001` (émulateur Android). À adapter selon l’environnement :

- **Émulateur Android** : `http://10.0.2.2:8001`
- **Simulateur iOS** : `http://127.0.0.1:8001`
- **Appareil physique** (même Wi‑Fi que le PC) : `http://VOTRE_IP_PC:8001`

Vous pouvez aussi passer une URL au constructeur : `ApiService(baseUrl: 'http://...')`.

## Installation et lancement

```bash
cd frontend_flutter
flutter pub get
flutter run
```

## Écrans

| Écran | Fichier | Rôle |
|-------|---------|------|
| Home | `home_screen.dart` | Bouton « Prendre une photo » / « Importer une image », appel à `POST /classify`. |
| Result | `result_screen.dart` | Affiche nom, matériau, catégorie, bac, conseils recyclage ; bouton « Corriger l’IA ». |
| Correction | `correction_screen.dart` | Formulaire : choix de la bonne catégorie, envoi via `POST /correction`. |
| Dashboard | `dashboard_screen.dart` | Statistiques (objets triés, impact), badges (à brancher sur l’API). |

## API utilisée

- `POST /classify` – envoi de l’image, réception du résultat (object_name, material, category, recycling_tips, etc.).
- `POST /correction` – envoi de la correction (object_name, correct_label, user_id).

Voir le backend WasteVision-AI (FastAPI) pour la définition exacte des routes.
