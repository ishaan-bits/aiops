from pydantic import BaseModel


class LoginRequest(BaseModel):
    user_id: str
    password: str


class UserOut(BaseModel):
    user_id: str
    role: str
