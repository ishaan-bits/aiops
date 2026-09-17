from pydantic import BaseModel


class SQLGenerateRequest(BaseModel):
    question: str


class SQLGenerateResponse(BaseModel):
    sql: str
    explanation: str


class SQLExecuteRequest(BaseModel):
    sql: str


class SQLExecuteResponse(BaseModel):
    columns: list[str]
    rows: list[dict]
    row_count: int
