from typing import List, Optional
from pydantic import BaseModel


class DepartmentBreakdown(BaseModel):
    department: str
    employee_count: int
    average_salary: str
    median_salary: str
    minimum_salary: str
    maximum_salary: str


class SalaryAnalyticsResponse(BaseModel):
    currency: str = "USD"
    employee_count: int
    average_salary: Optional[str] = None
    median_salary: Optional[str] = None
    minimum_salary: Optional[str] = None
    maximum_salary: Optional[str] = None
    department_breakdown: List[DepartmentBreakdown]
