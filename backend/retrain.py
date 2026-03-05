"""
Réentraînement du modèle à partir des corrections utilisateur (human-in-the-loop).

Quand tu corriges une prédiction dans l'app, l'image + la bonne catégorie sont enregistrées.
Ce script utilise ces données pour mettre à jour le modèle : les prochaines images
(similaires ou identiques) seront mieux classées.

Lancer depuis le dossier backend :
  python retrain.py

Prérequis : TensorFlow installé, et au moins quelques corrections (idéalement 10+).
"""
import sys
from pathlib import Path

# Run from backend directory
BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import numpy as np
from PIL import Image

import config
from app.repositories import history as history_repo
from ml.model_loader import get_model
from ml.preprocess import preprocess_image

MIN_SAMPLES = 5
EPOCHS = 15
BATCH_SIZE = 8


def main():
    records = history_repo.get_verified_for_training(limit=500)
    if not records:
        print("Aucune correction enregistrée. Corrige quelques prédictions dans l'app puis relance ce script.")
        return 1

    X_list = []
    y_list = []
    for r in records:
        image_name = r.get("image_name")
        corrected = r.get("corrected_category")
        if not image_name or not corrected or corrected not in config.CATEGORY_NAMES:
            continue
        path = config.UPLOADS_DIR / image_name
        if not path.exists():
            continue
        try:
            img = Image.open(path).convert("RGB")
            arr = preprocess_image(img)
            X_list.append(arr[0])
            y_list.append(config.CATEGORY_NAMES.index(corrected))
        except Exception as e:
            print(f"Ignore {image_name}: {e}")

    if len(X_list) < MIN_SAMPLES:
        print(
            f"Pas assez de données : {len(X_list)} images (minimum {MIN_SAMPLES}). "
            "Corrige encore quelques prédictions dans l'app."
        )
        return 1

    X = np.stack(X_list, axis=0).astype(np.float32)
    y = np.array(y_list, dtype=np.int32)

    print(f"Réentraînement sur {len(X)} corrections (réparties sur {len(config.CATEGORY_NAMES)} catégories).")

    model = get_model()
    if model is None:
        print("TensorFlow non disponible. Installe-le avec: pip install tensorflow")
        return 1

    model.compile(
        optimizer="adam",
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )

    val_split = 0.2 if len(X) >= 10 else 0.0
    model.fit(
        X, y,
        epochs=EPOCHS,
        batch_size=min(BATCH_SIZE, len(X)),
        validation_split=val_split,
        verbose=1,
    )

    config.WEIGHTS_PATH.parent.mkdir(parents=True, exist_ok=True)
    model.save(config.WEIGHTS_PATH)
    print(f"Modèle enregistré dans {config.WEIGHTS_PATH}")
    print("Les prochaines prédictions utiliseront ce modèle : les images similaires seront mieux classées.")
    print("Pense à redémarrer le backend (uvicorn) pour charger le nouveau modèle.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
