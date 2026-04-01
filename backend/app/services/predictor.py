import uuid
from app.services import responses
from ml.model_loader import predict_proba
from ml.preprocess import preprocess_from_bytes
import config


def predict_from_bytes(image_bytes: bytes, lang: str | None = None):
    try:
        batch = preprocess_from_bytes(image_bytes)
    except Exception as e:
        raise ValueError(f"Image not valid or not clear: {e!s}") from e
    proba = predict_proba(batch)
    proba = proba[0]
    class_index = int(proba.argmax())
    confidence = float(proba[class_index])
    if confidence < 0.2:
        raise ValueError("Image not clear or unsupported object. Try a clearer photo.")
    product_type = None
    response = responses.build_prediction_response(class_index, confidence, product_type, lang=lang)
    image_name = f"scan_{uuid.uuid4().hex[:12]}.jpg"
    return response, image_name
