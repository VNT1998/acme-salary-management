import sqlite3
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from app.repositories.hr_user_repo import get_current_utc_timestamp


def create_session(
    conn: sqlite3.Connection,
    session_id_hash: str,
    hr_user_id: int,
    expires_at: str,
    csrf_token_hash: Optional[str] = None
) -> None:
    now = get_current_utc_timestamp()
    conn.execute(
        """
        INSERT INTO sessions (id, hr_user_id, created_at, expires_at, csrf_token_hash)
        VALUES (?, ?, ?, ?, ?)
        """,
        (session_id_hash, hr_user_id, now, expires_at, csrf_token_hash)
    )


def get_session_with_user(conn: sqlite3.Connection, session_id_hash: str) -> Optional[Dict[str, Any]]:
    now = get_current_utc_timestamp()
    cursor = conn.execute(
        """
        SELECT 
            s.id AS session_id,
            s.hr_user_id,
            s.created_at AS session_created_at,
            s.expires_at,
            s.csrf_token_hash,
            u.id AS user_id,
            u.email,
            u.is_active
        FROM sessions s
        JOIN hr_users u ON s.hr_user_id = u.id
        WHERE s.id = ? AND s.expires_at > ? AND u.is_active = 1
        """,
        (session_id_hash, now)
    )
    row = cursor.fetchone()
    if not row:
        return None
    return dict(row)


def delete_session(conn: sqlite3.Connection, session_id_hash: str) -> None:
    conn.execute("DELETE FROM sessions WHERE id = ?", (session_id_hash,))


def cleanup_expired_sessions(conn: sqlite3.Connection) -> int:
    now = get_current_utc_timestamp()
    cursor = conn.execute("DELETE FROM sessions WHERE expires_at <= ?", (now,))
    return cursor.rowcount
