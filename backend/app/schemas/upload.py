from pydantic import BaseModel


class UploadResponse(BaseModel):
    filename: str
    size: int
    status: str


class HealthResponse(BaseModel):
    status: str
    version: str
