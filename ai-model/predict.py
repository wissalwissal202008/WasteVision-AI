"""
Load trained model and run inference on an image.
OpenCV used for image preprocessing. Returns waste class and confidence.
"""
from pathlib import Path
import numpy as np

# Default model path (waste_model.h5 in same directory)
MODEL_PATH = Path(__file__).resolve().parent / "waste_model.h5"
CLASS_NAMES = ["plastic", "paper_cardboard", "glass", "metal", "organic", "non_recyclable"]
INPUT_SIZE = (224, 224)


def preprocess_image(image_input):
    """
    image_input: path (str/Path) or bytes or numpy array (RGB).
    Returns batch of shape (1, 224, 224, 3) normalized to [0,1].
    """
    try:
        import cv2
    except ImportError:
        from PIL import Image
        if isinstance(image_input, (str, Path)):
            img = np.array(Image.open(image_input).convert("RGB"))
        elif isinstance(image_input, bytes):
            import io
            img = np.array(Image.open(io.BytesIO(image_input)).convert("RGB"))
        else:
            img = np.asarray(image_input)
        if img.ndim == 2:
            img = np.stack([img] * 3, axis=-1)
        pil = Image.fromarray(img.astype(np.uint8))
        resized = np.array(pil.resize((INPUT_SIZE[1], INPUT_SIZE[0])), dtype=np.float32) / 255.0
        return np.expand_dims(resized, axis=0)

    if isinstance(image_input, (str, Path)):
        img = cv2.imread(str(image_input))
    elif isinstance(image_input, bytes):
        img = cv2.imdecode(np.frombuffer(image_input, np.uint8), cv2.IMREAD_COLOR)
    else:
        img = np.asarray(image_input)
        if img.ndim == 2:
            img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
        elif img.shape[-1] == 3:
            img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
    if img is None:
        raise ValueError("Could not load image")
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    resized = cv2.resize(rgb, (INPUT_SIZE[1], INPUT_SIZE[0]))
    batch = np.expand_dims(resized.astype(np.float32) / 255.0, axis=0)
    return batch


def load_model(path=None):
    path = path or MODEL_PATH
    from tensorflow import keras
    return keras.models.load_model(str(path))


def predict(image_input, model=None):
    """
    Run classification. image_input: path, bytes, or RGB array.
    Returns dict: class_index (int), class_name (str), confidence (float).
    """
    if model is None:
        model = load_model()
    batch = preprocess_image(image_input)
    proba = model.predict(batch, verbose=0)[0]
    idx = int(np.argmax(proba))
    return {
        "class_index": idx,
        "class_name": CLASS_NAMES[idx],
        "confidence": float(proba[idx]),
    }


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python predict.py <image_path>")
        sys.exit(1)
    out = predict(sys.argv[1])
    print(f"Class: {out['class_name']} | Confidence: {out['confidence']:.2f}")
