from typing import Any, List, Optional
from pydantic import BaseModel, Field, model_validator
from app.core.errors import ValidationError
from app.schemas.common import dollars_to_cents, normalize_email


class EmployeeCreateRequest(BaseModel):
    full_name: str
    email: str
    department: str
    job_title: str
    country: str
    initial_salary: str
    effective_date: Optional[str] = None  # Optional initial date; defaults to today

    @model_validator(mode="before")
    @classmethod
    def validate_fields(cls, data: Any):
        if not isinstance(data, dict):
            return data

        for field in ["full_name", "department", "job_title", "country"]:
            val = data.get(field)
            if not val or not str(val).strip():
                raise ValidationError(f"{field.replace('_', ' ').title()} cannot be empty.")
            data[field] = str(val).strip()

        data["email"] = normalize_email(data.get("email", ""))
        # Validate salary conversion
        dollars_to_cents(data.get("initial_salary", ""))
        return data


class EmployeeUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    department: Optional[str] = None
    job_title: Optional[str] = None
    country: Optional[str] = None
    current_salary: Optional[Any] = None
    initial_salary: Optional[Any] = None
    salary: Optional[Any] = None

    @model_validator(mode="before")
    @classmethod
    def validate_update(cls, data: Any):
        if not isinstance(data, dict):
            return data

        # Check for forbidden salary fields
        for forbidden in ["current_salary", "initial_salary", "salary"]:
            if forbidden in data and data[forbidden] is not None:
                raise ValidationError(
                    "Salary cannot be updated via this endpoint. Use the dedicated /salary-updates endpoint."
                )

        for field in ["full_name", "department", "job_title", "country"]:
            if field in data and data[field] is not None:
                val = str(data[field]).strip()
                if not val:
                    raise ValidationError(f"{field.replace('_', ' ').title()} cannot be empty.")
                data[field] = val

        if "email" in data and data["email"] is not None:
            data["email"] = normalize_email(data["email"])

        return data


class EmployeeResponse(BaseModel):
    id: int
    employee_code: str
    full_name: str
    email: str
    department: str
    job_title: str
    country: str
    current_salary: str
    currency: str = "USD"
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class EmployeeListResponse(BaseModel):
    items: List[EmployeeResponse]
    page: int
    page_size: int
    total_items: int
    total_pages: int
