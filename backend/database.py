import aiosqlite
import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)

DB_PATH = os.environ.get(
    "DB_PATH",
    os.path.join(os.path.dirname(__file__), "..", "data", "clicks.db"),
)

_NEW_COLUMNS = [
    ("tab_id",          "TEXT    DEFAULT NULL"),
    ("session_id",      "TEXT    DEFAULT NULL"),
    ("viewport_width",  "INTEGER DEFAULT NULL"),
    ("viewport_height", "INTEGER DEFAULT NULL"),
]


async def init_db() -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS clicks (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id     TEXT    NOT NULL,
                button_name TEXT    NOT NULL,
                page        TEXT    NOT NULL,
                x           INTEGER NOT NULL,
                y           INTEGER NOT NULL,
                timestamp   TEXT    NOT NULL,
                created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
            )
        """)
        await db.execute("CREATE INDEX IF NOT EXISTS idx_user   ON clicks(user_id)")
        await db.execute("CREATE INDEX IF NOT EXISTS idx_button ON clicks(button_name)")

        # Idempotent migration: add new columns if they don't exist yet
        for col_name, col_def in _NEW_COLUMNS:
            try:
                await db.execute(
                    f"ALTER TABLE clicks ADD COLUMN {col_name} {col_def}"
                )
            except Exception:
                # Column already exists — safe to ignore
                pass

        await db.execute(
            "CREATE INDEX IF NOT EXISTS idx_session ON clicks(session_id)"
        )
        await db.commit()


async def insert_click(
    user_id: str,
    button_name: str,
    page: str,
    x: int,
    y: int,
    timestamp: str,
    tab_id: Optional[str] = None,
    session_id: Optional[str] = None,
    viewport_width: Optional[int] = None,
    viewport_height: Optional[int] = None,
) -> int:
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            "INSERT INTO clicks "
            "(user_id, button_name, page, x, y, timestamp, tab_id, session_id, viewport_width, viewport_height) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (user_id, button_name, page, x, y, timestamp,
             tab_id, session_id, viewport_width, viewport_height),
        )
        await db.commit()
        return cursor.lastrowid


async def get_clicks(
    user_id: Optional[str] = None,
    button_name: Optional[str] = None,
    page: Optional[str] = None,
    limit: int = 2000,
) -> list[dict]:
    conditions: list[str] = []
    params: list = []
    if user_id:
        conditions.append("user_id = ?")
        params.append(user_id)
    if button_name:
        conditions.append("button_name = ?")
        params.append(button_name)
    if page:
        conditions.append("page = ?")
        params.append(page)

    where = ("WHERE " + " AND ".join(conditions)) if conditions else ""
    params.append(limit)

    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            f"SELECT * FROM clicks {where} ORDER BY id DESC LIMIT ?",
            params,
        )
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]


async def get_distinct_users() -> list[str]:
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            "SELECT DISTINCT user_id FROM clicks ORDER BY user_id"
        )
        rows = await cursor.fetchall()
        return [r[0] for r in rows]


async def get_heatmap(user_ids: Optional[list[str]] = None) -> list[dict]:
    if user_ids:
        placeholders = ",".join("?" * len(user_ids))
        query = (
            f"SELECT button_name, COUNT(*) as count FROM clicks "
            f"WHERE user_id IN ({placeholders}) GROUP BY button_name"
        )
        params: list = user_ids
    else:
        query = "SELECT button_name, COUNT(*) as count FROM clicks GROUP BY button_name"
        params = []

    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(query, params)
        rows = await cursor.fetchall()
        return [{"button_name": r[0], "count": r[1]} for r in rows]
