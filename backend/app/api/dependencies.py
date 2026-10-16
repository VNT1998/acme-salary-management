import sqlite3
from typing import Any, Dict, Generator
from fastapi import Depends, Header, Request
from app.core.config import get_settings
from app.core.errors import UnauthorizedError
from app.db.connection import get_db_connection
from app.services.auth_service import get_authenticated_session, validate_session_csrf


def get_db() -> Generator[sqlite3.Connection, None, None]:
    settings = get_settings()
    with get_db_connection(settings.database_file_path) as conn:
        yield conn


def get_current_user(
    request: Request,
    conn: sqlite3.Connection = Depends(get_db),
    x_csrf_token: str | None = Header(None, alias="X-CSRF-Token")
) -> Dict[str, Any]:
    """Dependency that verifies authenticated HR user session and CSRF on state changes."""
    settings = get_settings()
    session_token = request.cookies.get(settings.SESSION_COOKIE_NAME)

    if not session_token:
        raise UnauthorizedError("Authentication required.")

    session = get_authenticated_session(conn, session_token)
    if not session:
        raise UnauthorizedError("Session expired or invalid.")

    # Validate CSRF for unsafe state-changing HTTP methods
    if request.method in {"POST", "PATCH", "PUT", "DELETE"}:
        validate_session_csrf(session, x_csrf_token)

    return {
        "id": session["user_id"],
        "email": session["email"],
        "session_token": session_token
    }
