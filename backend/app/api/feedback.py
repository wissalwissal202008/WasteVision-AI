from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from app.repositories import feedback as feedback_repo

router = APIRouter(prefix="/feedback", tags=["feedback"])

VALID_TYPES = {"bug", "suggestion", "rating"}


class FeedbackBody(BaseModel):
    type: str = Field(..., description="bug | suggestion | rating")
    content: str | None = Field(None, description="Message for bug report or suggestion")
    rating: int | None = Field(None, ge=1, le=5, description="1-5 stars, for type=rating")


@router.post("")
async def submit_feedback(body: FeedbackBody):
    if body.type not in VALID_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"type must be one of: {sorted(VALID_TYPES)}",
        )
    if body.type in ("bug", "suggestion") and not (body.content and body.content.strip()):
        raise HTTPException(
            status_code=400,
            detail="content is required for bug and suggestion",
        )
    if body.type == "rating" and body.rating is None:
        raise HTTPException(
            status_code=400,
            detail="rating (1-5) is required for type=rating",
        )
    fid = feedback_repo.create(
        type_=body.type,
        content=body.content.strip() if body.content else None,
        rating=body.rating,
    )
    return JSONResponse(
        content={"ok": True, "id": fid, "message": "Merci pour votre retour !"},
    )
