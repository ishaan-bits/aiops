from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..schemas.rag import RAGAskRequest, RAGAskResponse, RAGIndexResponse, RAGSource
from ..services.rag import generate_answer, index_document

router = APIRouter(prefix="/rag", tags=["rag"])


@router.post("/index/{document_id}", response_model=RAGIndexResponse)
async def index_uploaded_document(document_id: int):
    try:
        result = index_document(document_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Indexing failed: {str(e)}")
    return RAGIndexResponse(**result)


@router.post("/ask", response_model=RAGAskResponse)
async def ask_question(request: RAGAskRequest):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    try:
        result = generate_answer(request.question)
    except ConnectionError:
        raise HTTPException(
            status_code=503,
            detail="Ollama is not running. Start it with `ollama serve`.",
        )
    except Exception as e:
        msg = str(e)
        if "not found" in msg.lower() or "does not exist" in msg.lower():
            raise HTTPException(
                status_code=503,
                detail="Model not found. Pull it with: ollama pull phi3:mini",
            )
        raise HTTPException(status_code=500, detail=f"Query failed: {msg}")
    return RAGAskResponse(
        answer=result["answer"],
        sources=[RAGSource(**s) for s in result["sources"]],
    )
