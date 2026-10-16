import sqlite3
from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, Query
from app.api.dependencies import get_current_user, get_db
from app.schemas.analytics import SalaryAnalyticsResponse
from app.services.analytics_service import get_salary_analytics

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/salaries", response_model=SalaryAnalyticsResponse)
def get_salaries_analytics_endpoint(
    department: Optional[str] = Query(None, description="Exact department filter"),
    country: Optional[str] = Query(None, description="Exact country filter"),
    job_title: Optional[str] = Query(None, description="Exact job title filter"),
    min_salary: Optional[str] = Query(None, description="Minimum USD salary"),
    max_salary: Optional[str] = Query(None, description="Maximum USD salary"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: sqlite3.Connection = Depends(get_db)
):
    return get_salary_analytics(
        conn=conn,
        department=department,
        country=country,
        job_title=job_title,
        min_salary=min_salary,
        max_salary=max_salary
    )
