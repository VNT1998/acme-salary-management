import sqlite3
from typing import Any, Dict, List, Optional, Tuple
from app.core.errors import ConflictError, NotFoundError
from app.repositories.hr_user_repo import get_current_utc_timestamp
from app.schemas.common import cents_to_dollars


def generate_next_employee_code(conn: sqlite3.Connection) -> str:
    """Generate next sequential employee code such as EMP-1001."""
    cursor = conn.execute("SELECT MAX(id) FROM employees")
    max_id = cursor.fetchone()[0]
    next_num = 1001 if max_id is None else 1000 + max_id + 1
    return f"EMP-{next_num}"


def create_employee_with_initial_salary(
    conn: sqlite3.Connection,
    full_name: str,
    email: str,
    department: str,
    job_title: str,
    country: str,
    initial_salary_cents: int,
    effective_date: str,
    employee_code: Optional[str] = None
) -> Dict[str, Any]:
    """Atomically create an employee and their initial salary history entry."""
    now = get_current_utc_timestamp()
    if not employee_code:
        employee_code = generate_next_employee_code(conn)

    try:
        cursor = conn.execute(
            """
            INSERT INTO employees (
                employee_code, full_name, email, department, job_title,
                country, current_salary_cents, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (employee_code, full_name, email, department, job_title, country, initial_salary_cents, now, now)
        )
        employee_id = cursor.lastrowid

        # Insert initial salary history record
        conn.execute(
            """
            INSERT INTO salary_history (
                employee_id, previous_salary_cents, new_salary_cents,
                effective_date, recorded_at
            )
            VALUES (?, NULL, ?, ?, ?)
            """,
            (employee_id, initial_salary_cents, effective_date, now)
        )

        return {
            "id": employee_id,
            "employee_code": employee_code,
            "full_name": full_name,
            "email": email,
            "department": department,
            "job_title": job_title,
            "country": country,
            "current_salary": cents_to_dollars(initial_salary_cents),
            "currency": "USD",
            "created_at": now,
            "updated_at": now
        }
    except sqlite3.IntegrityError as e:
        err_msg = str(e)
        if "UNIQUE constraint failed: employees.email" in err_msg:
            raise ConflictError(f"Employee with email '{email}' already exists.")
        if "UNIQUE constraint failed: employees.employee_code" in err_msg:
            raise ConflictError(f"Employee code '{employee_code}' already exists.")
        raise


def get_employee_by_id(conn: sqlite3.Connection, employee_id: int) -> Optional[Dict[str, Any]]:
    cursor = conn.execute(
        """
        SELECT id, employee_code, full_name, email, department, job_title,
               country, current_salary_cents, created_at, updated_at
        FROM employees
        WHERE id = ?
        """,
        (employee_id,)
    )
    row = cursor.fetchone()
    if not row:
        return None
    res = dict(row)
    res["current_salary"] = cents_to_dollars(res["current_salary_cents"])
    res["currency"] = "USD"
    return res


def update_employee_details(
    conn: sqlite3.Connection,
    employee_id: int,
    updates: Dict[str, Any]
) -> Dict[str, Any]:
    """Update non-salary employee fields."""
    allowed_fields = {"full_name", "email", "department", "job_title", "country"}
    set_clauses: List[str] = []
    params: List[Any] = []

    for key, val in updates.items():
        if key in allowed_fields:
            set_clauses.append(f"{key} = ?")
            params.append(val)

    if not set_clauses:
        existing = get_employee_by_id(conn, employee_id)
        if not existing:
            raise NotFoundError("Employee not found.")
        return existing

    now = get_current_utc_timestamp()
    set_clauses.append("updated_at = ?")
    params.append(now)
    params.append(employee_id)

    try:
        cursor = conn.execute(
            f"UPDATE employees SET {', '.join(set_clauses)} WHERE id = ?",
            params
        )
        if cursor.rowcount == 0:
            raise NotFoundError("Employee not found.")
    except sqlite3.IntegrityError as e:
        if "UNIQUE constraint failed: employees.email" in str(e):
            raise ConflictError("Employee with this email already exists.")
        raise

    return get_employee_by_id(conn, employee_id)


def update_employee_salary(
    conn: sqlite3.Connection,
    employee_id: int,
    new_salary_cents: int,
    effective_date: str
) -> Dict[str, Any]:
    """Dedicated transactional salary update workflow appending immutable salary history."""
    now = get_current_utc_timestamp()

    # Fetch current salary
    cursor = conn.execute(
        "SELECT current_salary_cents FROM employees WHERE id = ?",
        (employee_id,)
    )
    row = cursor.fetchone()
    if not row:
        raise NotFoundError("Employee not found.")

    previous_salary_cents = row["current_salary_cents"]

    # Update employee's current salary
    conn.execute(
        "UPDATE employees SET current_salary_cents = ?, updated_at = ? WHERE id = ?",
        (new_salary_cents, now, employee_id)
    )

    # Insert salary history record
    conn.execute(
        """
        INSERT INTO salary_history (
            employee_id, previous_salary_cents, new_salary_cents,
            effective_date, recorded_at
        )
        VALUES (?, ?, ?, ?, ?)
        """,
        (employee_id, previous_salary_cents, new_salary_cents, effective_date, now)
    )

    return {
        "employee_id": employee_id,
        "previous_salary": cents_to_dollars(previous_salary_cents),
        "current_salary": cents_to_dollars(new_salary_cents),
        "currency": "USD",
        "effective_date": effective_date,
        "recorded_at": now
    }


def get_employee_salary_history(conn: sqlite3.Connection, employee_id: int) -> List[Dict[str, Any]]:
    # Check if employee exists
    emp = get_employee_by_id(conn, employee_id)
    if not emp:
        raise NotFoundError("Employee not found.")

    cursor = conn.execute(
        """
        SELECT id, employee_id, previous_salary_cents, new_salary_cents,
               effective_date, recorded_at
        FROM salary_history
        WHERE employee_id = ?
        ORDER BY effective_date DESC, id DESC
        """,
        (employee_id,)
    )
    rows = cursor.fetchall()
    results = []
    for r in rows:
        prev = cents_to_dollars(r["previous_salary_cents"]) if r["previous_salary_cents"] is not None else None
        results.append({
            "id": r["id"],
            "employee_id": r["employee_id"],
            "previous_salary": prev,
            "new_salary": cents_to_dollars(r["new_salary_cents"]),
            "effective_date": r["effective_date"],
            "recorded_at": r["recorded_at"]
        })
    return results


def list_employees(
    conn: sqlite3.Connection,
    page: int = 1,
    page_size: int = 25,
    search: Optional[str] = None,
    department: Optional[str] = None,
    country: Optional[str] = None,
    job_title: Optional[str] = None,
    min_salary_cents: Optional[int] = None,
    max_salary_cents: Optional[int] = None,
    sort_by: str = "id",
    sort_order: str = "asc"
) -> Tuple[List[Dict[str, Any]], int]:
    """Query employees with filtering, searching, and server-side pagination."""
    where_clauses: List[str] = []
    params: List[Any] = []

    if search:
        search_pattern = f"%{search.strip()}%"
        where_clauses.append("(employee_code LIKE ? OR full_name LIKE ? OR email LIKE ?)")
        params.extend([search_pattern, search_pattern, search_pattern])

    if department:
        where_clauses.append("department = ?")
        params.append(department)

    if country:
        where_clauses.append("country = ?")
        params.append(country)

    if job_title:
        where_clauses.append("job_title = ?")
        params.append(job_title)

    if min_salary_cents is not None:
        where_clauses.append("current_salary_cents >= ?")
        params.append(min_salary_cents)

    if max_salary_cents is not None:
        where_clauses.append("current_salary_cents <= ?")
        params.append(max_salary_cents)

    where_sql = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ""

    # Count total items
    count_sql = f"SELECT COUNT(*) FROM employees {where_sql}"
    total_items = conn.execute(count_sql, params).fetchone()[0]

    # Validate sort field
    allowed_sort_fields = {
        "id": "id",
        "employee_code": "employee_code",
        "full_name": "full_name",
        "email": "email",
        "department": "department",
        "job_title": "job_title",
        "country": "country",
        "current_salary": "current_salary_cents",
        "created_at": "created_at"
    }
    sort_column = allowed_sort_fields.get(sort_by, "id")
    direction = "DESC" if sort_order.lower() == "desc" else "ASC"

    offset = (page - 1) * page_size
    query_sql = f"""
        SELECT id, employee_code, full_name, email, department, job_title,
               country, current_salary_cents, created_at, updated_at
        FROM employees
        {where_sql}
        ORDER BY {sort_column} {direction}, id ASC
        LIMIT ? OFFSET ?
    """
    rows = conn.execute(query_sql, params + [page_size, offset]).fetchall()

    items = []
    for r in rows:
        item = dict(r)
        item["current_salary"] = cents_to_dollars(item["current_salary_cents"])
        item["currency"] = "USD"
        items.append(item)

    return items, total_items
