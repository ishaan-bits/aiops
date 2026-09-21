import json
import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes.upload import router as upload_router
from .routes.sql import router as sql_router
from .routes.rag import router as rag_router
from .routes.reports import router as reports_router

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)

if os.getenv("OLLAMA_URL") and not os.getenv("OLLAMA_HOST"):
    os.environ["OLLAMA_HOST"] = os.getenv("OLLAMA_URL", "http://localhost:11434")

app = FastAPI(title="AIOps API", version="0.1.0")

origins = json.loads(os.getenv("CORS_ORIGINS", '["http://localhost:3000"]'))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)
app.include_router(sql_router)
app.include_router(rag_router)
app.include_router(reports_router)


@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}
