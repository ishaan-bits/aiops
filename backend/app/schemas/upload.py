from pydantic import BaseModel


class UploadResponse(BaseModel):
    filename: str
    size: int
    status: str
    document_id: int = 0


class HealthResponse(BaseModel):
    status: str
    version: str
