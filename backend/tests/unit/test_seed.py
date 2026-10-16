import sqlite3
from app.db.connection import create_connection
from scripts.seed import generate_seed_dataset, run_seed


def test_generate_seed_dataset_determinism():
    emp1, hist1 = generate_seed_dataset(count=50, seed=42)
    emp2, hist2 = generate_seed_dataset(count=50, seed=42)

    assert emp1 == emp2
    assert hist1 == hist2
    assert len(emp1) == 50
    assert len(hist1) == 50

    # Verify initial salary history structure: previous_salary is None, new_salary matches employee salary
    for emp, hist in zip(emp1, hist1):
        assert hist[1] is None  # previous_salary_cents
        assert hist[2] == emp[7]  # new_salary_cents matches employee current_salary_cents


def test_seed_execution_and_idempotence():
    conn = create_connection(":memory:")

    # 1. First run seeds dataset
    count = run_seed(conn, count=100)
    assert count == 100

    emp_count = conn.execute("SELECT COUNT(*) FROM employees").fetchone()[0]
    hist_count = conn.execute("SELECT COUNT(*) FROM salary_history").fetchone()[0]
    assert emp_count == 100
    assert hist_count == 100

    # 2. Re-running without reset is a safe no-op
    count_rerun = run_seed(conn, count=100, reset=False)
    assert count_rerun == 100
    assert conn.execute("SELECT COUNT(*) FROM employees").fetchone()[0] == 100

    # 3. Reset works cleanly
    count_reset = run_seed(conn, count=50, reset=True)
    assert count_reset == 50
    assert conn.execute("SELECT COUNT(*) FROM employees").fetchone()[0] == 50
    assert conn.execute("SELECT COUNT(*) FROM salary_history").fetchone()[0] == 50

    conn.close()
