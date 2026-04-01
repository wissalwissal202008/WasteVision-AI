# WasteVision AI

**Détection de déchets en temps réel sur mobile.** Photographiez ou filmez vos déchets, obtenez la catégorie et des **conseils de tri** (bac, recyclage). Stack **100 % gratuite et open source** — pas d’API payante obligatoire.

![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-green)
![Expo](https://img.shields.io/badge/Expo-React%20Native-000020)
![License](https://img.shields.io/badge/License-MIT-yellow)

Application mobile **wastevision-ai** v1.0.0 (voir `frontend/package.json`).

---

## Ce que fait l’application

| Étape | Description |
|--------|-------------|
| **Caméra** | Photo, galerie ou **scan live** (aperçu + détections périodiques). |
| **IA** | Classifieur CNN (TensorFlow/Keras) et, en option, **YOLOv8** pour plusieurs objets et boîtes englobantes. |
| **Résultat** | Type de déchet (plastique, papier/carton, verre, métal, organique, non recyclable), confiance et **conseils de recyclage**. |

**En plus :** corrections utilisateur, historique des scans, tableau de bord (stats, impact CO₂), coach éco, astuces de tri, notifications, **interface multilingue (FR / EN / AR)**, et build **APK Android**.

---

## Fonctionnalités

- **Scan photo** — Prise de vue ou galerie → classification immédiate.
- **Scan live** — Aperçu caméra, détection à intervalle, rectangles, libellés et conseils (mobile natif ; le web affiche un message d’orientation).
- **Conseils de tri** — Bac recommandé, instructions, astuces écologiques.
- **Corrections** — Signaler une erreur de prédiction pour améliorer le système.
- **Historique** — Consulter les scans passés, filtrer par catégorie.
- **Statistiques** — Tableau de bord, objectifs, impact estimé.
- **Coach & astuces** — Contenu pédagogique intégré.
- **Paramètres** — Langue, thème, préférences.
- **Multilingue** — i18next (fichiers dans `frontend/locales/`).
- **APK** — Build release avec Expo prebuild.

**IA :** 6 classes. **YOLOv8** optionnel pour multi-objets et vraies coordonnées de boîtes sur `POST /detect`.

---

## Stack technique

| Couche | Technologies |
|--------|----------------|
| **Mobile** | React Native, **Expo ~54**, React Navigation, caméra Expo |
| **Backend** | Python, **FastAPI**, Uvicorn, **SQLite** |
| **IA** | TensorFlow/Keras (MobileNetV2) ; **Ultralytics YOLOv8** (optionnel) |
| **Prétraitement** | OpenCV ; Expo Camera côté app |

Tout peut tourner en local. Voir [CONSTRAINTS.md](CONSTRAINTS.md) et [docs/FREE_APIS.md](docs/FREE_APIS.md).

---

## Démarrage rapide

### Prérequis

- **Node.js** (npm)
- **Python 3.10, 3.11 ou 3.12** (TensorFlow ne prend pas en charge Python 3.14 pour l’instant)
- **Expo Go** sur le téléphone (même Wi‑Fi que le PC) pour les tests rapides

### 1. Cloner

```bash
git clone https://github.com/VOTRE_USER/WasteVision-AI.git
cd WasteVision-AI
```

### 2. Backend

```bash
cd backend
python -m venv venv
# Windows :
.\venv\Scripts\activate
# macOS / Linux :
# source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8001
```

- API : **http://localhost:8001**
- Documentation interactive : **http://localhost:8001/docs**

### 3. Frontend (Expo)

Dans un **nouveau terminal** :

```bash
cd frontend
npm install
npx expo start
```

- **Web :** touche **w** dans le terminal.
- **Mobile :** QR code avec Expo Go (téléphone sur le même réseau).

**Si l’app n’atteint pas l’API depuis un appareil réel :** renseignez l’IP de votre machine dans `frontend/app.json` :

```json
"expo": {
  "extra": {
    "apiBaseUrl": "http://192.168.1.20:8001"
  }
}
```

Remplacez `192.168.1.20` par votre IP locale, puis redémarrez Expo.

**Script npm (Windows) :** depuis `frontend`, `npm run backend` lance Uvicorn sur le port 8001 (voir `package.json`).

---

## Base de données SQLite

Le fichier SQLite est choisi dans `backend/config.py` pour **éviter de perdre l’historique** après un renommage :

1. Si `backend/data/wastevision.db` existe → il est utilisé (déploiements historiques).
2. Sinon, si seul `backend/data/waste.db` existe → celui-ci est utilisé.
3. Sinon, création par défaut sous **`wastevision.db`**.

Les uploads et les poids du modèle restent dans `backend/data/uploads/` et `backend/data/weights/`.

---

## Endpoints API (aperçu)

| Méthode | Endpoint | Rôle |
|---------|----------|------|
| **POST** | `/predict` | Image → une classification (waste_type, confiance, conseils). |
| **POST** | `/detect` | Image → liste de détections (label, confiance, `bounding_box`, conseils). YOLO si `yolov8_waste.pt` présent. |
| **POST** | `/classify` | Variante classification (compatibilité clients). |
| **GET** | `/history` | Historique des scans. |
| **PATCH** | `/history/{id}/correct` | Corriger une entrée. |
| **GET** | `/history/export/verified` | Export des corrections vérifiées. |
| **GET** | `/stats` | Statistiques agrégées. |
| **POST** | `/correction` | Envoi d’une correction (flux dédié). |
| **POST** | `/feedback` | Retours utilisateurs (bug, suggestion, note). |
| **POST** | `/retrain` | Relance d’entraînement (selon configuration). |

Schémas détaillés : **http://localhost:8001/docs**.

---

## Option : YOLOv8 (multi-objets)

Pour plusieurs objets et **vraies boîtes** sur **POST /detect** :

1. Installer Ultralytics et entraîner (dataset YOLO, 6 classes alignées sur le backend) :

   ```bash
   pip install ultralytics
   # Définir ai-model/data/waste.yaml (voir ai-model/data/waste.yaml.example si présent)
   python ai-model/train_yolov8.py
   ```

2. Copier les poids :

   ```text
   ai-model/runs/detect/.../weights/best.pt  →  backend/data/weights/yolov8_waste.pt
   ```

3. Redémarrer le backend (message de chargement YOLO au démarrage si OK).

Sans ce fichier, **POST /detect** utilise le classifieur (une détection plein cadre).

---

## Entraîner le classifieur (CNN)

Utilisé par **POST /predict** et en secours pour **POST /detect** :

```bash
# Dataset : 6 dossiers sous ai-model/dataset/
#   plastic, paper_cardboard, glass, metal, organic, non_recyclable
pip install tensorflow pillow numpy opencv-python-headless
python ai-model/train_model.py
```

Le modèle est copié vers `backend/data/weights/model.keras` (selon le script du projet).

---

## Build Android (APK)

```bash
cd frontend
npx expo prebuild
npx expo run:android --variant release
```

Exemple de sortie : `android/app/build/outputs/apk/release/app-release.apk`.

Guide plus complet : [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

---

## Structure du dépôt

```text
WasteVision-AI/
├── backend/           # FastAPI, SQLite, routes /predict, /detect, /history, etc.
│   ├── app/           # API, services, repositories, modèles
│   ├── ml/            # Classifieur, détecteur YOLO, prétraitement
│   ├── data/          # SQLite, uploads, weights (non versionné par défaut)
│   └── main.py
├── frontend/          # Application Expo (écrans, navigation, i18n, API client)
│   ├── screens/       # Écrans principaux
│   ├── src/           # Réexports / utilitaires (navigation, thème, i18n)
│   ├── locales/       # fr.json, en.json, ar.json
│   └── api/client.js
├── ai-model/          # Scripts d’entraînement (CNN, YOLOv8)
├── docs/              # Déploiement, intégration, APIs gratuites, etc.
└── README.md
```

Pour une vue plus détaillée des dossiers : [STRUCTURE.md](STRUCTURE.md).

---

## Documentation

- **[RUN.md](RUN.md)** — Enchaînement : backend, Expo, tests.
- **[SETUP.md](SETUP.md)** — Installation, modèle, backend, APK.
- **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** — Mise en production.
- **[CONSTRAINTS.md](CONSTRAINTS.md)** — Contraintes open source / sans services payants.
- **[BUILD_NATIF.md](BUILD_NATIF.md)** — Build natif (APK / IPA).

---

## Licence

MIT — voir [LICENSE](LICENSE).

---

**WasteVision AI** — Triez mieux, recyclez mieux. 🌱♻️
