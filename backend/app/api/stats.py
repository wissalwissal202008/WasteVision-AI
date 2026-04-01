from fastapi import APIRouter

from app.models import UserStats
from app.repositories import user_stats as user_stats_repo

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("", response_model=UserStats)
async def get_impact_stats():
    """Total CO2 saved (grams), today's CO2, and object counts per category."""
    data = user_stats_repo.get_stats()
    return UserStats(**data)
