from pydantic import BaseModel, Field


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
