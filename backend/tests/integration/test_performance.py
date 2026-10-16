import time
import pytest
from app.db.connection import create_connection
from app.db.migrations import init_db
from app.repositories import employee_repo
from app.services import analytics_service
from scripts.seed import run_seed


@pytest.fixture(scope="module")
def seeded_db():
    conn = create_connection(":memory:")
    init_db(conn)
    # Seed 10,000 employees
    run_seed(conn, count=10000, reset=True)
    yield conn
    conn.close()


def test_query_plans_and_indexes(seeded_db):
    conn = seeded_db

    # 1. Employee code lookup uses index
    plan_code = conn.execute("EXPLAIN QUERY PLAN SELECT * FROM employees WHERE employee_code = 'EMP-1500'").fetchall()
    plan_code_text = " ".join([str(p[3]) for p in plan_code])
    assert "USING INDEX" in plan_code_text and "employee_code=?" in plan_code_text

    # 2. Email lookup uses index
    plan_email = conn.execute("EXPLAIN QUERY PLAN SELECT * FROM employees WHERE email = 'john.smith.100@acme.test'").fetchall()
    plan_email_text = " ".join([str(p[3]) for p in plan_email])
    assert "USING INDEX" in plan_email_text and "email=?" in plan_email_text


    # 3. Department filter uses department index
    plan_dept = conn.execute("EXPLAIN QUERY PLAN SELECT * FROM employees WHERE department = 'Engineering'").fetchall()
    plan_dept_text = " ".join([str(p[3]) for p in plan_dept])
    assert "idx_employees_dept" in plan_dept_text

    # 4. Salary history lookup uses composite index
    plan_hist = conn.execute("EXPLAIN QUERY PLAN SELECT * FROM salary_history WHERE employee_id = 100 ORDER BY effective_date DESC").fetchall()
    plan_hist_text = " ".join([str(p[3]) for p in plan_hist])
    assert "idx_salary_history_emp_date" in plan_hist_text


def test_performance_benchmarks_10000_records(seeded_db):
    conn = seeded_db

    # 1. Benchmark filtered employee list with pagination
    t0 = time.time()
    items, total = employee_repo.list_employees(
        conn=conn,
        page=1,
        page_size=25,
        department="Engineering",
        min_salary_cents=8000000,
        max_salary_cents=15000000,
        sort_by="current_salary",
        sort_order="desc"
    )
    t_list = (time.time() - t0) * 1000  # ms
    assert len(items) <= 25
    assert total > 0
    print(f"\n[Benchmark] 25 items paginated & filtered from 10,000 employees: {t_list:.2f}ms")
    assert t_list < 50.0  # Must be faster than 50ms

    # 2. Benchmark full dataset analytics calculation over all 10,000 employees
    t1 = time.time()
    analytics = analytics_service.get_salary_analytics(conn=conn)
    t_analytics = (time.time() - t1) * 1000  # ms
    assert analytics.employee_count == 10000
    assert len(analytics.department_breakdown) > 0
    assert analytics.average_salary is not None
    assert analytics.median_salary is not None
    print(f"[Benchmark] Full statistical analytics over 10,000 records: {t_analytics:.2f}ms")
    assert t_analytics < 100.0  # Must be faster than 100ms
