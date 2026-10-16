from typing import Any, Dict, Optional
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


class AppException(Exception):
    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(message)


class ValidationError(AppException):
    def __init__(self, message: str = "The request contains invalid fields.", details: Optional[Dict[str, Any]] = None):
        super().__init__(code="VALIDATION_ERROR", message=message, status_code=status.HTTP_400_BAD_REQUEST, details=details)


class UnauthorizedError(AppException):
    def __init__(self, message: str = "Authentication required."):
        super().__init__(code="UNAUTHORIZED", message=message, status_code=status.HTTP_401_UNAUTHORIZED)


class ForbiddenError(AppException):
    def __init__(self, message: str = "Access denied."):
        super().__init__(code="FORBIDDEN", message=message, status_code=status.HTTP_403_FORBIDDEN)


class NotFoundError(AppException):
    def __init__(self, message: str = "Resource not found."):
        super().__init__(code="NOT_FOUND", message=message, status_code=status.HTTP_404_NOT_FOUND)


class ConflictError(AppException):
    def __init__(self, message: str = "Resource conflict occurred.", details: Optional[Dict[str, Any]] = None):
        super().__init__(code="CONFLICT", message=message, status_code=status.HTTP_409_CONFLICT, details=details)


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        content = {
            "error": {
                "code": exc.code,
                "message": exc.message,
            }
        }
        if exc.details:
            content["error"]["details"] = exc.details
        return JSONResponse(status_code=exc.status_code, content=content)

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        details: Dict[str, str] = {}
        for err in exc.errors():
            loc = err.get("loc", [])
            field_name = str(loc[-1]) if loc else "field"
            details[field_name] = err.get("msg", "Invalid value")

        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "The request contains invalid fields.",
                    "details": details,
                }
            },
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        # Prevent leaking stack traces or internal exception details
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "An unexpected error occurred. Please try again later.",
                }
            },
        )
