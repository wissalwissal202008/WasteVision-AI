from fastapi import APIRouter, File, HTTPException, Query, UploadFile
from app.models import PredictionResponse
from app.repositories import history as history_repo
from app.repositories import user_stats as user_stats_repo
from app.services.predictor import predict_from_bytes

router = APIRouter(prefix="/predict", tags=["predict"])


@router.post("", response_model=PredictionResponse)
async def predict(
    file: UploadFile = File(...),
    lang: str = Query(
        "fr",
        description="Langue du conseil recyclage : fr (défaut), en ou ar — ex. POST /predict?lang=en",
    ),
):
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Empty file.")
    # Accept any upload; preprocess will reject non-image bytes (OpenCV/PIL)
    content_type = (file.content_type or "").lower()
    if content_type and "image" not in content_type and "octet" not in content_type:
        raise HTTPException(status_code=400, detail="File must be an image (e.g. image/jpeg, image/png).")
    try:
        response_dict, image_name = predict_from_bytes(contents, lang=lang)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    import config
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
    return PredictionResponse(**response_dict)
