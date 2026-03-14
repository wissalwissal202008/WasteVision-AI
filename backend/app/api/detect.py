"""
POST /detect – real-time waste detection.
Input: image file.
Output: { detections: [ { label, confidence, bounding_box: [x1,y1,x2,y2], recycling_advice } ] }.
"""
import logging
from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel, Field

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
async def detect(file: UploadFile = File(...)):
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
        detections = detect_from_bytes(contents)
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
    return DetectResponse(detections=out)
