"""
CNN model for waste classification (6 classes).
Open-source: TensorFlow/Keras, MobileNetV2 transfer learning.
"""
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.models import Model

# 6 waste categories: Plastic, Paper, Glass, Metal, Organic, Other
NUM_CLASSES = 6
INPUT_SHAPE = (224, 224, 3)


def build_model(num_classes=NUM_CLASSES, input_shape=INPUT_SHAPE):
    """
    Build CNN for waste classification.
    Returns a compiled Keras Model (MobileNetV2 + classification head).
    """
    base = MobileNetV2(
        weights="imagenet",
        include_top=False,
        input_shape=input_shape,
    )
    for layer in base.layers:
        layer.trainable = False

    x = GlobalAveragePooling2D()(base.output)
    x = Dense(num_classes, activation="softmax")(x)
    model = Model(inputs=base.input, outputs=x)
    model.compile(
        optimizer="adam",
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model
