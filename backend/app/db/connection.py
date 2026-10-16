import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Generator
from app.core.config import get_settings


def create_connection(db_path: Path | str | None = None) -> sqlite3.Connection:
    if db_path is None:
        db_path = get_settings().database_file_path

    path_str = str(db_path)
    if path_str != ":memory:":
        Path(path_str).resolve().parent.mkdir(parents=True, exist_ok=True)


    conn = sqlite3.connect(
        str(db_path),
        check_same_thread=False,
        isolation_level=None  # Explicit transaction management
    )
    conn.row_factory = sqlite3.Row

    # Enforce SQLite best practices and constraints
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA busy_timeout = 5000;")
    conn.execute("PRAGMA synchronous = NORMAL;")

    return conn


@contextmanager
def get_db_connection(db_path: Path | str | None = None) -> Generator[sqlite3.Connection, None, None]:
    conn = create_connection(db_path)
    try:
        yield conn
    finally:
        conn.close()


@contextmanager
def transaction(conn: sqlite3.Connection, mode: str = "IMMEDIATE") -> Generator[sqlite3.Connection, None, None]:
    """Execute a block within an explicit SQLite transaction.
    
    Default is BEGIN IMMEDIATE to prevent concurrent write collisions and lost updates.
    """
    conn.execute(f"BEGIN {mode};")
    try:
        yield conn
        conn.execute("COMMIT;")
    except Exception:
        conn.execute("ROLLBACK;")
        raise
