from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Response

from ..schemas.auth import LoginRequest, UserOut
from ..services import database
from ..services.auth import (
    clear_session_cookie,
    create_token,
    require_user,
    set_session_cookie,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=UserOut)
def login(request: LoginRequest, response: Response):
    user_id = request.user_id.strip().lower()
    user = database.get_user(user_id)
    if not user or not verify_password(request.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid user ID or password")

    token = create_token(user["user_id"], user["role"])
    set_session_cookie(response, token)
    return UserOut(user_id=user["user_id"], role=user["role"])


@router.post("/logout")
def logout(response: Response):
    clear_session_cookie(response)
    return {"detail": "Logged out"}


@router.get("/me", response_model=UserOut)
async def me(user: dict = Depends(require_user)):
    return UserOut(**user)
