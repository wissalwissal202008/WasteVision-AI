"""
POST /detect – real-time waste detection.
Input: image file.
Output: { detections: [ { label, confidence, bounding_box: [x1,y1,x2,y2], recycling_advice } ] }.
"""
import logging
import uuid

from fastapi import APIRouter, File, HTTPException, Query, UploadFile
from pydantic import BaseModel, Field

import config
from app.repositories import detection_log as detection_log_repo
from app.repositories import user_stats as user_stats_repo
from ml.detector import detect_from_bytes

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/detect", tags=["detect"])


class DetectionItem(BaseModel):
    label: str = Field(..., description="Object label (e.g. Plastic, paper)")
    category: str | None = Field(None, description="Category key: plastic, paper_cardboard, glass, metal, organic, non_recyclable")
    confidence: float = Field(..., ge=0, le=1, description="Confidence 0-1")
    bounding_box: list[float] = Field(..., description="[x1, y1, x2, y2] normalized 0-1")
    recycling_advice: str | None = Field(None, description="Recycling instructions for this item")


class DetectResponse(BaseModel):
    detections: list[DetectionItem] = Field(..., description="List of detected waste objects")


@router.post("", response_model=DetectResponse)
async def detect(
    file: UploadFile = File(...),
    lang: str = Query("fr", description="Langue des conseils recyclage : fr (défaut), en ou ar."),
):
    """Accept image, return list of detections with label, confidence, bounding_box, recycling_advice."""
    if not file.filename and not file.file:
        logger.warning("Detect: empty or missing file")
        raise HTTPException(status_code=400, detail="No file provided.")

    contents = await file.read()
    if len(contents) == 0:
        logger.warning("Detect: empty file")
        raise HTTPException(status_code=400, detail="Empty file.")

    content_type = (file.content_type or "").lower()
    if content_type and "image" not in content_type and "octet" not in content_type:
        raise HTTPException(status_code=400, detail="File must be an image (e.g. image/jpeg, image/png).")

    try:
        detections = detect_from_bytes(contents, lang=lang)
    except ValueError as e:
        logger.info("Detect validation error: %s", e)
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.exception("Detect inference failed: %s", e)
        raise HTTPException(status_code=500, detail="Detection failed. Please try another image.")

    # Ensure each item has bounding_box of length 4
    out = []
    for d in detections:
        bbox = d.get("bounding_box") or [0.0, 0.0, 1.0, 1.0]
        if len(bbox) != 4:
            bbox = [float(bbox[i]) if i < len(bbox) else (1.0 if i >= 2 else 0.0) for i in range(4)]
        out.append(
            DetectionItem(
                label=d.get("label", "waste"),
                category=d.get("category"),
                confidence=float(d.get("confidence", 0)),
                bounding_box=bbox,
                recycling_advice=d.get("recycling_advice"),
            )
        )

    logger.info("Detect: %d detection(s)", len(out))

    # Impact tracker: one increment per returned detection (validated inference)
    if len(out) > 0:
        for item in out:
            try:
                user_stats_repo.record_validated_detection(item.category)
            except Exception:
                pass

    # Persist each successful detection to SQLite (waste.db) + save frame once
    if len(out) > 0:
        image_name = f"detect_{uuid.uuid4().hex[:12]}.jpg"
        upload_path = config.UPLOADS_DIR / image_name
        try:
            with open(upload_path, "wb") as f:
                f.write(contents)
        except OSError as e:
            logger.warning("Detect: could not save upload %s: %s", image_name, e)
        else:
            try:
                payload = [
                    {
                        "label": item.label,
                        "category": item.category,
                        "confidence": item.confidence,
                        "bounding_box": list(item.bounding_box),
                        "recycling_advice": item.recycling_advice,
                    }
                    for item in out
                ]
                detection_log_repo.save_detections_batch(image_name, payload)
            except Exception as e:
                logger.warning("Detect: failed to log detections to DB: %s", e)

    return DetectResponse(detections=out)
