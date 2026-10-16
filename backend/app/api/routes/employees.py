import sqlite3
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query, status
from app.api.dependencies import get_current_user, get_db
from app.schemas.employee import (
    EmployeeCreateRequest,
    EmployeeListResponse,
    EmployeeResponse,
    EmployeeUpdateRequest,
)
from app.services.employee_service import (
    create_employee,
    get_distinct_filter_options,
    get_employee,
    list_employees_service,
    update_employee,
)

router = APIRouter(prefix="/employees", tags=["Employees"])


@router.get("", response_model=EmployeeListResponse)
def list_employees_endpoint(
    page: int = Query(1, ge=1, description="1-based page number"),
    page_size: int = Query(25, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search employee code, name, or email"),
    department: Optional[str] = Query(None, description="Exact department filter"),
    country: Optional[str] = Query(None, description="Exact country filter"),
    job_title: Optional[str] = Query(None, description="Exact job title filter"),
    min_salary: Optional[str] = Query(None, description="Minimum USD salary"),
    max_salary: Optional[str] = Query(None, description="Maximum USD salary"),
    sort_by: str = Query("id", description="Sort field allowlisted"),
    sort_order: str = Query("asc", description="Sort direction (asc or desc)"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: sqlite3.Connection = Depends(get_db)
):
    return list_employees_service(
        conn=conn,
        page=page,
        page_size=page_size,
        search=search,
        department=department,
        country=country,
        job_title=job_title,
        min_salary=min_salary,
        max_salary=max_salary,
        sort_by=sort_by,
        sort_order=sort_order
    )


@router.get("/meta/filter-options", response_model=Dict[str, List[str]])
def get_filter_options_endpoint(
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: sqlite3.Connection = Depends(get_db)
):
    return get_distinct_filter_options(conn)


@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee_endpoint(
    payload: EmployeeCreateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: sqlite3.Connection = Depends(get_db)
):
    return create_employee(conn, payload)


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee_endpoint(
    employee_id: int,
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: sqlite3.Connection = Depends(get_db)
):
    return get_employee(conn, employee_id)


@router.patch("/{employee_id}", response_model=EmployeeResponse)
def update_employee_endpoint(
    employee_id: int,
    payload: EmployeeUpdateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: sqlite3.Connection = Depends(get_db)
):
    return update_employee(conn, employee_id, payload)
