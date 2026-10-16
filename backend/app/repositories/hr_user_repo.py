import sqlite3
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from app.core.errors import ConflictError


def get_current_utc_timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()


def create_hr_user(conn: sqlite3.Connection, email: str, password_hash: str) -> Dict[str, Any]:
    now = get_current_utc_timestamp()
    try:
        cursor = conn.execute(
            """
            INSERT INTO hr_users (email, password_hash, is_active, created_at)
            VALUES (?, ?, 1, ?)
            """,
            (email, password_hash, now)
        )
        user_id = cursor.lastrowid
        return {
            "id": user_id,
            "email": email,
            "is_active": True,
            "created_at": now
        }
    except sqlite3.IntegrityError as e:
        if "UNIQUE constraint failed: hr_users.email" in str(e):
            raise ConflictError(f"User with email '{email}' already exists.")
        raise


def get_hr_user_by_email(conn: sqlite3.Connection, email: str) -> Optional[Dict[str, Any]]:
    cursor = conn.execute(
        "SELECT id, email, password_hash, is_active, created_at FROM hr_users WHERE email = ?",
        (email,)
    )
    row = cursor.fetchone()
    if not row:
        return None
    return dict(row)


def get_hr_user_by_id(conn: sqlite3.Connection, user_id: int) -> Optional[Dict[str, Any]]:
    cursor = conn.execute(
        "SELECT id, email, password_hash, is_active, created_at FROM hr_users WHERE id = ?",
        (user_id,)
    )
    row = cursor.fetchone()
    if not row:
        return None
    return dict(row)
