import pytest
from fastapi.testclient import TestClient
from app.core.security import hash_password
from app.db.connection import create_connection
from app.db.migrations import init_db
from app.main import app
from app.api.dependencies import get_db
from app.repositories import hr_user_repo


@pytest.fixture
def auth_client():
    conn = create_connection(":memory:")
    init_db(conn)

    # Seed HR user
    hashed = hash_password("ValidPassword123!")
    hr_user_repo.create_hr_user(conn, "hr@example.com", hashed)

    def override_get_db():
        yield conn

    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)

    # Log in
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "hr@example.com", "password": "ValidPassword123!"}
    )
    csrf_token = login_resp.json()["csrf_token"]

    yield client, conn, csrf_token

    app.dependency_overrides.clear()
    conn.close()


def test_salary_analytics_known_dataset(auth_client):
    client, conn, csrf_token = auth_client
    headers = {"X-CSRF-Token": csrf_token}

    # 1. Unauthenticated request rejected
    anon_client = TestClient(app)
    unauth = anon_client.get("/api/v1/analytics/salaries")
    assert unauth.status_code == 401

    # 2. Seed 4 Engineering employees (even count)
    eng_salaries = ["100000.00", "110000.00", "120000.00", "150000.00"]
    for i, sal in enumerate(eng_salaries):
        client.post(
            "/api/v1/employees",
            json={
                "full_name": f"Eng Employee {i}",
                "email": f"eng{i}@example.com",
                "department": "Engineering",
                "job_title": "Software Engineer",
                "country": "United States",
                "initial_salary": sal
            },
            headers=headers
        )

    # 3. Seed 3 Sales employees (odd count)
    sales_salaries = ["70000.00", "80000.00", "90000.00"]
    for i, sal in enumerate(sales_salaries):
        client.post(
            "/api/v1/employees",
            json={
                "full_name": f"Sales Employee {i}",
                "email": f"sales{i}@example.com",
                "department": "Sales",
                "job_title": "Account Executive",
                "country": "Canada",
                "initial_salary": sal
            },
            headers=headers
        )

    # 4. Overall analytics
    overall_resp = client.get("/api/v1/analytics/salaries")
    assert overall_resp.status_code == 200
    overall = overall_resp.json()
    assert overall["currency"] == "USD"
    assert overall["employee_count"] == 7
    # Mean: 720,000 / 7 = 102857.14
    assert overall["average_salary"] == "102857.14"
    # Median: 4th value out of 7 sorted (70k, 80k, 90k, 100k, 110k, 120k, 150k) = 100,000.00
    assert overall["median_salary"] == "100000.00"
    assert overall["minimum_salary"] == "70000.00"
    assert overall["maximum_salary"] == "150000.00"
    assert len(overall["department_breakdown"]) == 2

    # Verify Engineering breakdown
    eng_breakdown = next(d for d in overall["department_breakdown"] if d["department"] == "Engineering")
    assert eng_breakdown["employee_count"] == 4
    # Mean: 480k / 4 = 120k
    assert eng_breakdown["average_salary"] == "120000.00"
    # Even median: (110k + 120k) / 2 = 115k
    assert eng_breakdown["median_salary"] == "115000.00"
    assert eng_breakdown["minimum_salary"] == "100000.00"
    assert eng_breakdown["maximum_salary"] == "150000.00"

    # Verify Sales breakdown
    sales_breakdown = next(d for d in overall["department_breakdown"] if d["department"] == "Sales")
    assert sales_breakdown["employee_count"] == 3
    assert sales_breakdown["average_salary"] == "80000.00"
    assert sales_breakdown["median_salary"] == "80000.00"
    assert sales_breakdown["minimum_salary"] == "70000.00"
    assert sales_breakdown["maximum_salary"] == "90000.00"

    # 5. Filter by department=Engineering
    filt_dept_resp = client.get("/api/v1/analytics/salaries?department=Engineering")
    assert filt_dept_resp.status_code == 200
    filt_dept = filt_dept_resp.json()
    assert filt_dept["employee_count"] == 4
    assert filt_dept["average_salary"] == "120000.00"
    assert len(filt_dept["department_breakdown"]) == 1

    # 6. Filter by min_salary=110000.00
    filt_sal_resp = client.get("/api/v1/analytics/salaries?min_salary=110000.00")
    assert filt_sal_resp.status_code == 200
    filt_sal = filt_sal_resp.json()
    # 110k, 120k, 150k (3 employees)
    assert filt_sal["employee_count"] == 3
    assert filt_sal["median_salary"] == "120000.00"
    assert filt_sal["minimum_salary"] == "110000.00"

    # 7. Empty filtered result behavior
    empty_resp = client.get("/api/v1/analytics/salaries?department=NonExistent")
    assert empty_resp.status_code == 200
    empty_data = empty_resp.json()
    assert empty_data["employee_count"] == 0
    assert empty_data["average_salary"] is None
    assert empty_data["median_salary"] is None
    assert empty_data["minimum_salary"] is None
    assert empty_data["maximum_salary"] is None
    assert empty_data["department_breakdown"] == []
