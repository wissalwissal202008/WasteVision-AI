import numpy as np
import config

_model = None
_use_tf = None


def _tf_available():
    global _use_tf
    if _use_tf is not None:
        return _use_tf
    try:
        import tensorflow as tf
        _use_tf = True
    except Exception:
        _use_tf = False
    return _use_tf


def _build_fresh_model():
    """Build model from scratch (no saved weights). Used when no retrained weights exist."""
    from tensorflow import keras
    from tensorflow.keras import layers
    base = keras.applications.MobileNetV2(
        input_shape=(*config.MODEL_INPUT_SIZE, 3),
        include_top=False,
        weights="imagenet",
        pooling="avg",
    )
    base.trainable = False
    inputs = keras.Input(shape=(*config.MODEL_INPUT_SIZE, 3))
    x = base(inputs)
    x = layers.Dense(64, activation="relu")(x)
    x = layers.Dropout(0.3)(x)
    outputs = layers.Dense(config.NUM_CLASSES, activation="softmax")(x)
    return keras.Model(inputs, outputs)


def get_model():
    """Return the classification model. Loads retrained weights if present, else builds fresh."""
    global _model
    if not _tf_available():
        return None
    if _model is not None:
        return _model
    if config.WEIGHTS_PATH.exists():
        try:
            from tensorflow import keras
            _model = keras.models.load_model(config.WEIGHTS_PATH)
            return _model
        except Exception:
            pass
    _model = _build_fresh_model()
    return _model


def predict_proba(image_batch: np.ndarray) -> np.ndarray:
    if _tf_available() and get_model() is not None:
        return get_model().predict(image_batch, verbose=0)
    rng = np.random.default_rng(int(image_batch.mean() * 1e6) % (2**32))
    proba = rng.random(config.NUM_CLASSES).astype(np.float32)
    proba = proba / proba.sum()
    return np.expand_dims(proba, axis=0)
