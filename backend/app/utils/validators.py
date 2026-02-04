"""Input validation utilities."""

import re
from typing import Tuple


def validate_email(email: str) -> Tuple[bool, str]:
    """Validate email format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not email:
        return False, "Email is required"
    if not re.match(pattern, email):
        return False, "Invalid email format"
    if len(email) > 254:
        return False, "Email too long"
    return True, ""


def validate_master_password(password: str) -> Tuple[bool, str]:
    """Validate master password requirements."""
    if not password:
        return False, "Password is required"
    if len(password) < 12:
        return False, "Password must be at least 12 characters"
    if len(password) > 128:
        return False, "Password too long"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain uppercase letter"
    if not re.search(r'[a-z]', password):
        return False, "Password must contain lowercase letter"
    if not re.search(r'\d', password):
        return False, "Password must contain a number"
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "Password must contain a special character"
    return True, ""


def validate_username(username: str) -> Tuple[bool, str]:
    """Validate username format."""
    if not username:
        return False, "Username is required"
    if len(username) < 3:
        return False, "Username must be at least 3 characters"
    if len(username) > 50:
        return False, "Username too long"
    if not re.match(r'^[a-zA-Z0-9_-]+$', username):
        return False, "Username can only contain letters, numbers, underscores, and hyphens"
    return True, ""


def validate_url(url: str) -> Tuple[bool, str]:
    """Validate URL format."""
    if not url:
        return True, ""  # URL is optional
    pattern = r'^https?://[^\s<>"{}|\\^`\[\]]+$'
    if not re.match(pattern, url):
        return False, "Invalid URL format"
    if len(url) > 2048:
        return False, "URL too long"
    return True, ""


def sanitize_input(text: str) -> str:
    """Sanitize user input to prevent injection attacks."""
    if not text:
        return ""
    # Remove null bytes and control characters
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)
    return text.strip()
