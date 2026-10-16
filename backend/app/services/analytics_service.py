import sqlite3
from collections import defaultdict
from decimal import Decimal, ROUND_HALF_UP
from typing import Any, Dict, List, Optional
from app.core.errors import ValidationError
from app.schemas.analytics import DepartmentBreakdown, SalaryAnalyticsResponse
from app.schemas.common import cents_to_dollars, dollars_to_cents


def compute_median_dollars(sorted_cents: List[int]) -> Optional[str]:
    n = len(sorted_cents)
    if n == 0:
        return None
    if n % 2 == 1:
        median_cents = Decimal(sorted_cents[n // 2])
    else:
        median_cents = (Decimal(sorted_cents[(n // 2) - 1]) + Decimal(sorted_cents[n // 2])) / Decimal(2)
    dollars = (median_cents / Decimal(100)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return f"{dollars:.2f}"


def compute_average_dollars(total_cents: int, count: int) -> Optional[str]:
    if count == 0:
        return None
    avg_dollars = (Decimal(total_cents) / Decimal(count) / Decimal(100)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return f"{avg_dollars:.2f}"


def get_salary_analytics(
    conn: sqlite3.Connection,
    department: Optional[str] = None,
    country: Optional[str] = None,
    job_title: Optional[str] = None,
    min_salary: Optional[str] = None,
    max_salary: Optional[str] = None
) -> SalaryAnalyticsResponse:
    min_cents = dollars_to_cents(min_salary) if min_salary is not None and min_salary != "" else None
    max_cents = dollars_to_cents(max_salary) if max_salary is not None and max_salary != "" else None

    if min_cents is not None and max_cents is not None and min_cents > max_cents:
        raise ValidationError("min_salary cannot be greater than max_salary.")

    where_clauses: List[str] = []
    params: List[Any] = []

    if department:
        where_clauses.append("department = ?")
        params.append(department)

    if country:
        where_clauses.append("country = ?")
        params.append(country)

    if job_title:
        where_clauses.append("job_title = ?")
        params.append(job_title)

    if min_cents is not None:
        where_clauses.append("current_salary_cents >= ?")
        params.append(min_cents)

    if max_cents is not None:
        where_clauses.append("current_salary_cents <= ?")
        params.append(max_cents)

    where_sql = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ""

    query = f"""
        SELECT department, current_salary_cents
        FROM employees
        {where_sql}
        ORDER BY department ASC, current_salary_cents ASC
    """
    rows = conn.execute(query, params).fetchall()

    if not rows:
        return SalaryAnalyticsResponse(
            currency="USD",
            employee_count=0,
            average_salary=None,
            median_salary=None,
            minimum_salary=None,
            maximum_salary=None,
            department_breakdown=[]
        )

    all_salaries: List[int] = []
    dept_salaries: Dict[str, List[int]] = defaultdict(list)

    for r in rows:
        dept = r["department"]
        cents = r["current_salary_cents"]
        all_salaries.append(cents)
        dept_salaries[dept].append(cents)

    # Sort overall salaries
    all_salaries.sort()
    total_count = len(all_salaries)
    total_sum = sum(all_salaries)
    overall_avg = compute_average_dollars(total_sum, total_count)
    overall_median = compute_median_dollars(all_salaries)
    overall_min = cents_to_dollars(all_salaries[0])
    overall_max = cents_to_dollars(all_salaries[-1])

    breakdowns: List[DepartmentBreakdown] = []
    for dept_name in sorted(dept_salaries.keys()):
        salaries = dept_salaries[dept_name]
        d_count = len(salaries)
        d_sum = sum(salaries)
        breakdowns.append(
            DepartmentBreakdown(
                department=dept_name,
                employee_count=d_count,
                average_salary=compute_average_dollars(d_sum, d_count) or "0.00",
                median_salary=compute_median_dollars(salaries) or "0.00",
                minimum_salary=cents_to_dollars(salaries[0]),
                maximum_salary=cents_to_dollars(salaries[-1])
            )
        )

    return SalaryAnalyticsResponse(
        currency="USD",
        employee_count=total_count,
        average_salary=overall_avg,
        median_salary=overall_median,
        minimum_salary=overall_min,
        maximum_salary=overall_max,
        department_breakdown=breakdowns
    )
