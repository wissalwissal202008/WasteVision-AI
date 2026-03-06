"""
Train WasteVision CNN with transfer learning (MobileNetV2).
Expects dataset/ with subfolders per class (e.g. dataset/plastic/, dataset/glass/).
Output: model.h5 (Keras). Use convert_tflite.py for mobile.
"""
from pathlib import Path
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.models import Model
from tensorflow.keras.preprocessing.image import ImageDataGenerator

DATA_DIR = Path(__file__).resolve().parent / "dataset"
MODEL_PATH = Path(__file__).resolve().parent / "model.h5"

if not DATA_DIR.is_dir():
    raise FileNotFoundError(
        f"Create dataset/ with subfolders per class: {DATA_DIR}\n"
        "e.g. dataset/plastic/, dataset/paper_cardboard/, dataset/glass/, ..."
    )

# Dataset preprocessing
train_datagen = ImageDataGenerator(rescale=1.0 / 255, validation_split=0.2)
train_generator = train_datagen.flow_from_directory(
    str(DATA_DIR),
    target_size=(224, 224),
    batch_size=32,
    subset="training",
    class_mode="categorical",
)
val_generator = train_datagen.flow_from_directory(
    str(DATA_DIR),
    target_size=(224, 224),
    batch_size=32,
    subset="validation",
    class_mode="categorical",
)

# Model: MobileNetV2 + top
base_model = MobileNetV2(
    weights="imagenet", include_top=False, input_shape=(224, 224, 3)
)
x = GlobalAveragePooling2D()(base_model.output)
output = Dense(train_generator.num_classes, activation="softmax")(x)
model = Model(inputs=base_model.input, outputs=output)

# Freeze base
for layer in base_model.layers:
    layer.trainable = False

model.compile(
    optimizer="adam",
    loss="categorical_crossentropy",
    metrics=["accuracy"],
)

# Train
model.fit(
    train_generator,
    validation_data=val_generator,
    epochs=10,
)

model.save(str(MODEL_PATH))
print(f"Saved model to {MODEL_PATH}")
