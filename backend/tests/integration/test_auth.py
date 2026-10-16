import pytest
from fastapi.testclient import TestClient
from app.core.security import hash_password
from app.db.connection import create_connection
from app.db.migrations import init_db
from app.main import app
from app.api.dependencies import get_db
from app.repositories import hr_user_repo


@pytest.fixture
def test_client_and_db():
    conn = create_connection(":memory:")
    init_db(conn)

    # Seed an HR user
    hashed = hash_password("ValidPassword123!")
    hr_user_repo.create_hr_user(conn, "hr@example.com", hashed)

    # Override get_db dependency
    def override_get_db():
        yield conn

    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)

    yield client, conn

    app.dependency_overrides.clear()
    conn.close()


def test_auth_flows(test_client_and_db):
    client, _ = test_client_and_db

    # 1. Accessing /auth/me unauthenticated fails with 401
    me_resp = client.get("/api/v1/auth/me")
    assert me_resp.status_code == 401
    assert me_resp.json()["error"]["code"] == "UNAUTHORIZED"

    # 2. Login with bad password fails with 401
    bad_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "hr@example.com", "password": "WrongPassword"}
    )
    assert bad_resp.status_code == 401
    assert bad_resp.json()["error"]["code"] == "UNAUTHORIZED"

    # 3. Login with bad email fails with 401
    notfound_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "unknown@example.com", "password": "ValidPassword123!"}
    )
    assert notfound_resp.status_code == 401

    # 4. Successful login
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "hr@example.com", "password": "ValidPassword123!"}
    )
    assert login_resp.status_code == 200
    login_data = login_resp.json()
    assert login_data["user"]["email"] == "hr@example.com"
    assert "csrf_token" in login_data
    assert "acme_session" in login_resp.cookies
    csrf_token = login_data["csrf_token"]

    # 5. Accessing /auth/me with session cookie succeeds
    me_resp = client.get("/api/v1/auth/me")
    assert me_resp.status_code == 200
    assert me_resp.json()["user"]["email"] == "hr@example.com"

    # 6. Logout without CSRF token fails with 403 Forbidden
    logout_bad_csrf = client.post("/api/v1/auth/logout")
    assert logout_bad_csrf.status_code == 403
    assert logout_bad_csrf.json()["error"]["code"] == "FORBIDDEN"

    # 7. Logout with valid CSRF token succeeds
    logout_resp = client.post("/api/v1/auth/logout", headers={"X-CSRF-Token": csrf_token})
    assert logout_resp.status_code == 204

    # 8. Accessing /auth/me after logout fails
    me_after_logout = client.get("/api/v1/auth/me")
    assert me_after_logout.status_code == 401
