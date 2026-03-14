"""
Train WasteVision CNN with transfer learning (MobileNetV2).
Uses OpenCV for consistent image preprocessing when available.

Expects dataset/ with 6 class subfolders:
  plastic, paper_cardboard, glass, metal, organic, non_recyclable

Output: model.h5 (Keras) in ai_model/. Copy to backend/data/weights/model.keras for the API.
Use convert_tflite.py for mobile TFLite.
"""
from pathlib import Path
import numpy as np
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.models import Model
from tensorflow.keras.preprocessing.image import ImageDataGenerator

DATA_DIR = Path(__file__).resolve().parent / "dataset"
MODEL_PATH = Path(__file__).resolve().parent / "model.h5"
BACKEND_WEIGHTS = Path(__file__).resolve().parent.parent / "backend" / "data" / "weights" / "model.keras"

# WasteVision-AI 6 classes (must match config.CATEGORY_NAMES)
CLASS_NAMES = ["plastic", "paper_cardboard", "glass", "metal", "organic", "non_recyclable"]
TARGET_SIZE = (224, 224)

if not DATA_DIR.is_dir():
    raise FileNotFoundError(
        f"Create dataset/ with subfolders per class: {DATA_DIR}\n"
        "e.g. dataset/plastic/, dataset/paper_cardboard/, dataset/glass/, dataset/metal/, dataset/organic/, dataset/non_recyclable/\n"
        "Run download_dataset.py to fetch a public waste dataset."
    )

# Ensure we only use our 6 classes (flow_from_directory discovers subdirs)
train_datagen = ImageDataGenerator(
    rescale=1.0 / 255,
    validation_split=0.2,
    rotation_range=15,
    width_shift_range=0.1,
    height_shift_range=0.1,
    horizontal_flip=True,
)
train_generator = train_datagen.flow_from_directory(
    str(DATA_DIR),
    target_size=TARGET_SIZE,
    batch_size=32,
    subset="training",
    class_mode="categorical",
    classes=CLASS_NAMES,
    shuffle=True,
)
val_generator = train_datagen.flow_from_directory(
    str(DATA_DIR),
    target_size=TARGET_SIZE,
    batch_size=32,
    subset="validation",
    class_mode="categorical",
    classes=CLASS_NAMES,
)

num_classes = len(train_generator.class_indices)
if num_classes != 6:
    raise ValueError(f"Expected 6 classes, found {num_classes}. Ensure dataset has: {CLASS_NAMES}")

# Model: MobileNetV2 + top (CNN for image classification)
base_model = MobileNetV2(
    weights="imagenet", include_top=False, input_shape=(*TARGET_SIZE, 3)
)
x = GlobalAveragePooling2D()(base_model.output)
output = Dense(num_classes, activation="softmax")(x)
model = Model(inputs=base_model.input, outputs=output)

for layer in base_model.layers:
    layer.trainable = False

model.compile(
    optimizer="adam",
    loss="categorical_crossentropy",
    metrics=["accuracy"],
)

model.fit(
    train_generator,
    validation_data=val_generator,
    epochs=10,
)

model.save(str(MODEL_PATH))
print(f"Saved model to {MODEL_PATH}")

# Save as .keras for backend API if backend path exists
if BACKEND_WEIGHTS.parent.is_dir():
    BACKEND_WEIGHTS.parent.mkdir(parents=True, exist_ok=True)
    model.save(str(BACKEND_WEIGHTS))
    print(f"Copied to backend: {BACKEND_WEIGHTS}")

print("Done. For TFLite: python convert_tflite.py")
