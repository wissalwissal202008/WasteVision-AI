# Corriger le crash "String cannot be cast to Double" sur téléphone

Sur Android, React Native exige que les **valeurs numériques** dans les styles soient des **nombres**, pas des chaînes.

## À vérifier dans tes fichiers

Dans **chaque fichier** qui utilise `StyleSheet.create()` (screens et constants/theme.js) :

- **À faire** : `fontSize: 16`, `padding: 16`, `marginBottom: 8`, `borderWidth: 1`, etc. (sans guillemets).
- **À éviter** : `fontSize: "16"`, `padding: "16"` (avec guillemets = chaîne = crash sur mobile).

## Fichiers à ouvrir et corriger

1. **constants/theme.js**  
   Toutes les valeurs dans `spacing` et `fontSize` doivent être des nombres :
   - `xs: 4` pas `xs: "4"`
   - `fontSize: { small: 14, body: 16, ... }` pas `"14"`, `"16"`.

2. **screens/HomeScreen.js**  
   Dans les `styles`, vérifier : `marginBottom`, `padding`, `fontSize`, etc. → nombres sans guillemets.

3. **screens/CameraScreen.js**  
   Idem : tous les nombres dans les styles doivent être sans guillemets.

4. **screens/ResultScreen.js**  
   Idem.

5. **screens/HistoryScreen.js**  
   Idem.

6. **src/utils/navigation/AppNavigator.js**  
   Si tu as des options de style avec des nombres (ex. `headerTitleStyle`), ils doivent être des nombres.

## Exemple correct

```javascript
const styles = StyleSheet.create({
  container: {
    padding: 16,        // OK : nombre
    marginBottom: 24,    // OK : nombre
  },
  title: {
    fontSize: 24,       // OK : nombre
  },
});
```

## Exemple à corriger

```javascript
// FAUX (crash sur téléphone)
fontSize: "20",
padding: "16",
```

Remplace par :

```javascript
// CORRECT
fontSize: 20,
padding: 16,
```

Après modification, sauvegarde, puis dans le terminal : relance `npx expo start --tunnel` et rescanne le QR code sur ton téléphone.
