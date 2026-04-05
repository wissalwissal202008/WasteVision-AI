"""POST /classify – same as /predict, returns Flutter-friendly JSON (object_name, material, category, recycling_tips)."""
from fastapi import APIRouter, File, HTTPException, Query, UploadFile
from app.repositories import history as history_repo
from app.repositories import user_stats as user_stats_repo
from app.services.predictor import predict_from_bytes
import config

router = APIRouter(prefix="/classify", tags=["classify"])


@router.post("")
async def classify(
    file: UploadFile = File(...),
    lang: str = Query("fr", description="Langue du conseil recyclage : fr (défaut), en ou ar."),
):
    """Receive image, return AI result (same as /predict, Flutter-friendly keys)."""
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Empty file.")
    content_type = (file.content_type or "").lower()
    if content_type and "image" not in content_type and "octet" not in content_type:
        raise HTTPException(status_code=400, detail="File must be an image.")
    try:
        response_dict, image_name = predict_from_bytes(contents, lang=lang)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    upload_path = config.UPLOADS_DIR / image_name
    with open(upload_path, "wb") as f:
        f.write(contents)
    scan_id = history_repo.create(
        image_name=image_name,
        object_name=response_dict.get("object_name"),
        product_type=response_dict.get("product_type"),
        predicted_category=response_dict["waste_category"],
        recommended_bin=response_dict["recommended_bin"],
    )
    response_dict["scan_id"] = scan_id
    try:
        user_stats_repo.record_validated_detection(response_dict["waste_category"])
    except Exception:
        pass
    # Flutter-friendly shape: waste_type, confidence, recycling_advice + legacy keys
    return {
        "object_name": response_dict.get("object_name", response_dict["waste_category"]),
        "waste_type": response_dict.get("waste_type", response_dict["waste_category"]),
        "waste_category": response_dict["waste_category"],
        "material": response_dict["waste_category"],
        "category": response_dict["waste_category"],
        "recommended_bin": response_dict["recommended_bin"],
        "recycling_advice": response_dict.get("recycling_advice", response_dict.get("recommended_bin", "")),
        "recycling_tips": response_dict.get("recycling_advice", response_dict.get("recycling_instructions", response_dict.get("recommended_bin", ""))),
        "recycling_instructions": response_dict.get("recycling_instructions", ""),
        "environmental_impact": response_dict.get("environmental_impact", ""),
        "eco_tip": response_dict.get("eco_tip", ""),
        "confidence": response_dict.get("confidence", 0),
        "scan_id": scan_id,
    }
