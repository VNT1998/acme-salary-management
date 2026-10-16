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


def test_employee_crud_and_filters(auth_client):
    client, conn, csrf_token = auth_client
    headers = {"X-CSRF-Token": csrf_token}

    # 1. Unauthenticated request rejected
    anon_client = TestClient(app)
    unauth_resp = anon_client.get("/api/v1/employees")
    assert unauth_resp.status_code == 401

    # 2. Create employee
    create_payload = {
        "full_name": "Jane Doe",
        "email": "jane.doe@example.com",
        "department": "Engineering",
        "job_title": "Staff Engineer",
        "country": "United States",
        "initial_salary": "150000.00",
        "effective_date": "2026-01-15"
    }
    resp = client.post("/api/v1/employees", json=create_payload, headers=headers)
    assert resp.status_code == 201
    created = resp.json()
    emp_id = created["id"]
    assert created["employee_code"].startswith("EMP-")
    assert created["current_salary"] == "150000.00"
    assert created["currency"] == "USD"

    # Verify initial salary history row exists in database
    hist = conn.execute("SELECT * FROM salary_history WHERE employee_id = ?", (emp_id,)).fetchall()
    assert len(hist) == 1
    assert hist[0]["previous_salary_cents"] is None
    assert hist[0]["new_salary_cents"] == 15000000
    assert hist[0]["effective_date"] == "2026-01-15"

    # 3. Duplicate email rejected
    dup_resp = client.post("/api/v1/employees", json=create_payload, headers=headers)
    assert dup_resp.status_code == 409
    assert dup_resp.json()["error"]["code"] == "CONFLICT"

    # 4. Get employee by ID
    get_resp = client.get(f"/api/v1/employees/{emp_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["full_name"] == "Jane Doe"

    # 5. Non-existent employee returns 404
    not_found_resp = client.get("/api/v1/employees/99999")
    assert not_found_resp.status_code == 404

    # 6. Create another employee for filter testing
    client.post(
        "/api/v1/employees",
        json={
            "full_name": "Bob Smith",
            "email": "bob.smith@example.com",
            "department": "Sales",
            "job_title": "Account Executive",
            "country": "Canada",
            "initial_salary": "85000.00"
        },
        headers=headers
    )

    # 7. List employees and pagination
    list_resp = client.get("/api/v1/employees?page=1&page_size=10")
    assert list_resp.status_code == 200
    data = list_resp.json()
    assert data["total_items"] == 2
    assert len(data["items"]) == 2

    # 8. Filter by department
    dept_resp = client.get("/api/v1/employees?department=Engineering")
    assert dept_resp.status_code == 200
    assert dept_resp.json()["total_items"] == 1
    assert dept_resp.json()["items"][0]["full_name"] == "Jane Doe"

    # 9. Search by name
    search_resp = client.get("/api/v1/employees?search=Bob")
    assert search_resp.status_code == 200
    assert search_resp.json()["total_items"] == 1
    assert search_resp.json()["items"][0]["full_name"] == "Bob Smith"

    # 10. Filter by salary range
    salary_filt_resp = client.get("/api/v1/employees?min_salary=100000.00")
    assert salary_filt_resp.status_code == 200
    assert salary_filt_resp.json()["total_items"] == 1
    assert salary_filt_resp.json()["items"][0]["full_name"] == "Jane Doe"

    # 11. Invalid salary range rejected
    bad_range = client.get("/api/v1/employees?min_salary=200000&max_salary=100000")
    assert bad_range.status_code == 400

    # 12. Update non-salary fields
    patch_resp = client.patch(
        f"/api/v1/employees/{emp_id}",
        json={"job_title": "Principal Engineer"},
        headers=headers
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["job_title"] == "Principal Engineer"

    # 13. Attempting to update salary via PATCH is rejected
    patch_salary_resp = client.patch(
        f"/api/v1/employees/{emp_id}",
        json={"current_salary": "160000.00"},
        headers=headers
    )
    assert patch_salary_resp.status_code == 400
    assert "Salary cannot be updated via this endpoint" in patch_salary_resp.json()["error"]["message"]
