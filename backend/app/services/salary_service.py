import sqlite3
from typing import Any, Dict, List
from app.db.connection import transaction
from app.repositories import employee_repo
from app.schemas.common import dollars_to_cents
from app.schemas.salary import SalaryUpdateRequest


def update_salary_service(
    conn: sqlite3.Connection,
    employee_id: int,
    req: SalaryUpdateRequest
) -> Dict[str, Any]:
    new_salary_cents = dollars_to_cents(req.new_salary)

    with transaction(conn, mode="IMMEDIATE"):
        result = employee_repo.update_employee_salary(
            conn=conn,
            employee_id=employee_id,
            new_salary_cents=new_salary_cents,
            effective_date=req.effective_date
        )
    return result


def get_salary_history_service(
    conn: sqlite3.Connection,
    employee_id: int
) -> List[Dict[str, Any]]:
    return employee_repo.get_employee_salary_history(conn, employee_id)
