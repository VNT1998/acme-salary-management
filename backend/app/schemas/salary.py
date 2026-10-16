from typing import Any, List, Optional
from pydantic import BaseModel, model_validator
from app.schemas.common import dollars_to_cents, validate_iso_date


class SalaryUpdateRequest(BaseModel):
    new_salary: str
    effective_date: str

    @model_validator(mode="before")
    @classmethod
    def validate_request(cls, data: Any):
        if not isinstance(data, dict):
            return data

        dollars_to_cents(data.get("new_salary", ""))
        data["effective_date"] = validate_iso_date(data.get("effective_date", ""))
        return data


class SalaryUpdateResponse(BaseModel):
    employee_id: int
    previous_salary: str
    current_salary: str
    currency: str = "USD"
    effective_date: str
    recorded_at: str


class SalaryHistoryItemResponse(BaseModel):
    id: int
    employee_id: int
    previous_salary: Optional[str] = None
    new_salary: str
    effective_date: str
    recorded_at: str
