import sqlite3
from pathlib import Path
import config

DB_PATH = config.DATABASE_PATH


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)
    conn = get_connection()
    try:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS scan_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                image_name TEXT NOT NULL,
                object_name TEXT,
                product_type TEXT,
                predicted_category TEXT NOT NULL,
                recommended_bin TEXT NOT NULL,
                corrected_category TEXT,
                is_verified INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()
        for col, typ in (
            ("object_name", "TEXT"),
            ("product_type", "TEXT"),
            ("corrected_category", "TEXT"),
            ("is_verified", "INTEGER DEFAULT 0"),
        ):
            try:
                conn.execute(f"ALTER TABLE scan_history ADD COLUMN {col} {typ}")
                conn.commit()
            except sqlite3.OperationalError:
                pass
        conn.execute("""
            CREATE TABLE IF NOT EXISTS feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL,
                content TEXT,
                rating INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()
        conn.execute("""
            CREATE TABLE IF NOT EXISTS corrections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                object_name TEXT NOT NULL,
                correct_label TEXT NOT NULL,
                user_id TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()
        # One row per bounding box from POST /detect (live or batch)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS detection_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                image_name TEXT NOT NULL,
                label TEXT NOT NULL,
                category TEXT,
                confidence REAL NOT NULL,
                bbox_x1 REAL NOT NULL,
                bbox_y1 REAL NOT NULL,
                bbox_x2 REAL NOT NULL,
                bbox_y2 REAL NOT NULL,
                recycling_advice TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()
        # Singleton impact tracker (id = 1): CO2 saved + counts per category
        conn.execute("""
            CREATE TABLE IF NOT EXISTS user_stats (
                id INTEGER PRIMARY KEY,
                total_co2_grams REAL NOT NULL DEFAULT 0,
                co2_today_grams REAL NOT NULL DEFAULT 0,
                stats_day TEXT NOT NULL DEFAULT '',
                count_plastic INTEGER NOT NULL DEFAULT 0,
                count_glass INTEGER NOT NULL DEFAULT 0,
                count_paper_cardboard INTEGER NOT NULL DEFAULT 0,
                count_metal INTEGER NOT NULL DEFAULT 0,
                count_organic INTEGER NOT NULL DEFAULT 0,
                count_non_recyclable INTEGER NOT NULL DEFAULT 0
            )
        """)
        conn.commit()
        conn.execute("INSERT OR IGNORE INTO user_stats (id) VALUES (1)")
        conn.commit()
        conn.execute("""
            CREATE TABLE IF NOT EXISTS daily_impact (
                day TEXT PRIMARY KEY,
                co2_grams REAL NOT NULL DEFAULT 0
            )
        """)
        conn.commit()
    finally:
        conn.close()
