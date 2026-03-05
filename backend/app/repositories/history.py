from app.database import get_connection


def create(
    image_name: str,
    predicted_category: str,
    recommended_bin: str,
    object_name: str | None = None,
    product_type: str | None = None,
) -> int:
    conn = get_connection()
    try:
        cur = conn.execute(
            """INSERT INTO scan_history (image_name, object_name, product_type, predicted_category, recommended_bin)
               VALUES (?, ?, ?, ?, ?)""",
            (image_name, object_name or "", product_type or "", predicted_category, recommended_bin),
        )
        conn.commit()
        return cur.lastrowid
    finally:
        conn.close()


def get_all(limit: int = 50):
    conn = get_connection()
    try:
        rows = conn.execute(
            """SELECT id, image_name, object_name, product_type, predicted_category, recommended_bin,
                      corrected_category, is_verified, created_at
               FROM scan_history ORDER BY created_at DESC LIMIT ?""",
            (limit,),
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def update_correction(scan_id: int, corrected_category: str) -> bool:
    """Store user correction and mark as verified for future training."""
    conn = get_connection()
    try:
        cur = conn.execute(
            """UPDATE scan_history SET corrected_category = ?, is_verified = 1 WHERE id = ?""",
            (corrected_category, scan_id),
        )
        conn.commit()
        return cur.rowcount > 0
    finally:
        conn.close()


def get_verified_for_training(limit: int = 500):
    """Return verified scans (image_name, corrected_category) for fine-tuning / retraining."""
    conn = get_connection()
    try:
        rows = conn.execute(
            """SELECT id, image_name, corrected_category, predicted_category
               FROM scan_history WHERE is_verified = 1 AND corrected_category IS NOT NULL
               ORDER BY id DESC LIMIT ?""",
            (limit,),
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()
