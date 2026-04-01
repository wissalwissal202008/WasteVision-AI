"""
Persist successful multi-object detections (POST /detect) into SQLite (waste.db).
One row per bounding box.
"""
from app.database import get_connection


def save_detection(
    image_name: str,
    label: str,
    category: str | None,
    confidence: float,
    bounding_box: list[float],
    recycling_advice: str | None = None,
) -> int:
    """
    Insert a single detection row. bounding_box: [x1, y1, x2, y2] normalized 0–1.
    Returns inserted row id.
    """
    if len(bounding_box) != 4:
        bounding_box = [0.0, 0.0, 1.0, 1.0]
    x1, y1, x2, y2 = (float(bounding_box[i]) for i in range(4))
    conn = get_connection()
    try:
        cur = conn.execute(
            """
            INSERT INTO detection_log (
                image_name, label, category, confidence,
                bbox_x1, bbox_y1, bbox_x2, bbox_y2, recycling_advice
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                image_name,
                label,
                category or "",
                confidence,
                x1,
                y1,
                x2,
                y2,
                recycling_advice or "",
            ),
        )
        conn.commit()
        return int(cur.lastrowid)
    finally:
        conn.close()


def save_detections_batch(
    image_name: str,
    detections: list[dict],
) -> list[int]:
    """Save each dict with keys: label, category, confidence, bounding_box, recycling_advice."""
    ids: list[int] = []
    for d in detections:
        bbox = d.get("bounding_box") or [0.0, 0.0, 1.0, 1.0]
        if len(bbox) != 4:
            bbox = [float(bbox[i]) if i < len(bbox) else (1.0 if i >= 2 else 0.0) for i in range(4)]
        ids.append(
            save_detection(
                image_name=image_name,
                label=str(d.get("label", "waste")),
                category=d.get("category"),
                confidence=float(d.get("confidence", 0)),
                bounding_box=bbox,
                recycling_advice=d.get("recycling_advice"),
            )
        )
    return ids
