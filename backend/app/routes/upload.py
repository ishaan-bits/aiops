from __future__ import annotations

import uuid

from fastapi import APIRouter, File, HTTPException, UploadFile

from ..schemas.upload import DocumentItem, UploadResponse
from ..services.supabase_client import (
    db_delete_document,
    db_get_document,
    db_insert_document,
    db_list_documents,
    storage_delete,
    storage_upload,
)

router = APIRouter()

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".csv"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB


@router.get("/documents", response_model=list[DocumentItem])
async def list_documents():
    try:
        rows = db_list_documents()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load documents: {e}")

    return [
        DocumentItem(
            id=r["id"],
            filename=r["filename"],
            storage_path=r["storage_path"],
            file_size=r.get("file_size", 0),
            chunk_count=r.get("chunk_count", 0),
            status=r.get("status", "uploaded"),
            created_at=r.get("created_at", ""),
        )
        for r in rows
    ]


@router.post("/documents/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is required")

    ext = "." + file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type '{ext}' not supported. Use PDF, DOCX, or CSV.")

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File exceeds 50 MB limit")

    storage_path = f"{uuid.uuid4().hex}{ext}"
    content_type = file.content_type or "application/octet-stream"

    try:
        storage_upload(file_bytes, storage_path, content_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Storage upload failed: {e}")

    try:
        doc = db_insert_document(
            filename=file.filename,
            storage_path=storage_path,
            file_size=len(file_bytes),
        )
    except Exception:
        storage_delete(storage_path)
        raise HTTPException(status_code=500, detail="Failed to save document metadata. Storage file rolled back.")

    return UploadResponse(
        id=doc["id"],
        filename=doc["filename"],
        storage_path=doc["storage_path"],
        file_size=doc.get("file_size", len(file_bytes)),
        status=doc.get("status", "uploaded"),
    )


@router.delete("/documents/{doc_id}")
async def delete_document(doc_id: int):
    doc = db_get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    storage_path = doc.get("storage_path")

    if storage_path:
        try:
            storage_delete(storage_path)
        except Exception:
            pass

    try:
        db_delete_document(doc_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete document metadata: {e}")

    return {"detail": "Document deleted", "id": doc_id}
