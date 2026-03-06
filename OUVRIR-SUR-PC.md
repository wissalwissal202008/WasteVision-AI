# Ouvrir l’application sur le PC

Pour utiliser WasteVision AI **dans le navigateur** sur ton PC :

---

## 1. Lancer le backend (API)

Ouvre un **terminal** (PowerShell ou CMD) dans le dossier du projet.

```powershell
cd c:\Users\wissal\Desktop\projet\WasteVision-AI\backend
.\venv\Scripts\activate
python -m uvicorn main:app --host 0.0.0.0 --port 8001
```

Laisse cette fenêtre ouverte. L’API tourne sur **http://localhost:8001**.

> **Première fois ?** Si le dossier `venv` n’existe pas :  
> `python -m venv venv` puis `.\venv\Scripts\activate` puis `pip install -r requirements.txt`

---

## 2. Lancer le frontend (app)

Ouvre un **deuxième terminal**.

```powershell
cd c:\Users\wissal\Desktop\projet\WasteVision-AI\frontend
npm install
npx expo start
```

> **Première fois ?** `npm install` peut prendre 1–2 minutes.

---

## 3. Ouvrir l’app dans le navigateur

Quand Expo affiche le menu (QR code, options) :

- Appuie sur la touche **`w`** (web).

L’application s’ouvre dans ton **navigateur** (Chrome, Edge, etc.) sur ton PC.

Tu peux alors :
- aller sur l’onglet **Scan** et utiliser la caméra ou importer une image ;
- consulter l’historique, le tableau de bord, les paramètres, etc.

---

## Résumé

| Étape | Commande / action |
|-------|-------------------|
| 1 | Terminal 1 : `cd backend` → `.\venv\Scripts\activate` → `python -m uvicorn main:app --host 0.0.0.0 --port 8001` |
| 2 | Terminal 2 : `cd frontend` → `npx expo start` |
| 3 | Appuyer sur **`w`** pour ouvrir dans le navigateur sur le PC |

Si une page ne s’ouvre pas toute seule après `w`, regarde l’URL affichée dans le terminal (souvent **http://localhost:8081** ou **http://localhost:19006**) et ouvre-la dans le navigateur.
