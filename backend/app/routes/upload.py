from __future__ import annotations

import logging
import os
import traceback
import uuid

from fastapi import APIRouter, File, HTTPException, UploadFile

from ..schemas.upload import DocumentItem, UploadResponse
from ..services.supabase_client import (
    create_document,
    delete_document,
    delete_storage_object,
    get_document,
    list_documents,
    upload_document,
)

log = logging.getLogger(__name__)

router = APIRouter()

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".csv"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB
DEV_MODE = os.getenv("ENVIRONMENT", "development") == "development"


@router.get("/documents", response_model=list[DocumentItem])
async def get_documents():
    try:
        rows = list_documents()
    except Exception as e:
        log.exception("Failed to list documents")
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
async def post_upload(file: UploadFile = File(...)):
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

    # Step 1: Upload to Storage
    try:
        upload_document(file_bytes, storage_path, content_type)
    except Exception as e:
        log.exception("Storage upload failed")
        raise HTTPException(status_code=500, detail=f"Storage upload failed: {e}")

    # Step 2: Insert metadata — rollback storage on failure
    try:
        doc = create_document(
            filename=file.filename,
            storage_path=storage_path,
            file_size=len(file_bytes),
        )
    except Exception as insert_err:
        try:
            delete_storage_object(storage_path)
        except Exception:
            log.warning("Storage rollback failed for %s", storage_path)

        tb = traceback.format_exc()
        log.error("create_document FAILED: %s | %s\n%s", type(insert_err).__name__, insert_err, tb)

        detail = f"Failed to save document metadata: {insert_err}"
        if DEV_MODE:
            detail = {
                "error": str(insert_err),
                "type": type(insert_err).__name__,
                "traceback": tb,
                "payload": {"filename": file.filename, "storage_path": storage_path, "file_size": len(file_bytes)},
            }
        raise HTTPException(status_code=500, detail=detail)

    return UploadResponse(
        id=doc["id"],
        filename=doc["filename"],
        storage_path=doc["storage_path"],
        file_size=doc.get("file_size", len(file_bytes)),
        status=doc.get("status", "uploaded"),
    )


@router.delete("/documents/{doc_id}")
async def delete_doc(doc_id: int):
    doc = get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if doc.get("storage_path"):
        try:
            delete_storage_object(doc["storage_path"])
        except Exception:
            pass

    try:
        delete_document(doc_id)
    except Exception as e:
        log.exception("Failed to delete document %d", doc_id)
        raise HTTPException(status_code=500, detail=f"Failed to delete document metadata: {e}")

    return {"detail": "Document deleted", "id": doc_id}
