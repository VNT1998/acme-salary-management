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


def test_salary_update_and_history(auth_client):
    client, conn, csrf_token = auth_client
    headers = {"X-CSRF-Token": csrf_token}

    # 1. Create an employee
    create_resp = client.post(
        "/api/v1/employees",
        json={
            "full_name": "Alice Johnson",
            "email": "alice.j@example.com",
            "department": "Engineering",
            "job_title": "Backend Developer",
            "country": "United States",
            "initial_salary": "100000.00",
            "effective_date": "2024-01-01"
        },
        headers=headers
    )
    assert create_resp.status_code == 201
    emp_id = create_resp.json()["id"]

    # 2. Retrieve initial history
    hist1_resp = client.get(f"/api/v1/employees/{emp_id}/salary-history")
    assert hist1_resp.status_code == 200
    hist1 = hist1_resp.json()
    assert len(hist1) == 1
    assert hist1[0]["previous_salary"] is None
    assert hist1[0]["new_salary"] == "100000.00"
    assert hist1[0]["effective_date"] == "2024-01-01"

    # 3. Update salary to 115000.00
    update_resp = client.post(
        f"/api/v1/employees/{emp_id}/salary-updates",
        json={
            "new_salary": "115000.00",
            "effective_date": "2025-01-01"
        },
        headers=headers
    )
    assert update_resp.status_code == 200
    res_data = update_resp.json()
    assert res_data["previous_salary"] == "100000.00"
    assert res_data["current_salary"] == "115000.00"
    assert res_data["effective_date"] == "2025-01-01"

    # 4. Update salary again to 130000.00
    client.post(
        f"/api/v1/employees/{emp_id}/salary-updates",
        json={
            "new_salary": "130000.00",
            "effective_date": "2026-01-01"
        },
        headers=headers
    )

    # 5. Verify employee record shows latest salary
    emp_resp = client.get(f"/api/v1/employees/{emp_id}")
    assert emp_resp.json()["current_salary"] == "130000.00"

    # 6. Verify chronological salary history (descending by effective date)
    hist2_resp = client.get(f"/api/v1/employees/{emp_id}/salary-history")
    assert hist2_resp.status_code == 200
    history = hist2_resp.json()
    assert len(history) == 3
    # Most recent first
    assert history[0]["new_salary"] == "130000.00"
    assert history[0]["previous_salary"] == "115000.00"
    assert history[0]["effective_date"] == "2026-01-01"

    assert history[1]["new_salary"] == "115000.00"
    assert history[1]["previous_salary"] == "100000.00"

    assert history[2]["new_salary"] == "100000.00"
    assert history[2]["previous_salary"] is None


def test_salary_update_failures_and_rollback(auth_client):
    client, conn, csrf_token = auth_client
    headers = {"X-CSRF-Token": csrf_token}

    # 1. 404 on missing employee
    resp_404 = client.post(
        "/api/v1/employees/99999/salary-updates",
        json={"new_salary": "120000.00", "effective_date": "2026-01-01"},
        headers=headers
    )
    assert resp_404.status_code == 404

    # 2. 400 on negative salary
    resp_neg = client.post(
        "/api/v1/employees/1/salary-updates",
        json={"new_salary": "-500.00", "effective_date": "2026-01-01"},
        headers=headers
    )
    assert resp_neg.status_code == 400

    # 3. 400 on invalid date
    resp_bad_date = client.post(
        "/api/v1/employees/1/salary-updates",
        json={"new_salary": "90000.00", "effective_date": "invalid-date"},
        headers=headers
    )
    assert resp_bad_date.status_code == 400
