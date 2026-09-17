from pydantic import BaseModel


class RAGIndexResponse(BaseModel):
    document_id: int
    filename: str
    chunks_indexed: int


class RAGSource(BaseModel):
    document: str
    page: int
    score: float


class RAGAskRequest(BaseModel):
    question: str


class RAGAskResponse(BaseModel):
    answer: str
    sources: list[RAGSource]
