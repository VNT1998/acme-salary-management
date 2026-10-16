import pytest
import sqlite3
from app.core.errors import ConflictError, ValidationError
from app.core.security import hash_password, verify_password
from app.db.connection import create_connection, transaction
from app.db.migrations import init_db
from app.repositories.employee_repo import create_employee_with_initial_salary
from app.schemas.common import cents_to_dollars, dollars_to_cents, normalize_email, validate_iso_date


def test_money_conversion():
    # Valid conversions
    assert dollars_to_cents("120000.00") == 12000000
    assert dollars_to_cents("0") == 0
    assert dollars_to_cents("0.00") == 0
    assert dollars_to_cents("45.50") == 4550
    assert dollars_to_cents("100.5") == 10050
    assert dollars_to_cents(500) == 50000

    assert cents_to_dollars(12000000) == "120000.00"
    assert cents_to_dollars(0) == "0.00"
    assert cents_to_dollars(4550) == "45.50"

    # Invalid conversions
    with pytest.raises(ValidationError):
        dollars_to_cents("-10.00")

    with pytest.raises(ValidationError):
        dollars_to_cents("10.999")  # >2 decimal places

    with pytest.raises(ValidationError):
        dollars_to_cents("invalid")

    with pytest.raises(ValidationError):
        dollars_to_cents("")


def test_email_normalization():
    assert normalize_email("  HR@Example.Com  ") == "hr@example.com"
    with pytest.raises(ValidationError):
        normalize_email("not-an-email")
    with pytest.raises(ValidationError):
        normalize_email("")


def test_date_validation():
    assert validate_iso_date("2026-10-17") == "2026-10-17"
    with pytest.raises(ValidationError):
        validate_iso_date("17-10-2026")
    with pytest.raises(ValidationError):
        validate_iso_date("invalid-date")


def test_password_hashing():
    pw = "SecretPass123!"
    hashed = hash_password(pw)
    assert hashed != pw
    assert verify_password(pw, hashed) is True
    assert verify_password("WrongPass", hashed) is False


def test_db_constraints_in_memory():
    conn = create_connection(":memory:")
    init_db(conn)

    # 1. Successful creation
    with transaction(conn):
        emp = create_employee_with_initial_salary(
            conn=conn,
            full_name="Alice Smith",
            email="alice@example.com",
            department="Engineering",
            job_title="Software Engineer",
            country="United States",
            initial_salary_cents=12000000,
            effective_date="2026-01-01"
        )
        assert emp["id"] is not None
        assert emp["current_salary"] == "120000.00"

    # 2. Duplicate email rejected
    with pytest.raises(ConflictError):
        with transaction(conn):
            create_employee_with_initial_salary(
                conn=conn,
                full_name="Alice Duplicate",
                email="alice@example.com",
                department="HR",
                job_title="Recruiter",
                country="United States",
                initial_salary_cents=9000000,
                effective_date="2026-01-01"
            )

    # 3. Foreign key enforcement on salary_history
    with pytest.raises(sqlite3.IntegrityError):
        with transaction(conn):
            conn.execute(
                """
                INSERT INTO salary_history (employee_id, previous_salary_cents, new_salary_cents, effective_date, recorded_at)
                VALUES (999999, NULL, 50000, '2026-01-01', '2026-01-01T00:00:00Z')
                """
            )

    # 4. Check constraint on negative salary
    with pytest.raises(sqlite3.IntegrityError):
        with transaction(conn):
            conn.execute(
                """
                INSERT INTO employees (
                    employee_code, full_name, email, department, job_title,
                    country, current_salary_cents, created_at, updated_at
                )
                VALUES ('EMP-999', 'Bad Salary', 'bad@example.com', 'Eng', 'Dev', 'US', -500, '2026', '2026')
                """
            )

    conn.close()
