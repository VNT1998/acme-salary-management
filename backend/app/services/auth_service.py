import sqlite3
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Tuple
from app.core.config import get_settings
from app.core.errors import ForbiddenError, UnauthorizedError
from app.core.security import (
    generate_csrf_token,
    generate_session_token,
    hash_csrf_token,
    hash_session_token,
    verify_csrf_token,
    verify_password,
)
from app.db.connection import transaction
from app.repositories import hr_user_repo, session_repo
from app.schemas.common import normalize_email


def authenticate_hr_user(
    conn: sqlite3.Connection,
    email: str,
    password: str
) -> Tuple[Dict[str, Any], str, str]:
    """Authenticate HR user and create a new session.
    
    Returns (user_dict, raw_session_token, raw_csrf_token).
    """
    try:
        norm_email = normalize_email(email)
    except Exception:
        raise UnauthorizedError("Invalid email or password.")

    user = hr_user_repo.get_hr_user_by_email(conn, norm_email)
    if not user or not user["is_active"]:
        raise UnauthorizedError("Invalid email or password.")

    if not verify_password(password, user["password_hash"]):
        raise UnauthorizedError("Invalid email or password.")

    # Generate session and CSRF tokens
    raw_session_token = generate_session_token()
    session_id_hash = hash_session_token(raw_session_token)

    raw_csrf_token = generate_csrf_token()
    csrf_hash = hash_csrf_token(raw_csrf_token)

    settings = get_settings()
    expires_at = (datetime.now(timezone.utc) + timedelta(hours=settings.SESSION_EXPIRE_HOURS)).isoformat()

    with transaction(conn):
        session_repo.create_session(
            conn=conn,
            session_id_hash=session_id_hash,
            hr_user_id=user["id"],
            expires_at=expires_at,
            csrf_token_hash=csrf_hash
        )

    return (
        {"id": user["id"], "email": user["email"]},
        raw_session_token,
        raw_csrf_token
    )


def get_authenticated_session(
    conn: sqlite3.Connection,
    raw_session_token: str
) -> Optional[Dict[str, Any]]:
    """Verify raw session token against hashed session database."""
    session_id_hash = hash_session_token(raw_session_token)
    session = session_repo.get_session_with_user(conn, session_id_hash)
    return session


def logout_session(conn: sqlite3.Connection, raw_session_token: str) -> None:
    session_id_hash = hash_session_token(raw_session_token)
    with transaction(conn):
        session_repo.delete_session(conn, session_id_hash)


def validate_session_csrf(session: Dict[str, Any], csrf_token_header: Optional[str]) -> None:
    """Validate CSRF token header for state-changing requests."""
    expected_hash = session.get("csrf_token_hash")
    if not expected_hash:
        return

    if not csrf_token_header or not verify_csrf_token(csrf_token_header, expected_hash):
        raise ForbiddenError("Invalid or missing CSRF token.")
