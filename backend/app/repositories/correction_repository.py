"""Store user corrections for model retraining (Flutter /classify + /correction flow)."""
from app.database import get_connection


def save_correction(object_name: str, correct_label: str, user_id: str) -> int:
    conn = get_connection()
    try:
        cur = conn.execute(
            "INSERT INTO corrections (object_name, correct_label, user_id) VALUES (?, ?, ?)",
            (object_name, correct_label, user_id),
        )
        conn.commit()
        return cur.lastrowid
    finally:
        conn.close()
