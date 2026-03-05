# Paquets vérifiés – WasteVision AI (Expo SDK 54)

## Ce qui a été fait

1. **Alignement sur Expo SDK 54**  
   Toutes les dépendances ont été mises aux versions attendues par Expo 54 pour éviter les erreurs `Cannot read property 'S' of undefined` et `Cannot read property 'default' of undefined` sur Android / Expo Go.

2. **Versions installées (compatibles Expo 54)**

   | Package | Version |
   |--------|---------|
   | expo | ~54.0.33 |
   | react | 19.1.0 |
   | react-dom | 19.1.0 |
   | react-native | 0.81.5 |
   | @expo/metro-runtime | ~6.1.2 |
   | @expo/vector-icons | ^15.0.3 |
   | expo-camera | ~17.0.10 |
   | expo-image-picker | ~17.0.10 |
   | expo-status-bar | ~3.0.9 |
   | react-native-screens | ~4.16.0 |
   | react-native-safe-area-context | ~5.6.0 |
   | react-native-gesture-handler | ~2.28.0 |
   | react-native-web | ~0.21.0 |
   | @react-navigation/native | ^6.1.9 |
   | @react-navigation/bottom-tabs | ^6.5.11 |

3. **Supprimé**  
   - `@react-navigation/stack` et `@react-navigation/native-stack` (plus utilisés ; navigation par onglets uniquement).

4. **Vérification**  
   - `npm install` terminé sans erreur.  
   - `npx expo install --check` indique : « Dependencies are up to date ».

## Commandes utiles

- Vérifier les paquets : `npx expo install --check`
- Lancer l’app : `npx expo start --clear`
- Réinstaller proprement : supprimer `node_modules` et `package-lock.json`, puis `npm install`

## En cas de nouveau warning Expo

Si Expo affiche encore des avertissements de versions, exécuter :

```bash
npx expo install --fix
```

Si des conflits de dépendances apparaissent, utiliser :

```bash
npm install --legacy-peer-deps
```
