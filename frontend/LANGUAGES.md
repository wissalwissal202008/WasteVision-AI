# WasteVision AI – Langues et localisation

## Comment l’app gère les langues aujourd’hui

- **Aucune librairie i18n** : pas de `react-i18next`, `expo-localization`, etc. dans le projet.
- **Texte en dur** : tous les libellés de l’interface sont écrits directement en **français** dans les écrans (HomeScreen, ResultScreen, Settings, etc.).
- **Dates** : l’historique utilise `toLocaleDateString("fr-FR", ...)` pour afficher les dates en français.
- **Paramètres** : la ligne « Langue » / « Français » dans Paramètres est **affichage uniquement** ; changer la langue n’est pas encore implémenté.

En résumé : l’app est **monolingue français** pour l’instant.

---

## Ajouter plusieurs langues (i18n)

Pour gérer plusieurs langues (français, anglais, arabe, etc.) :

### 1. Installer les dépendances

```bash
cd frontend
npx expo install expo-localization
npm install i18next react-i18next
```

- **expo-localization** : détecte la langue du téléphone (`getLocales()`).
- **i18next** + **react-i18next** : fichiers de traduction et hook `useTranslation()`.

### 2. Structure des traductions

Créer un dossier `locales/` avec un fichier par langue :

```
frontend/
  locales/
    fr.json   # Français
    en.json   # Anglais
    ar.json   # Arabe (optionnel)
```

Exemple **fr.json** :

```json
{
  "home": {
    "title": "Scanner un déchet",
    "subtitle": "Prenez une photo de votre déchet...",
    "cta": "Prendre une photo"
  },
  "settings": {
    "language": "Langue",
    "languageValue": "Français"
  }
}
```

### 3. Initialiser i18next

Dans `App.js` (ou un fichier dédié `i18n.js`) :

- Importer `i18n` et `initReactI18next`.
- Charger les fichiers `fr`, `en`, etc.
- Utiliser `expo-localization` pour définir la langue par défaut selon l’appareil.

### 4. Utiliser les traductions dans les écrans

Remplacer le texte en dur par des clés :

```javascript
import { useTranslation } from 'react-i18next';

export default function HomeScreen() {
  const { t } = useTranslation();
  return (
    <Text>{t('home.title')}</Text>
  );
}
```

### 5. Changer la langue depuis Paramètres

- Stocker la langue choisie dans **AsyncStorage** (ex. `@wastevision_lang`).
- Au démarrage, charger cette préférence et appeler `i18n.changeLanguage(lang)`.
- Dans Paramètres, afficher une liste (Français, English, …) et au clic : sauvegarder + `i18n.changeLanguage(code)`.

---

## Dates et nombres

- **Dates** : garder `toLocaleDateString(locale, options)` en utilisant la locale courante (ex. `i18n.language` → `"fr"` ou `"en"`).
- **Nombres** : si besoin, utiliser `Intl.NumberFormat(locale)` pour les décimales et pourcentages.

---

## Résumé

| Élément              | Actuellement              | Pour multi-langues                    |
|----------------------|---------------------------|----------------------------------------|
| Libellés UI          | Français en dur           | Fichiers `locales/fr.json`, `en.json` |
| Langue par défaut    | —                         | Détection appareil (expo-localization)|
| Changement de langue | Non (affichage « Français ») | Paramètres → choix → AsyncStorage + i18n |
| Dates                | `fr-FR` en dur            | `toLocaleDateString(i18n.language, ...)` |

Si tu veux, on peut ajouter ensemble la structure `locales/` + `i18n.js` et brancher une première langue (ex. français + anglais) dans l’app.
