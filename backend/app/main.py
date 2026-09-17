import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes.upload import router as upload_router
from .routes.sql import router as sql_router
from .routes.rag import router as rag_router
from .routes.reports import router as reports_router
from .schemas.upload import HealthResponse

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

app = FastAPI(title="AIOps API", version="0.1.0")

origins = os.getenv("CORS_ORIGINS", '["http://localhost:3000"]')
import json

app.add_middleware(
    CORSMiddleware,
    allow_origins=json.loads(origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)
app.include_router(sql_router)
app.include_router(rag_router)
app.include_router(reports_router)


@app.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse(status="ok", version="0.1.0")
