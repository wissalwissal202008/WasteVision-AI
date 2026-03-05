import numpy as np
from PIL import Image
import config

INPUT_SIZE = config.MODEL_INPUT_SIZE


def preprocess_image(image: Image.Image) -> np.ndarray:
    image = image.convert("RGB")
    image = image.resize(INPUT_SIZE, Image.Resampling.BILINEAR)
    arr = np.array(image, dtype=np.float32) / 255.0
    return np.expand_dims(arr, axis=0)
