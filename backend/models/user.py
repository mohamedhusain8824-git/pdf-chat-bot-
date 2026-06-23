"""
NeuralLens AI — User Models and Security Helpers.

Defines:
  • Pydantic validation schemas for authentication requests.
  • Secure password hashing and verification using hashlib's PBKDF2.
"""

import hashlib
import os
import re
from pydantic import BaseModel, EmailStr, Field, field_validator

# ── Password Hashing Helpers ─────────────────────────────────────────

def hash_password(password: str) -> str:
    """Hash a password using secure PBKDF2-HMAC-SHA256 with a random salt."""
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        100000  # Number of iterations
    )
    # Store salt and key combined as hex
    return f"{salt.hex()}:{key.hex()}"


def verify_password(stored_password: str, provided_password: str) -> bool:
    """Verify a password against its stored PBKDF2 hash."""
    try:
        salt_hex, key_hex = stored_password.split(":")
        salt = bytes.fromhex(salt_hex)
        key = bytes.fromhex(key_hex)
        
        new_key = hashlib.pbkdf2_hmac(
            "sha256",
            provided_password.encode("utf-8"),
            salt,
            100000
        )
        return key == new_key
    except Exception:
        return False


# ── Pydantic Request/Response Schemas ────────────────────────────────

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=50, description="User's full name")
    email: EmailStr = Field(..., description="User's work email address")
    password: str = Field(..., min_length=6, description="User's password")

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        # Strip trailing/leading spaces and verify it only contains letters, spaces, or hyphens
        value = value.strip()
        if not re.match(r"^[a-zA-Z\s\-]+$", value):
            raise ValueError("Name can only contain letters, spaces, and hyphens")
        return value


class UserLogin(BaseModel):
    email: EmailStr = Field(..., description="User's login email")
    password: str = Field(..., description="User's login password")
