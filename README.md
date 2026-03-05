# WasteVision AI

Application mobile (Android / iOS) et web de **tri des déchets par intelligence artificielle** : scan d’un objet, explication (matière, usage, différence avec les similaires), bac de tri recommandé, impact environnemental et conseil éco. Les utilisateurs peuvent corriger les prédictions pour améliorer le modèle (human-in-the-loop).

---

## Fonctionnalités

- **Scan** : prise de photo ou choix depuis la galerie
- **Explication** : qu’est-ce que c’est, de quoi c’est fait, à quoi ça sert, en quoi c’est différent d’objets similaires
- **Tri** : bac recommandé, impact environnemental, conseil éco
- **Correction** : signaler une erreur et choisir la bonne catégorie (données utilisées pour réentraîner le modèle)
- **Historique** des scans et **tableau de bord** d’impact
- **Coach éco** : conseils et bonnes pratiques

---

## Stack technique

| Partie    | Techno |
|----------|--------|
| Backend  | Python, FastAPI, Uvicorn, TensorFlow/Keras (MobileNetV2), SQLite |
| Frontend | React Native, Expo, React Navigation |
| IA       | Classification 6 catégories (plastique, papier/carton, verre, métal, organique, non recyclable) |

---

## Prérequis

- **Node.js** (npm)
- **Python 3** (pip)
- Pour le mobile : **Expo Go** sur téléphone (même Wi‑Fi que le PC)

---

## Installation et lancement

### 1. Cloner le dépôt

```bash
git clone https://github.com/TON_USERNAME/wastevision-ai.git
cd wastevision-ai
```

*(Remplace `TON_USERNAME` par ton nom d’utilisateur GitHub.)*

### 2. Backend (API)

```bash
cd backend
python -m venv venv
# Windows :
.\venv\Scripts\activate
# macOS/Linux :
# source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8001
```

L’API tourne sur **http://localhost:8001**.

### 3. Frontend (app)

Dans un **autre terminal** :

```bash
cd frontend
npm install
npx expo start
```

- **Web** : appuyer sur `w` pour ouvrir dans le navigateur.
- **Mobile** : scanner le QR code avec Expo Go (téléphone sur le même Wi‑Fi). L’app détecte automatiquement l’IP du PC pour appeler l’API.

---

## Structure du projet

```
WasteVision-AI/
├── backend/          # API FastAPI, modèle IA, BDD
│   ├── app/          # routes, services, repositories
│   ├── ml/           # modèle, prétraitement, (optionnel) product_detector
│   ├── main.py
│   ├── config.py
│   └── retrain.py    # réentraînement à partir des corrections
├── frontend/         # React Native (Expo)
│   ├── screens/
│   ├── navigation/
│   ├── api/
│   └── App.js
├── DEVELOPMENT_PLAN.md
├── LICENSE
└── README.md
```

---

## Réentraînement (human-in-the-loop)

Après des corrections utilisateur, tu peux mettre à jour le modèle :

```bash
cd backend
python retrain.py
```

Puis redémarrer le backend pour charger le nouveau modèle.

---

## Contribution

Les contributions sont les bienvenues (issues, pull requests). Merci de respecter l’esprit du projet : pédagogique, éco-responsable, et centré sur l’amélioration continue du tri.

---

## Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE).
