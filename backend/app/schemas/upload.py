from pydantic import BaseModel


class UploadRequest(BaseModel):
    filename: str
    storage_path: str
    size: int


class UploadResponse(BaseModel):
    filename: str
    size: int
    status: str
    document_id: int = 0


class HealthResponse(BaseModel):
    status: str
    version: str
