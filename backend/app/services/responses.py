import config

# Each tuple: (display_name, bin, impact, tip, what_is_it, material, everyday_use, diff_from_similar)
CATEGORY_INFO = {
    0: (
        "Plastic",
        "Yellow bin (recycling)",
        "Recycling plastic saves oil and reduces landfill.",
        "Rinse containers and remove caps when possible.",
        "This is a plastic item, often packaging or a container.",
        "It is made of plastic (e.g. PET, PE, PVC).",
        "Commonly used for bottles, trays, pots, and wrappers.",
        "Unlike paper or metal, plastic does not decompose; recycling gives it a second life.",
    ),
    1: (
        "Paper / Cardboard",
        "Blue bin (paper)",
        "Recycled paper uses less water and energy.",
        "Flatten boxes to save space.",
        "This is paper or cardboard — packaging, newspaper, or packaging material.",
        "It is made of cellulose fibres from wood.",
        "Used for boxes, newspapers, magazines, and packaging.",
        "Unlike plastic, paper can be recycled many times; keep it dry and clean.",
    ),
    2: (
        "Glass",
        "Green/white glass bin",
        "Glass is 100% recyclable and can be reused indefinitely.",
        "Separate by color if your area requires it.",
        "This is a glass object — bottle, jar, or container.",
        "It is made of glass (sand, soda, lime).",
        "Used for food and drink containers, and some cosmetics.",
        "Glass is infinitely recyclable; unlike plastic, it does not degrade in the process.",
    ),
    3: (
        "Metal",
        "Yellow or dedicated metal bin",
        "Recycling metal saves huge amounts of energy.",
        "Clean cans and tins before recycling.",
        "This is a metal item — can, tin, or foil.",
        "It is made of aluminium or steel.",
        "Used for drinks, food cans, and aluminium foil.",
        "Metal is highly recyclable; a can can become a new can in a few weeks.",
    ),
    4: (
        "Organic",
        "Brown/green bin (organic)",
        "Composting reduces methane from landfills.",
        "Keep organic waste in a small bin and empty regularly.",
        "This is organic or food waste.",
        "It is made of natural, biodegradable matter (food, plants).",
        "Leftovers, peels, coffee grounds, and garden waste.",
        "Unlike other bins, organic waste is composted or turned into energy, not recycled as material.",
    ),
    5: (
        "Non-recyclable",
        "General waste bin",
        "Some items cannot be recycled locally.",
        "Prefer products with less packaging.",
        "This item is not recyclable in the usual bins.",
        "It may be mixed materials, dirty, or not accepted by your local scheme.",
        "Often packaging that is too small or contaminated.",
        "When in doubt, general waste avoids contaminating recycling; reduce and reuse when possible.",
    ),
}


def build_prediction_response(
    class_index: int, confidence: float, product_type: str | None = None, scan_id: int | None = None
) -> dict:
    if class_index not in CATEGORY_INFO:
        class_index = 5
    row = CATEGORY_INFO[class_index]
    name = row[0]
    bin_name = row[1]
    impact = row[2]
    tip = row[3]
    what_is_it = row[4]
    material = row[5]
    everyday_use = row[6]
    diff_from_similar = row[7]
    category_key = config.CATEGORY_NAMES[class_index]
    out = {
        "object_name": name,
        "waste_category": category_key,
        "recommended_bin": bin_name,
        "environmental_impact": impact,
        "eco_tip": tip,
        "confidence": round(float(confidence), 4),
        "explanation_what": what_is_it,
        "explanation_material": material,
        "explanation_use": everyday_use,
        "explanation_difference": diff_from_similar,
    }
    if product_type:
        out["product_type"] = product_type
    if scan_id is not None:
        out["scan_id"] = scan_id
    return out
