from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from app.repositories import history as history_repo
import config

router = APIRouter(prefix="/history", tags=["history"])

VALID_CATEGORIES = set(config.CATEGORY_NAMES)


class CorrectRequestBody(BaseModel):
    corrected_category: str = Field(..., description="User-selected category key (e.g. plastic, paper_cardboard)")


@router.get("")
async def get_history(limit: int = 50):
    if limit < 1 or limit > 100:
        limit = 50
    rows = history_repo.get_all(limit=limit)
    for r in rows:
        if "created_at" in r and r["created_at"]:
            r["created_at"] = r["created_at"].isoformat() if hasattr(r["created_at"], "isoformat") else str(r["created_at"])
    return JSONResponse(content=rows)


@router.patch("/{scan_id}/correct")
async def correct_scan(scan_id: int, body: CorrectRequestBody):
    """Store user correction for a scan. Marks the record as verified for future training."""
    if body.corrected_category not in VALID_CATEGORIES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid category. Must be one of: {sorted(VALID_CATEGORIES)}",
        )
    updated = history_repo.update_correction(scan_id, body.corrected_category)
    if not updated:
        raise HTTPException(status_code=404, detail="Scan not found.")
    return JSONResponse(content={"ok": True, "message": "Correction enregistrée. Merci !"})


@router.get("/export/verified")
async def export_verified(limit: int = 500):
    """Export verified (user-corrected) scans for retraining. Returns list of { id, image_name, corrected_category, predicted_category }."""
    if limit < 1 or limit > 2000:
        limit = 500
    rows = history_repo.get_verified_for_training(limit=limit)
    for r in rows:
        if "created_at" in r and r.get("created_at") and hasattr(r["created_at"], "isoformat"):
            r["created_at"] = r["created_at"].isoformat()
    return JSONResponse(content=rows)
