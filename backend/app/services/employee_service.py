import math
import sqlite3
from datetime import date
from typing import Any, Dict, List, Optional, Tuple
from app.core.errors import NotFoundError, ValidationError
from app.db.connection import transaction
from app.repositories import employee_repo
from app.schemas.common import dollars_to_cents, validate_iso_date
from app.schemas.employee import EmployeeCreateRequest, EmployeeUpdateRequest


def create_employee(conn: sqlite3.Connection, req: EmployeeCreateRequest) -> Dict[str, Any]:
    salary_cents = dollars_to_cents(req.initial_salary)
    effective_date = req.effective_date or date.today().isoformat()
    validate_iso_date(effective_date)

    with transaction(conn):
        created = employee_repo.create_employee_with_initial_salary(
            conn=conn,
            full_name=req.full_name,
            email=req.email,
            department=req.department,
            job_title=req.job_title,
            country=req.country,
            initial_salary_cents=salary_cents,
            effective_date=effective_date
        )
    return created


def get_employee(conn: sqlite3.Connection, employee_id: int) -> Dict[str, Any]:
    emp = employee_repo.get_employee_by_id(conn, employee_id)
    if not emp:
        raise NotFoundError(f"Employee with ID {employee_id} not found.")
    return emp


def update_employee(conn: sqlite3.Connection, employee_id: int, req: EmployeeUpdateRequest) -> Dict[str, Any]:
    updates = req.model_dump(exclude_unset=True)
    # Remove any potential None or forbidden keys
    filtered_updates = {k: v for k, v in updates.items() if v is not None and k not in {"salary", "current_salary", "initial_salary"}}

    with transaction(conn):
        updated = employee_repo.update_employee_details(conn, employee_id, filtered_updates)
    return updated


def list_employees_service(
    conn: sqlite3.Connection,
    page: int = 1,
    page_size: int = 25,
    search: Optional[str] = None,
    department: Optional[str] = None,
    country: Optional[str] = None,
    job_title: Optional[str] = None,
    min_salary: Optional[str] = None,
    max_salary: Optional[str] = None,
    sort_by: str = "id",
    sort_order: str = "asc"
) -> Dict[str, Any]:
    if page < 1:
        raise ValidationError("Page must be greater than or equal to 1.")
    if page_size < 1 or page_size > 100:
        raise ValidationError("Page size must be between 1 and 100.")

    min_cents = dollars_to_cents(min_salary) if min_salary is not None and min_salary != "" else None
    max_cents = dollars_to_cents(max_salary) if max_salary is not None and max_salary != "" else None

    if min_cents is not None and max_cents is not None and min_cents > max_cents:
        raise ValidationError("min_salary cannot be greater than max_salary.")

    items, total_items = employee_repo.list_employees(
        conn=conn,
        page=page,
        page_size=page_size,
        search=search,
        department=department,
        country=country,
        job_title=job_title,
        min_salary_cents=min_cents,
        max_salary_cents=max_cents,
        sort_by=sort_by,
        sort_order=sort_order
    )

    total_pages = math.ceil(total_items / page_size) if total_items > 0 else 0

    return {
        "items": items,
        "page": page,
        "page_size": page_size,
        "total_items": total_items,
        "total_pages": total_pages
    }


def get_distinct_filter_options(conn: sqlite3.Connection) -> Dict[str, List[str]]:
    """Retrieve distinct options for UI filter dropdowns."""
    depts = [r[0] for r in conn.execute("SELECT DISTINCT department FROM employees WHERE department IS NOT NULL ORDER BY department").fetchall()]
    countries = [r[0] for r in conn.execute("SELECT DISTINCT country FROM employees WHERE country IS NOT NULL ORDER BY country").fetchall()]
    titles = [r[0] for r in conn.execute("SELECT DISTINCT job_title FROM employees WHERE job_title IS NOT NULL ORDER BY job_title").fetchall()]
    return {
        "departments": depts,
        "countries": countries,
        "job_titles": titles
    }
