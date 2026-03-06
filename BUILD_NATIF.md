# WasteVision AI – Build natif : Expo Go vs vraie app

**Objectif : lancer une vraie app IA sur le téléphone.**  
Expo Go ne suffit pas pour la production. Il faut un **build natif** (APK / AAB / IPA) installable comme une app classique.

---

## Ce que tu as dans le projet

| Client | Techno | Build |
|--------|--------|--------|
| **frontend/** | React Native + **Expo** | Expo Go en dev → **build standalone** pour la vraie app |
| **frontend_flutter/** | **Flutter** | Toujours build natif (`flutter build apk` / `ios`) |

---

## 1. App React Native (Expo) – passer à la vraie app

Expo Go = **développement uniquement** (tu testes en ouvrant ton projet dans l’app Expo Go).  
Pour une **vraie app** sur le téléphone (sans Expo Go), deux méthodes **natives** possibles, **sans quitter Expo** :

### Méthode A : EAS Build (recommandé, cloud)

- Pas besoin d’installer Android Studio / Xcode sur ton PC.
- Tu génères un **APK** (Android) ou une **IPA** (iOS) dans le cloud Expo.

```bash
cd frontend
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview   # → lien de téléchargement APK
# ou
eas build --platform ios --profile preview      # → pour TestFlight / App Store
```

Résultat : un **fichier installable** (APK ou IPA). Tu l’installes sur le téléphone comme n’importe quelle app. Plus besoin d’Expo Go.

### Méthode B : Build local (Android Studio / Xcode)

- Sur ta machine : Android Studio (Android) et/ou Xcode (iOS).
- Tu compiles un **binaire natif** qui embarque ton JS + le runtime React Native.

```bash
cd frontend
npx expo run:android   # génère un APK et lance sur appareil/émulateur
npx expo run:ios      # nécessite Xcode (Mac), lance sur simulateur/appareil
```

C’est déjà du **build natif** : l’app qui tourne n’est pas Expo Go, c’est ton app standalone.

---

## 2. App Flutter – déjà natif

Flutter ne passe pas par Expo Go. Dès que tu fais un build, tu obtiens un binaire natif :

```bash
cd frontend_flutter
flutter build apk        # APK Android
flutter build appbundle  # AAB (Play Store)
flutter build ios        # Xcode project / IPA (Mac uniquement)
```

Tu installes l’APK ou l’IPA sur le téléphone → **vraie app** native.

---

## 3. Récap : Expo Go vs build natif

| | Expo Go | Build natif (EAS ou `expo run`) |
|--|--------|----------------------------------|
| **Usage** | Dev / test rapide | **Vraie app** à distribuer ou installer |
| **Installation** | Ouvrir le projet dans l’app « Expo Go » | Installer ton APK / IPA comme une app normale |
| **IA / caméra** | Fonctionne (appel au backend) | Idem, plus toute option native si tu en ajoutes |
| **Pour concours / démo / production** | Non | **Oui** |

Donc : **pour une vraie app IA sur le téléphone, tu utilises la méthode native** (EAS Build ou `expo run:android`/`expo run:ios` pour Expo, ou `flutter build apk` pour Flutter). Tu ne restes pas bloqué sur Expo Go.

---

## 4. React Native sans Expo (CLI pur)

Si tu veux **quitter complètement Expo** et utiliser uniquement React Native CLI :

```bash
cd frontend
npx expo prebuild        # génère les dossiers android/ et ios/
# puis
npx react-native run-android
npx react-native run-ios
```

Après `prebuild`, le projet a des dossiers natifs Android/iOS. Tu peux alors gérer tout en natif (modules C++, etc.). Pour la plupart des cas, **EAS Build ou `expo run:android` suffisent** sans quitter Expo.

---

## En résumé

- **Expo Go** = outil de dev, pas la cible pour « une vraie app sur le téléphone ».
- **Vraie app** = build natif :
  - **Expo** : `eas build` ou `npx expo run:android` / `expo run:ios`.
  - **Flutter** : `flutter build apk` / `flutter build ios`.

L’objectif « lancer une vraie app IA sur le téléphone » passe donc bien par la **méthode native** (build standalone), pas par Expo Go seul.
