# WasteVision AI – App mobile

WasteVision AI est une **application mobile** (Android et iOS), développée avec **React Native** et **Expo**. Elle peut aussi s’ouvrir dans un navigateur (web).

---

## Utilisation en mode mobile

### Option 1 : Expo Go (développement / test)
- Installe **Expo Go** sur ton téléphone (Play Store / App Store).
- Lance le projet : `npx expo start`
- Scanne le QR code avec ton téléphone → l’app s’ouvre dans Expo Go.

### Option 2 : App installable (APK Android)
Pour obtenir un fichier **.apk** à installer sur Android sans Expo Go :

1. **Avec EAS Build (Expo, compte gratuit)**  
   - Installe EAS CLI : `npm install -g eas-cli`  
   - Connexion : `eas login`  
   - Premier build : `eas build:configure` puis `eas build --platform android --profile preview`  
   - Tu récupères un lien pour télécharger l’APK.

2. **En local (Android Studio + SDK Android)**  
   - Installe Android Studio et le SDK Android.  
   - Dans le dossier frontend : `npx expo run:android`  
   - Un APK est généré (ou l’app est lancée sur un émulateur / appareil connecté).

---

## Identité mobile déjà configurée

Dans **app.json** :
- **Android** : `package`: `com.wastevision.ai`
- **iOS** : `bundleIdentifier`: `com.wastevision.ai`

L’app est donc déjà définie comme application mobile pour les deux plateformes.
