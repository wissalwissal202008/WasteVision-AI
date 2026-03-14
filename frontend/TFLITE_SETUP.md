# Détection on-device avec TensorFlow Lite (WasteVision AI)

WasteVision AI peut utiliser **TensorFlow Lite** pour détecter les déchets **hors ligne** sur l’appareil, avec un modèle de type **MobileNet SSD** (recommandé).

## Architecture

```
Caméra → TensorFlow Lite (MobileNet SSD) → Détection d’objets → Plastique / Verre / Métal / …
```

- **Scan rapide**, **fonctionne sans réseau**, **app fluide**.

## Modèles recommandés

### 1. MobileNet SSD (recommandé)

- Très rapide sur téléphone, modèle léger (~15–20 MB), facile à intégrer avec TFLite.
- **Objets détectés** : bouteille, canette, plastique, carton, verre (classes COCO).
- TensorFlow Hub : [ssd_mobilenet_v1](https://tfhub.dev/tensorflow/lite-model/ssd_mobilenet_v1/1) (télécharger le `.tflite`).

### 2. EfficientDet Lite

- Meilleure précision, un peu plus lourd.
- [efficientdet/lite0](https://tfhub.dev/tensorflow/lite-model/efficientdet/lite0/detection/metadata/1).

### 3. YOLO Nano

- Très rapide, modèle petit ; moins stable sur mobile que TFLite.

## Configuration dans le projet

### 1. Installer react-native-fast-tflite

```bash
cd frontend
yarn add react-native-fast-tflite
# ou
npm install react-native-fast-tflite
```

### 2. Build natif (Expo dev client)

TFLite nécessite du code natif. Avec **Expo** :

```bash
npx expo prebuild
npx expo run:android
# ou
npx expo run:ios
```

Ou utilise un **development build** (Expo dev client). Le mode **Expo Go** seul ne peut pas charger le module natif.

### 3. Metro : accepter les assets .tflite

Dans `metro.config.js` (à la racine du projet frontend) :

```js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
config.resolver.assetExts = [...(config.resolver.assetExts || []), "tflite"];
module.exports = config;
```

### 4. (Optionnel) Plugin Expo pour GPU

Dans `app.json` :

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-fast-tflite",
        {
          "enableCoreMLDelegate": true,
          "enableAndroidGpuLibraries": true
        }
      ]
    ]
  }
}
```

### 5. Intégrer le modèle dans l’app

**Option A – Modèle dans le bundle**

1. Télécharge le fichier `.tflite` (MobileNet SSD ou autre).
2. Place-le dans `frontend/assets/`, par ex. `ssd_mobilenet_v1.tflite`.
3. Dans `services/offlineDetection.js`, utilise :

```js
const model = await loadTFLiteModel(require("../assets/ssd_mobilenet_v1.tflite"));
```

**Option B – Chargement par URL**

Le service peut charger le modèle depuis une URL publique (voir `loadTFLiteModel` dans `services/offlineDetection.js`).

### 6. Activer l’IA hors ligne dans l’app

1. Faire un **build natif** (étape 2).
2. Dans l’app : **Paramètres** → **Général** → activer **« IA hors ligne (TensorFlow Lite) »**.
3. Les prochains scans utiliseront la détection on-device quand le module TFLite est disponible.

## Mapping COCO → déchets

Le modèle COCO SSD détecte des classes (bouteille, verre, cup, etc.). Le fichier `frontend/services/offlineDetection.js` mappe ces classes vers les catégories WasteVision :

- **plastic** : bottle, cup, toothbrush, …
- **glass** : wine glass, bowl, vase
- **metal** : fork, knife, spoon, scissors
- **paper_cardboard** : book
- **organic** : banana, apple, pizza, …
- **non_recyclable** : défaut pour le reste

Tu peux modifier ce mapping dans `COCO_TO_WASTE` dans `offlineDetection.js`.

## Entraîner un modèle dédié déchets (optionnel)

Pour un modèle spécifique « déchets » au lieu de COCO :

- **Dataset** : [TrashNet](https://github.com/garythung/trashnet) (plastique, verre, carton, métal, papier).
- Entraîne un modèle TFLite (classification ou détection) puis exporte en `.tflite` et remplace l’appel à `loadTFLiteModel` par ce modèle ; adapte le mapping des sorties vers `plastic`, `glass`, etc.

## Fichiers concernés

- `frontend/services/offlineDetection.js` : mapping COCO → déchets, chargement et inférence TFLite.
- `frontend/services/detection.js` : choix backend vs TFLite, préférence « Offline AI ».
- **Paramètres** : option « IA hors ligne (TensorFlow Lite) » (AsyncStorage `@wastevision_offline_ai`).

Sans installation de `react-native-fast-tflite`, l’app continue d’utiliser uniquement le **backend** pour la prédiction.
