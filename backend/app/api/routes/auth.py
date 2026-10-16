import sqlite3
from typing import Any, Dict
from fastapi import APIRouter, Depends, Response, status
from app.api.dependencies import get_current_user, get_db
from app.core.config import get_settings
from app.schemas.auth import LoginRequest, LoginResponse, UserResponse
from app.services.auth_service import authenticate_hr_user, logout_session

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=LoginResponse)
def login(
    payload: LoginRequest,
    response: Response,
    conn: sqlite3.Connection = Depends(get_db)
):
    user, session_token, csrf_token = authenticate_hr_user(conn, payload.email, payload.password)
    settings = get_settings()

    max_age_seconds = settings.SESSION_EXPIRE_HOURS * 3600
    response.set_cookie(
        key=settings.SESSION_COOKIE_NAME,
        value=session_token,
        max_age=max_age_seconds,
        httponly=True,
        secure=settings.SESSION_COOKIE_SECURE,
        samesite=settings.SESSION_COOKIE_SAMESITE,
        path="/"
    )

    return LoginResponse(
        user=UserResponse(id=user["id"], email=user["email"]),
        csrf_token=csrf_token
    )


@router.get("/me", response_model=Dict[str, UserResponse])
def get_current_hr_user_info(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    return {
        "user": UserResponse(id=current_user["id"], email=current_user["email"])
    }


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    response: Response,
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: sqlite3.Connection = Depends(get_db)
):
    logout_session(conn, current_user["session_token"])
    settings = get_settings()
    response.delete_cookie(key=settings.SESSION_COOKIE_NAME, path="/")
    return None
