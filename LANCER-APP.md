# Lancer WasteVision AI

## Une fois que tout est installé

### Option A : Deux terminaux (recommandé)

**Terminal 1 – Backend**
```powershell
cd c:\Users\wissal\Desktop\projet\WasteVision-AI\backend
.\venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8001
```

**Terminal 2 – Frontend**
```powershell
cd c:\Users\wissal\Desktop\projet\WasteVision-AI\frontend
npx expo start
```
Puis appuyer sur **w** pour ouvrir dans le navigateur.

---

### Option B : Scripts (double-clic ou un seul terminal)

Tu peux créer des fichiers `.bat` sur le Bureau pour lancer le backend et le frontend en double-cliquant (ouvre deux fenêtres CMD).

---

## Rappel : à faire une seule fois

- **npm install** : seulement après un nouveau clone ou si tu ajoutes des dépendances.
- **Set-ExecutionPolicy** : une seule fois par compte Windows pour que PowerShell accepte npm.
- **Port 8001** : le frontend est déjà configuré pour parler à l’API sur 8001.
