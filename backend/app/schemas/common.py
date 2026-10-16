import re
from datetime import date
from decimal import Decimal, InvalidOperation
from typing import Any
from app.core.errors import ValidationError


def dollars_to_cents(amount_input: str | int | float | Decimal) -> int:
    """Convert a dollar amount string, int, or Decimal into exact integer cents.
    
    Rejects negative values, values with more than two decimal places, or non-finite inputs.
    """
    if amount_input is None:
        raise ValidationError("Salary amount is required.")

    # Convert to string for exact Decimal parsing
    str_val = str(amount_input).strip()
    if not str_val:
        raise ValidationError("Salary amount cannot be empty.")

    try:
        dec = Decimal(str_val)
    except InvalidOperation:
        raise ValidationError("Salary must be a valid numeric amount.")

    if not dec.is_finite():
        raise ValidationError("Salary must be a finite number.")

    if dec < Decimal("0"):
        raise ValidationError("Salary cannot be negative.")

    # Check decimal places: quantize or verify exponent
    # Tuple format: sign, digits, exponent. If exponent < -2, more than 2 decimal places.
    if dec.as_tuple().exponent < -2:
        raise ValidationError("Salary cannot have more than two decimal places.")

    cents = int((dec * Decimal("100")).to_integral_value())
    return cents


def cents_to_dollars(cents: int) -> str:
    """Convert integer cents into a formatted two-decimal USD string like '120000.00'."""
    if cents is None:
        return "0.00"
    dec = Decimal(cents) / Decimal("100")
    return f"{dec:.2f}"


def normalize_email(email: str) -> str:
    """Normalize and validate email format."""
    if not email or not isinstance(email, str):
        raise ValidationError("A valid email address is required.")
    normalized = email.strip().lower()
    email_regex = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    if not re.match(email_regex, normalized):
        raise ValidationError("A valid email address is required.")
    return normalized


def validate_iso_date(date_str: str) -> str:
    """Validate ISO YYYY-MM-DD date string."""
    if not date_str or not isinstance(date_str, str):
        raise ValidationError("Effective date is required.")
    try:
        parsed = date.fromisoformat(date_str.strip())
        return parsed.isoformat()
    except ValueError:
        raise ValidationError("Effective date must be a valid date in YYYY-MM-DD format.")
