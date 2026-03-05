"""
Détection du type de produit (bouteille, canette, téléphone, etc.) via MobileNetV2 ImageNet.
"""
import numpy as np

_product_model = None

# Traduction des noms ImageNet courants vers le français (produits souvent scannés)
PRODUCT_LABELS_FR = {
    "bottle": "bouteille",
    "water_bottle": "bouteille d'eau",
    "beer_bottle": "bouteille",
    "wine_bottle": "bouteille",
    "can": "canette",
    "beer_can": "canette",
    "soda_can": "canette",
    "cellular_telephone": "téléphone portable",
    "cellphone": "téléphone portable",
    "mobile_phone": "téléphone portable",
    "carton": "carton",
    "packaging": "emballage",
    "envelope": "enveloppe",
    "box": "boîte",
    "paper_towel": "papier",
    "toilet_tissue": "papier",
    "cup": "gobelet",
    "coffee_mug": "tasse",
    "plastic_bag": "sac plastique",
    "bag": "sac",
    "battery": "pile / batterie",
    "remote_control": "télécommande",
    "laptop": "ordinateur portable",
    "notebook": "ordinateur portable",
    "bottle_cap": "bouchon",
    "cap": "bouchon",
    "pill_bottle": "flacon",
    "medicine": "médicament",
    "food": "aliment",
    "fruit": "fruit",
    "vegetable": "légume",
    "banana": "banane",
    "apple": "pomme",
    "orange": "orange",
    "newspaper": "journal",
    "magazine": "magazine",
    "book": "livre",
    "cardboard": "carton",
    "container": "conteneur",
    "jar": "bocal",
    "tin": "boîte métallique",
    "aluminum": "aluminium",
    "wrapper": "emballage",
    "straw": "paille",
    "bottle_opener": "ouvre-bouteille",
    "dishrag": "chiffon",
    "soap": "savon",
    "detergent": "détergent",
    "spray": "spray",
    "aerosol": "aérosol",
}


def _get_product_model():
    global _product_model
    if _product_model is not None:
        return _product_model
    try:
        from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2
    except Exception:
        return None
    _product_model = MobileNetV2(
        input_shape=(224, 224, 3),
        include_top=True,
        weights="imagenet",
    )
    return _product_model


def detect_product(image_batch: np.ndarray) -> str:
    """
    Retourne le nom du produit détecté (ex: bouteille, canette, téléphone).
    image_batch: shape (1, 224, 224, 3), valeurs 0-255 ou 0-1.
    """
    model = _get_product_model()
    if model is None:
        return "objet"
    try:
        from tensorflow.keras.applications.mobilenet_v2 import (
            preprocess_input,
            decode_predictions,
        )
        x = image_batch.copy().astype(np.float32)
        if x.max() <= 1.0:
            x = x * 255.0
        x = preprocess_input(x)
        preds = model.predict(x, verbose=0)
        decoded = decode_predictions(preds, top=1)[0]
        if not decoded:
            return "objet"
        _, label_en, _ = decoded[0]
        label_en = label_en.replace(" ", "_").lower()
        return PRODUCT_LABELS_FR.get(label_en, label_en.replace("_", " "))
    except Exception:
        return "objet"
