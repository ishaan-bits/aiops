from pydantic import BaseModel


class UploadResponse(BaseModel):
    id: int
    filename: str
    storage_path: str
    file_size: int
    status: str


class DocumentItem(BaseModel):
    id: int
    filename: str
    storage_path: str
    file_size: int
    chunk_count: int = 0
    status: str
    created_at: str


class HealthResponse(BaseModel):
    status: str
    version: str
