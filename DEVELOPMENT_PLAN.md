# WasteVision AI – Plan de développement (Master Prompt)

## 1. Objectif du projet

Application **mobile-first**, pilotée par l’IA, qui permet aux utilisateurs de :
- identifier des déchets via la caméra,
- comprendre ce qu’est l’objet, de quoi il est fait, comment il se distingue d’objets similaires,
- trier correctement pour le recyclage,
- acquérir des habitudes éco-responsables.

L’application doit être **pédagogique**, **fiable**, **agréable à utiliser** et **évolutive**.

---

## 2. Parcours utilisateur (Core User Flow)

1. **Scan** : l’utilisateur photographie un objet.
2. **Explication** : l’IA affiche, **dans cet ordre** :
   - Ce que c’est (objet),
   - Le(s) matériau(x),
   - L’usage courant,
   - La différence avec des objets similaires.
3. **Tri** : l’IA indique le bac de tri, l’impact environnemental et un conseil éco.
4. **Correction** : l’utilisateur peut confirmer ou corriger la détection (human-in-the-loop).

---

## 3. Explication de l’objet (obligatoire avant le tri)

Avant toute consigne de tri, l’IA doit **toujours** expliquer :

| Question | Exemple |
|----------|--------|
| **Qu’est-ce que c’est ?** | « C’est un emballage plastique. » |
| **De quoi c’est fait ?** | « Plastique (PET ou PE). » |
| **À quoi ça sert ?** | « Souvent utilisé pour les bouteilles ou barquettes. » |
| **En quoi c’est différent d’objets similaires ?** | « À ne pas confondre avec le polystyrène (bac déchets). » |

Les textes sont **courts**, **simples** et **non techniques**.

---

## 4. Gestion des erreurs et correction utilisateur

- **Confiance faible** : message du type « Nous ne sommes pas très sûrs — vous pouvez corriger ci-dessous. »
- **L’utilisateur signale une erreur** :
  - Reconnaissance polie de l’incertitude,
  - Proposition de choisir (ou saisir) la bonne catégorie,
  - Confirmation claire de la correction,
  - Remerciement pour contribuer à l’amélioration du système.
- Données de correction stockées et marquées comme **données vérifiées** pour l’apprentissage.

---

## 5. Apprentissage continu (Human-in-the-loop)

- Enregistrer les **corrections** (image + prédiction initiale + catégorie corrigée).
- Marquer ces enregistrements comme **verified training data**.
- Utiliser ces données pour **réentraîner ou fine-tuner** le modèle périodiquement.
- Réduire la répétition des mêmes erreurs.

---

## 6. Comportement et personnalité de l’IA

- **Professionnelle et humble** : pas de sur-promesse.
- **Pédagogique** : explications claires et utiles.
- **Positive et encourageante** : pas de culpabilisation.
- **Collaborative** : l’utilisateur aide à améliorer le système.

---

## 7. Fonctionnalités attendues

| Fonctionnalité | Statut |
|----------------|--------|
| Détection d’objets (caméra) | ✅ |
| Explication + comparaison | ✅ (texte par catégorie) |
| Guide de tri (bac) | ✅ |
| Impact environnemental | ✅ |
| Conseil éco | ✅ |
| Système de correction utilisateur | ✅ |
| Historique des scans | ✅ |
| Tableau de bord impact éco | ✅ (basique) |
| Coach éco (assistant) | ✅ (conseils statiques / à enrichir) |

---

## 8. Architecture technique

### 8.1 Frontend (React Native / Expo)

- **Navigation** : bottom tabs (Accueil, Scan, Stats, Coach, Historique) + stack (Camera → Result).
- **Écrans** : Home, Camera, Result, History, Dashboard, Assistant.
- **API** : `api/client.js` — `predict()`, `getHistory()`, `getUploadUrl()`, `submitCorrection()`.
- **Thème** : `constants/theme.js` (couleurs éco, espacements, typo).

### 8.2 Backend (Python FastAPI)

- **Routes** : `POST /predict`, `GET /history`, `PATCH /history/{id}/correct`, `GET /uploads/{name}`.
- **Services** : `predictor` (classification), `responses` (textes par catégorie).
- **Base de données** : SQLite — `scan_history` (id, image_name, predicted_category, corrected_category, is_verified, …).
- **ML** : MobileNetV2 + tête 6 classes (plastic, paper_cardboard, glass, metal, organic, non_recyclable).

### 8.3 Stratégie d’intégration IA

- **Classification** : modèle pré-entraîné (ImageNet) + couche de classification déchets.
- **Explication** : textes par catégorie (pas de LLM requis pour la V1).
- **Évolution** : réutilisation des corrections pour fine-tuning ou réentraînement (export CSV/JSON + script d’entraînement).

---

## 9. Gestion des erreurs et flux de correction

1. **Erreur réseau / backend indisponible** : message clair + invitation à vérifier la connexion et le backend (port 8001).
2. **Image invalide ou illisible** : message du type « Photo floue ou objet non reconnu. Réessayez avec une photo plus nette. »
3. **Confiance < seuil (ex. 60 %)** : bandeau « Nous ne sommes pas très sûrs » + bouton « Corriger ».
4. **Correction** : choix de la catégorie → envoi `PATCH /history/{id}/correct` → message « Merci, votre correction nous aide à nous améliorer. »

---

## 10. Réentraînement à partir des corrections (déjà en place)

Quand l’utilisateur **corrige** une prédiction dans l’app, l’image et la **bonne** catégorie sont enregistrées en base. Pour que le modèle s’améliore sur les **images similaires** (ou quasi identiques) la prochaine fois :

1. **Enregistrement** : chaque correction est stockée avec `is_verified = 1` et `corrected_category`.
2. **Réentraînement** : depuis le dossier `backend`, lancer :
   ```bash
   python retrain.py
   ```
   Le script charge toutes les corrections, charge les images depuis `data/uploads/`, et réentraîne le modèle (fine-tuning). Le modèle mis à jour est sauvegardé dans `data/weights/model.keras`.
3. **Chargement** : au démarrage, l’API charge automatiquement ce fichier s’il existe. Les **prochaines** prédictions (y compris pour des images très proches de celles que tu as corrigées) utilisent donc le modèle amélioré.

**Important** : après avoir lancé `retrain.py`, il faut **redémarrer le backend** (uvicorn) pour que le nouveau modèle soit utilisé. Plus tu corriges de scans, plus le modèle s’améliore pour des produits similaires.

---

## 11. Améliorations futures

- **Modèle** : charger des poids pré-entraînés sur un jeu déchets (en plus des corrections).
- **Détection de type de produit** : réactiver ou remplacer `product_detector` (modèle plus léger ou asynchrone) pour affiner « qu’est-ce que c’est ».
- **Tableau de bord** : évolution par catégorie, objectifs hebdomadaires, comparaison avec la moyenne.
- **Coach éco** : conseils personnalisés selon l’historique (ex. « Vous triez beaucoup de plastique — voici comment réduire. »).
- **Multilangue** : textes d’explication et d’interface en plusieurs langues.
- **Accessibilité** : contraste, tailles de police, lecteur d’écran.

---

## 12. Livrables

- **Ce document** : plan par étapes, architecture, stratégie IA, gestion d’erreurs, évolutions.
- **Code** : backend (FastAPI, prédiction, explications, correction, BDD) et frontend (écrans, flux de correction, appel API).
- **Comportement** : explication systématique avant le tri, flux de correction clair, ton professionnel et encourageant.

Le produit vise une **application réelle**, **explicable** et **évolutive**, avec une IA responsable et centrée utilisateur.
