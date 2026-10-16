import sqlite3
from typing import Optional
from app.db.connection import transaction

MIGRATION_SQL = """
CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_code TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    department TEXT NOT NULL,
    job_title TEXT NOT NULL,
    country TEXT NOT NULL,
    current_salary_cents INTEGER NOT NULL CHECK(current_salary_cents >= 0),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS salary_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    previous_salary_cents INTEGER CHECK(previous_salary_cents IS NULL OR previous_salary_cents >= 0),
    new_salary_cents INTEGER NOT NULL CHECK(new_salary_cents >= 0),
    effective_date TEXT NOT NULL,
    recorded_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS hr_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    hr_user_id INTEGER NOT NULL REFERENCES hr_users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    csrf_token_hash TEXT
);

CREATE INDEX IF NOT EXISTS idx_employees_code ON employees(employee_code);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_dept ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_country ON employees(country);
CREATE INDEX IF NOT EXISTS idx_employees_title ON employees(job_title);
CREATE INDEX IF NOT EXISTS idx_employees_salary ON employees(current_salary_cents);
CREATE INDEX IF NOT EXISTS idx_salary_history_emp_date ON salary_history(employee_id, effective_date DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
"""


def init_db(conn: sqlite3.Connection) -> None:
    """Initialize database tables and indexes."""
    conn.executescript(MIGRATION_SQL)

