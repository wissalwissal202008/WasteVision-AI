"""POST /classify – same as /predict, returns Flutter-friendly JSON (object_name, material, category, recycling_tips)."""
from fastapi import APIRouter, File, HTTPException, UploadFile
from app.repositories import history as history_repo
from app.services.predictor import predict_from_bytes
import config

router = APIRouter(prefix="/classify", tags=["classify"])


@router.post("")
async def classify(file: UploadFile = File(...)):
    """Receive image, return AI result for Flutter client."""
    content_type = file.content_type or ""
    if "image" not in content_type:
        raise HTTPException(status_code=400, detail="File must be an image.")
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Empty file.")
    try:
        response_dict, image_name = predict_from_bytes(contents)
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
    # Flutter-friendly shape: object_name, material (= category), category, recycling_tips
    return {
        "object_name": response_dict.get("object_name", response_dict["waste_category"]),
        "material": response_dict["waste_category"],
        "category": response_dict["waste_category"],
        "recommended_bin": response_dict["recommended_bin"],
        "recycling_tips": f"{response_dict.get('eco_tip', '')} Bin: {response_dict['recommended_bin']}.",
        "environmental_impact": response_dict.get("environmental_impact", ""),
        "eco_tip": response_dict.get("eco_tip", ""),
        "confidence": response_dict.get("confidence", 0),
        "scan_id": scan_id,
    }
