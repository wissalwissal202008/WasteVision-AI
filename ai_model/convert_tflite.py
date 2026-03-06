"""
Convert trained Keras model (model.h5) to TensorFlow Lite for mobile deployment.
Output: model.tflite in ai_model/ (can be used in Flutter/Android/iOS).
"""
from pathlib import Path
import tensorflow as tf

MODEL_H5 = Path(__file__).resolve().parent / "model.h5"
MODEL_TFLITE = Path(__file__).resolve().parent / "model.tflite"

if not MODEL_H5.is_file():
    raise FileNotFoundError(
        f"Run train_model.py first to generate {MODEL_H5}"
    )

model = tf.keras.models.load_model(str(MODEL_H5))
converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()

with open(MODEL_TFLITE, "wb") as f:
    f.write(tflite_model)

print(f"Saved TFLite model to {MODEL_TFLITE}")
