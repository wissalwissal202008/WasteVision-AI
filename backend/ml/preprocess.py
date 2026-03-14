"""
Image preprocessing for WasteVision-AI CNN.
Uses OpenCV for decode/resize/normalize when possible; PIL fallback for API compatibility.
"""
import numpy as np
import config

INPUT_SIZE = config.MODEL_INPUT_SIZE  # (224, 224)


def _preprocess_array(rgb: np.ndarray) -> np.ndarray:
    """Resize and normalize a single RGB image (H, W, 3) to model input batch (1, H, W, 3)."""
    try:
        import cv2
        resized = cv2.resize(rgb, (INPUT_SIZE[1], INPUT_SIZE[0]), interpolation=cv2.INTER_LINEAR)
    except ImportError:
        from PIL import Image
        pil = Image.fromarray(rgb.astype(np.uint8))
        pil = pil.resize((INPUT_SIZE[1], INPUT_SIZE[0]), Image.Resampling.BILINEAR)
        resized = np.array(pil, dtype=np.float32)
    arr = np.asarray(resized, dtype=np.float32) / 255.0
    return np.expand_dims(arr, axis=0)


def preprocess_from_bytes(image_bytes: bytes) -> np.ndarray:
    """Decode image from bytes using OpenCV and preprocess for the CNN."""
    try:
        import cv2
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("OpenCV could not decode image")
        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        return _preprocess_array(rgb)
    except ImportError:
        from PIL import Image
        import io
        image = Image.open(io.BytesIO(image_bytes))
        return preprocess_image(image)
    except Exception as e:
        from PIL import Image
        import io
        try:
            image = Image.open(io.BytesIO(image_bytes))
            return preprocess_image(image)
        except Exception:
            raise ValueError(f"Image not valid or not clear: {e!s}") from e


def preprocess_image(image) -> np.ndarray:
    """
    Preprocess for the CNN. Accepts PIL Image or bytes.
    Uses OpenCV for resize/normalize when available.
    """
    if isinstance(image, bytes):
        return preprocess_from_bytes(image)
    # PIL Image
    from PIL import Image
    image = image.convert("RGB")
    arr = np.array(image, dtype=np.float32) / 255.0
    return _preprocess_array(arr)
