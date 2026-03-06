# WasteVision AI – App mobile

WasteVision AI est une **application mobile** (Android et iOS), développée avec **React Native** et **Expo**. Elle peut aussi s’ouvrir dans un navigateur (web).

**Pour une vraie app sur le téléphone (pas Expo Go)** : voir **[BUILD_NATIF.md](../BUILD_NATIF.md)** à la racine du projet (EAS Build, `expo run:android`, Flutter).

---

## Utilisation en mode mobile

### Option 1 : Expo Go (développement / test uniquement)
- Installe **Expo Go** sur ton téléphone (Play Store / App Store).
- Lance le projet : `npx expo start`
- Scanne le QR code avec ton téléphone → l’app s’ouvre dans Expo Go.  
- **Limite** : ce n’est pas une app standalone ; pour distribuer ou une démo « vraie app », utilise le build natif (voir ci‑dessous).

### Option 2 : Vraie app installable (build natif)
Pour une **app installable** sur le téléphone (APK Android, ou IPA iOS) **sans Expo Go** :

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
