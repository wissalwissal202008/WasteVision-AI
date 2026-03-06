"""POST /correction – receive user corrections for retraining (Flutter flow)."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.repositories import correction_repository
import config

router = APIRouter(prefix="/correction", tags=["correction"])
VALID_CATEGORIES = set(config.CATEGORY_NAMES)


class CorrectionBody(BaseModel):
    object_name: str = Field(..., description="Name/label of the object as detected")
    correct_label: str = Field(..., description="Correct category: plastic, paper_cardboard, glass, metal, organic, non_recyclable")
    user_id: str = Field(..., description="User or device identifier")


@router.post("")
def correction(correction_body: CorrectionBody):
    if correction_body.correct_label not in VALID_CATEGORIES:
        raise HTTPException(
            status_code=400,
            detail=f"correct_label must be one of: {sorted(VALID_CATEGORIES)}",
        )
    correction_repository.save_correction(
        object_name=correction_body.object_name,
        correct_label=correction_body.correct_label,
        user_id=correction_body.user_id,
    )
    return {"status": "success"}
