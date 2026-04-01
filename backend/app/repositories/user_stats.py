"""
Singleton row `user_stats` (id=1): total CO2 saved, today's CO2, counts per category.
CO2 per validated detection (grams): plastic 40, glass 60, paper_cardboard 15, metal 100.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

from app.database import get_connection

# Grams CO2 equivalent "saved" per validated scan (user-specified)
CO2_GRAMS_BY_CATEGORY: dict[str, float] = {
    "plastic": 40.0,
    "glass": 60.0,
    "paper_cardboard": 15.0,
    "metal": 100.0,
    "organic": 0.0,
    "non_recyclable": 0.0,
}

COUNT_COLUMN: dict[str, str] = {
    "plastic": "count_plastic",
    "glass": "count_glass",
    "paper_cardboard": "count_paper_cardboard",
    "metal": "count_metal",
    "organic": "count_organic",
    "non_recyclable": "count_non_recyclable",
}

SINGLETON_ID = 1
_ALLOWED_COUNT_COLS = frozenset(COUNT_COLUMN.values())


def _today_utc() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def _last_7_days_utc() -> list[str]:
    """Oldest → newest (7 dates including today, UTC)."""
    base = datetime.now(timezone.utc).date()
    return [(base - timedelta(days=6 - i)).isoformat() for i in range(7)]


def _normalize_category(category: str | None) -> str:
    if not category:
        return "non_recyclable"
    c = str(category).strip().lower().replace(" ", "_")
    if c in CO2_GRAMS_BY_CATEGORY:
        return c
    return "non_recyclable"


def record_validated_detection(category: str | None) -> None:
    """Call after a successful /predict or each box persisted from /detect."""
    cat = _normalize_category(category)
    grams = float(CO2_GRAMS_BY_CATEGORY.get(cat, 0.0))
    col = COUNT_COLUMN.get(cat, "count_non_recyclable")
    if col not in _ALLOWED_COUNT_COLS:
        col = "count_non_recyclable"
    today = _today_utc()

    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT total_co2_grams, co2_today_grams, stats_day FROM user_stats WHERE id = ?",
            (SINGLETON_ID,),
        ).fetchone()
        if row is None:
            conn.execute("INSERT OR IGNORE INTO user_stats (id) VALUES (?)", (SINGLETON_ID,))
            conn.commit()
            row = conn.execute(
                "SELECT total_co2_grams, co2_today_grams, stats_day FROM user_stats WHERE id = ?",
                (SINGLETON_ID,),
            ).fetchone()

        total = float(row["total_co2_grams"] or 0)
        today_co2 = float(row["co2_today_grams"] or 0)
        stats_day = row["stats_day"] or ""

        if stats_day != today:
            today_co2 = 0.0
            stats_day = today

        total += grams
        today_co2 += grams

        conn.execute(
            f"""
            UPDATE user_stats SET
                total_co2_grams = ?,
                co2_today_grams = ?,
                stats_day = ?,
                {col} = {col} + 1
            WHERE id = ?
            """,
            (total, today_co2, stats_day, SINGLETON_ID),
        )
        if grams > 0:
            conn.execute(
                """
                INSERT INTO daily_impact (day, co2_grams) VALUES (?, ?)
                ON CONFLICT(day) DO UPDATE SET
                    co2_grams = co2_grams + excluded.co2_grams
                """,
                (today, grams),
            )
        conn.commit()
    finally:
        conn.close()


def _fetch_co2_by_day(conn) -> list[dict]:
    days = _last_7_days_utc()
    if not days:
        return []
    placeholders = ",".join("?" * len(days))
    rows = conn.execute(
        f"SELECT day, co2_grams FROM daily_impact WHERE day IN ({placeholders})",
        days,
    ).fetchall()
    by_day = {str(r["day"]): float(r["co2_grams"] or 0) for r in rows}
    return [{"day": d, "grams": by_day.get(d, 0.0)} for d in days]


def get_stats() -> dict:
    """Return totals and counts for GET /stats."""
    today = _today_utc()
    conn = get_connection()
    try:
        co2_by_day = _fetch_co2_by_day(conn)
        row = conn.execute("SELECT * FROM user_stats WHERE id = ?", (SINGLETON_ID,)).fetchone()
        if row is None:
            return {
                "total_co2_grams_saved": 0.0,
                "co2_saved_today_grams": 0.0,
                "counts_by_category": {k: 0 for k in CO2_GRAMS_BY_CATEGORY},
                "co2_by_day": co2_by_day,
            }
        d = dict(row)
        if (d.get("stats_day") or "") != today:
            today_co2 = 0.0
        else:
            today_co2 = float(d.get("co2_today_grams") or 0)

        counts = {
            "plastic": int(d.get("count_plastic") or 0),
            "glass": int(d.get("count_glass") or 0),
            "paper_cardboard": int(d.get("count_paper_cardboard") or 0),
            "metal": int(d.get("count_metal") or 0),
            "organic": int(d.get("count_organic") or 0),
            "non_recyclable": int(d.get("count_non_recyclable") or 0),
        }
        return {
            "total_co2_grams_saved": float(d.get("total_co2_grams") or 0),
            "co2_saved_today_grams": today_co2,
            "counts_by_category": counts,
            "co2_by_day": co2_by_day,
        }
    finally:
        conn.close()
