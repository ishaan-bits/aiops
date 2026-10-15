from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
import jwt
from fastapi import Cookie, HTTPException

from . import database

ALGORITHM = "HS256"
SESSION_COOKIE = "session"
TOKEN_TTL_HOURS = 24

DEMO_USERS = (
    ("admin@aiops.com", "admin"),
    ("ops@aiops.com", "operator"),
    ("viewer@aiops.com", "viewer"),
)


def _jwt_secret() -> str:
    return os.getenv("JWT_SECRET", "dev-secret-change-me")


def _cookie_secure() -> bool:
    return os.getenv("COOKIE_SECURE", "false").strip().lower() in ("1", "true", "yes")


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=10)).decode()


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode(), password_hash.encode())
    except ValueError:
        return False


def create_token(user_id: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=TOKEN_TTL_HOURS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, _jwt_secret(), algorithm=ALGORITHM)


def seed_users() -> None:
    """Idempotently seed the demo accounts (shared password from env or default)."""
    password = os.getenv("DEMO_PASSWORD", "AiOps123")
    for user_id, role in DEMO_USERS:
        existing = database.get_user(user_id)
        if existing and existing["role"] == role and verify_password(password, existing["password_hash"]):
            continue
        database.upsert_user(user_id, hash_password(password), role)


def set_session_cookie(response, token: str) -> None:
    response.set_cookie(
        key=SESSION_COOKIE,
        value=token,
        max_age=60 * 60 * TOKEN_TTL_HOURS,
        httponly=True,
        samesite="lax",
        secure=_cookie_secure(),
        path="/",
    )


def clear_session_cookie(response) -> None:
    response.delete_cookie(key=SESSION_COOKIE, path="/")


async def require_user(session: Optional[str] = Cookie(default=None)) -> dict:
    """FastAPI dependency: resolve the current user from the session cookie."""
    if not session:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(session, _jwt_secret(), algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid session")
    return {"user_id": payload.get("sub", ""), "role": payload.get("role", "")}
