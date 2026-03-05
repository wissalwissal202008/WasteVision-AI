# Faire fonctionner l’app sur le téléphone et dans le navigateur

## 1. Dans le navigateur (PC)

- **À utiliser :** `http://localhost:8000` (pour l’API) et `http://localhost:8082` (pour l’app Expo en web).
- **À ne pas utiliser :** `http://0.0.0.0:8000` → le navigateur affiche souvent « site inaccessible » (ERR_ADDRESS_INVALID).  
  `0.0.0.0` est pour le serveur (écouter sur toutes les interfaces), pas pour ouvrir la page dans le navigateur.

## 2. Sur le téléphone (Expo Go)

### Backend (API)

- Le téléphone ne peut pas utiliser `localhost` (c’est ta machine).
- Dans **`frontend/api/client.js`**, remplace :
  ```js
  const API_BASE = "http://localhost:8000";
  ```
  par l’**IP de ton PC** sur le même Wi‑Fi, par exemple :
  ```js
  const API_BASE = "http://192.168.1.10:8000";
  ```
- Pour connaître l’IP du PC :  
  CMD → `ipconfig` → repère « Adresse IPv4 » de la carte Wi‑Fi.

### Relancer l’app après les corrections

Si tu as encore l’erreur « String cannot be cast to Double » sur le téléphone :

1. **Recharger le bundle**  
   - Dans le terminal où Expo tourne, appuie sur **`r`** (reload),  
   - ou sur le téléphone : secoue l’appareil → menu Expo → **Reload**.

2. **Réessayer après un reload**  
   Les derniers correctifs (styles, navigation) ne sont pris en compte qu’après un rechargement.

3. **Vérifier que le backend tourne**  
   Sur le PC, dans un autre terminal :
   ```cmd
   cd c:\Users\wissal\Desktop\projet\WasteVision-AI\backend
   .\venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000
   ```
   Ensuite, sur le PC, ouvre **http://localhost:8000/docs** pour vérifier que l’API répond.

## 3. Résumé

| Où          | URL à utiliser                          |
|------------|------------------------------------------|
| API sur PC | `http://localhost:8000` et `/docs`       |
| App web PC | `http://localhost:8082` (après `npx expo start` puis `w`) |
| App sur téléphone | Dans `api/client.js` : `http://IP_DU_PC:8000` |
