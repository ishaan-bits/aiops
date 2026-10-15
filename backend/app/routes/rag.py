from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from ..schemas.rag import RAGAskRequest, RAGAskResponse, RAGIndexResponse, RAGSource
from ..services.auth import require_user
from ..services.rag import generate_answer, index_document

router = APIRouter(prefix="/rag", tags=["rag"])


@router.post("/index/{document_id}", response_model=RAGIndexResponse)
def index_uploaded_document(document_id: int, _user: dict = Depends(require_user)):
    try:
        result = index_document(document_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Indexing failed: {str(e)}")
    return RAGIndexResponse(**result)


@router.post("/ask", response_model=RAGAskResponse)
def ask_question(request: RAGAskRequest, _user: dict = Depends(require_user)):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    try:
        result = generate_answer(request.question)
    except ConnectionError:
        raise HTTPException(
            status_code=503,
            detail="AI inference unavailable. Set GROQ_API_KEY or start Ollama (`ollama serve`).",
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
