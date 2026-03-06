from app.database import get_connection


def create(type_: str, content: str | None = None, rating: int | None = None):
    conn = get_connection()
    try:
        cur = conn.execute(
            "INSERT INTO feedback (type, content, rating) VALUES (?, ?, ?)",
            (type_, content or None, rating),
        )
        conn.commit()
        return cur.lastrowid
    finally:
        conn.close()
