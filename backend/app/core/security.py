import hashlib
import hmac
import secrets
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, InvalidHashError

# Argon2 password hasher with sensible defaults
_hasher = PasswordHasher(
    time_cost=2,
    memory_cost=65536,
    parallelism=2,
    hash_len=32,
    salt_len=16
)


def hash_password(password: str) -> str:
    """Hash a password using Argon2id."""
    return _hasher.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    """Verify a plain password against an Argon2 hash."""
    try:
        return _hasher.verify(hashed_password, password)
    except (VerifyMismatchError, InvalidHashError):
        return False


def generate_session_token() -> str:
    """Generate a high-entropy cryptographically secure random session token."""
    return secrets.token_urlsafe(32)


def hash_session_token(token: str) -> str:
    """Compute SHA-256 hash of a session token for secure database lookup."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def generate_csrf_token() -> str:
    """Generate a cryptographically secure random CSRF token."""
    return secrets.token_urlsafe(32)


def hash_csrf_token(token: str) -> str:
    """Compute SHA-256 hash of a CSRF token."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def verify_csrf_token(token: str, expected_hash: str) -> bool:
    """Constant-time verification of CSRF token against stored hash."""
    actual_hash = hash_csrf_token(token)
    return hmac.compare_digest(actual_hash, expected_hash)
