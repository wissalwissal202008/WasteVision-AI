"""
Dataset loader for waste classification.
Supports TrashNet-style layout: dataset/<class_name>/ with images.
Uses a public open dataset (e.g. TrashNet); folder names mapped to 6 classes.
"""
from pathlib import Path

from tensorflow.keras.preprocessing.image import ImageDataGenerator

# 6 classes (must match backend config and model)
CLASS_NAMES = [
    "plastic",
    "paper_cardboard",
    "glass",
    "metal",
    "organic",
    "non_recyclable",
]
TARGET_SIZE = (224, 224)
BATCH_SIZE = 32
VALIDATION_SPLIT = 0.2


def get_data_dir(base_dir=None):
    """Return dataset directory (dataset/ next to this file)."""
    if base_dir is None:
        base_dir = Path(__file__).resolve().parent
    return base_dir / "dataset"


def get_generators(data_dir=None, batch_size=BATCH_SIZE, target_size=TARGET_SIZE):
    """
    Return (train_generator, val_generator) for flow_from_directory.
    Expects data_dir with subfolders: plastic/, paper_cardboard/, glass/, metal/, organic/, non_recyclable/.
    TrashNet and similar datasets can be mapped to these folder names.
    """
    if data_dir is None:
        data_dir = get_data_dir()
    data_dir = Path(data_dir)
    if not data_dir.is_dir():
        raise FileNotFoundError(
            f"Dataset directory not found: {data_dir}\n"
            f"Create subfolders: {', '.join(CLASS_NAMES)}\n"
            "See README for TrashNet or similar public dataset."
        )

    datagen = ImageDataGenerator(
        rescale=1.0 / 255,
        validation_split=VALIDATION_SPLIT,
        rotation_range=15,
        width_shift_range=0.1,
        height_shift_range=0.1,
        horizontal_flip=True,
    )

    train_gen = datagen.flow_from_directory(
        str(data_dir),
        target_size=target_size,
        batch_size=batch_size,
        subset="training",
        class_mode="categorical",
        classes=CLASS_NAMES,
        shuffle=True,
    )
    val_gen = datagen.flow_from_directory(
        str(data_dir),
        target_size=target_size,
        batch_size=batch_size,
        subset="validation",
        class_mode="categorical",
        classes=CLASS_NAMES,
    )
    return train_gen, val_gen
