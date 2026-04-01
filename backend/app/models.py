from pydantic import BaseModel, Field


class Co2DayPoint(BaseModel):
    """CO2 (grams) saved on a given calendar day (UTC)."""

    day: str = Field(..., description="ISO date YYYY-MM-DD (UTC)")
    grams: float = Field(..., ge=0, description="CO2 equivalent saved that day (grams)")


class UserStats(BaseModel):
    """Impact tracker: CO2 saved (grams) and object counts per waste category."""

    total_co2_grams_saved: float = Field(..., description="Total CO2 equivalent saved (grams), all time")
    co2_saved_today_grams: float = Field(
        ...,
        description="CO2 saved today (grams); resets when UTC calendar day changes",
    )
    counts_by_category: dict[str, int] = Field(
        ...,
        description="Number of validated detections per category key (plastic, glass, …)",
    )
    co2_by_day: list[Co2DayPoint] = Field(
        default_factory=list,
        description="Last 7 days (UTC), oldest first: daily CO2 grams saved",
    )


class PredictionResponse(BaseModel):
    object_name: str = Field(..., description="Detected waste type label")
    waste_category: str = Field(..., description="Category: plastic, paper_cardboard, etc.")
    waste_type: str | None = Field(None, description="Alias for waste_category (e.g. plastic, paper_cardboard)")
    recommended_bin: str = Field(..., description="Which bin to use")
    recycling_advice: str | None = Field(None, description="Short recycling advice (e.g. Put in plastic recycling bin)")
    environmental_impact: str = Field(..., description="Short explanation of impact")
    eco_tip: str = Field(..., description="Eco-friendly recommendation")
    confidence: float = Field(..., ge=0, le=1, description="Model confidence 0–1")
    product_type: str | None = Field(None, description="Type de produit détecté: bouteille, canette, etc.")
    scan_id: int | None = Field(None, description="ID of the scan in history, for user correction")
    explanation_what: str | None = Field(None, description="What is this object?")
    explanation_material: str | None = Field(None, description="What is it made of?")
    explanation_use: str | None = Field(None, description="What is it used for?")
    explanation_difference: str | None = Field(None, description="How does it differ from similar items?")
    recycling_instructions: str | None = Field(None, description="Step-by-step recycling instructions (same as recycling_advice when short)")
