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


class DocumentItem(BaseModel):
    id: int
    filename: str
    storage_path: str
    file_size: int
    status: str
    created_at: str


class HealthResponse(BaseModel):
    status: str
    version: str
