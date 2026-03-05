# Publier WasteVision AI en open source sur GitHub

## Fichiers déjà en place

- **README.md** – description, installation, lancement
- **LICENSE** – MIT
- **.gitignore** – node_modules, venv, données, fichiers sensibles
- **backend/requirements.txt** – dépendances Python

---

## Étapes pour mettre le projet sur GitHub

### 1. Créer un compte GitHub (si besoin)

Va sur [github.com](https://github.com) et crée un compte.

---

### 2. Créer un nouveau dépôt sur GitHub

1. Clique sur **"New"** (ou **"+"** → **"New repository"**).
2. **Repository name** : `wastevision-ai` (ou un autre nom).
3. **Description** (optionnel) : *App mobile de tri des déchets par IA (React Native + FastAPI)*.
4. Choisis **Public**.
5. **Ne coche pas** "Add a README" (tu en as déjà un).
6. Clique sur **"Create repository"**.

---

### 3. Initialiser Git et pousser le code (depuis ton PC)

Ouvre un terminal dans le dossier du projet **WasteVision-AI** (pas dans backend ou frontend) :

```bash
cd c:\Users\wissal\Desktop\projet\WasteVision-AI

# Initialiser Git (si pas déjà fait)
git init

# Ajouter tous les fichiers (le .gitignore exclut node_modules, venv, etc.)
git add .

# Premier commit
git commit -m "Initial commit: WasteVision AI - app mobile tri déchets par IA"

# Remplacer TON_USERNAME par ton nom d'utilisateur GitHub
git remote add origin https://github.com/TON_USERNAME/wastevision-ai.git

# Branche principale (souvent main)
git branch -M main

# Envoyer le code sur GitHub
git push -u origin main
```

Si GitHub te demande de te connecter, utilise ton identifiant et un **Personal Access Token** (mot de passe) au lieu de ton mot de passe compte. Tu peux en créer un dans : GitHub → Settings → Developer settings → Personal access tokens.

---

### 4. Après la première mise en ligne

- Le **README.md** s’affichera sur la page du dépôt.
- Tu peux ajouter des **topics** (tags) sur la page du repo : `react-native`, `expo`, `fastapi`, `tensorflow`, `recycling`, `waste`, etc.
- Pour les prochains changements :
  ```bash
  git add .
  git commit -m "Description du changement"
  git push
  ```

---

## Récapitulatif

| Étape | Action |
|-------|--------|
| 1 | Créer un repo **Public** sur GitHub (sans README) |
| 2 | `git init` → `git add .` → `git commit -m "..."` |
| 3 | `git remote add origin https://github.com/TON_USERNAME/wastevision-ai.git` |
| 4 | `git branch -M main` → `git push -u origin main` |

Une fois que c’est en ligne, n’importe qui pourra cloner le dépôt et lancer l’app avec les instructions du **README.md**.
