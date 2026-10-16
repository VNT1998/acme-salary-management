import sqlite3
from typing import Any, Dict, List
from fastapi import APIRouter, Depends
from app.api.dependencies import get_current_user, get_db
from app.schemas.salary import (
    SalaryHistoryItemResponse,
    SalaryUpdateRequest,
    SalaryUpdateResponse,
)
from app.services.salary_service import (
    get_salary_history_service,
    update_salary_service,
)

router = APIRouter(prefix="/employees", tags=["Salaries"])


@router.post("/{employee_id}/salary-updates", response_model=SalaryUpdateResponse)
def update_salary_endpoint(
    employee_id: int,
    payload: SalaryUpdateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: sqlite3.Connection = Depends(get_db)
):
    return update_salary_service(conn, employee_id, payload)


@router.get("/{employee_id}/salary-history", response_model=List[SalaryHistoryItemResponse])
def get_salary_history_endpoint(
    employee_id: int,
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: sqlite3.Connection = Depends(get_db)
):
    return get_salary_history_service(conn, employee_id)
