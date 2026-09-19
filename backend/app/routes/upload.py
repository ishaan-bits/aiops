from __future__ import annotations

import logging
import os
import traceback
import uuid

from fastapi import APIRouter, File, HTTPException, UploadFile

from ..schemas.upload import DocumentItem, UploadResponse
from ..services.supabase_client import (
    db_delete_document,
    db_get_document,
    db_insert_document,
    db_list_documents,
    get_documents_table_columns_via_rest,
    storage_delete,
    storage_upload,
)

log = logging.getLogger(__name__)

router = APIRouter()

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".csv"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB
DEV_MODE = os.getenv("ENVIRONMENT", "development") == "development"


@router.get("/documents", response_model=list[DocumentItem])
async def list_documents():
    try:
        rows = db_list_documents()
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


@router.get("/documents/schema")
async def get_documents_schema():
    """Diagnostic endpoint: returns what PostgREST sees for the documents table."""
    schema_info = get_documents_table_columns_via_rest()
    return {"schema_probe": schema_info}


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

    # Step 1: Upload to Storage
    try:
        storage_upload(file_bytes, storage_path, content_type)
        log.info("Storage upload OK: %s (%d bytes)", storage_path, len(file_bytes))
    except Exception as e:
        log.exception("Storage upload failed")
        raise HTTPException(status_code=500, detail=f"Storage upload failed: {e}")

    # Step 2: Insert metadata into DB
    try:
        doc = db_insert_document(
            filename=file.filename,
            storage_path=storage_path,
            file_size=len(file_bytes),
        )
    except Exception as insert_err:
        # Roll back storage
        try:
            storage_delete(storage_path)
            log.info("Rolled back storage object: %s", storage_path)
        except Exception as del_err:
            log.error("Failed to roll back storage object %s: %s", storage_path, del_err)

        tb_str = traceback.format_exc()
        log.error("=== DOCUMENT INSERT FAILED ===")
        log.error("Exception type: %s", type(insert_err).__name__)
        log.error("Exception message: %s", insert_err)
        log.error("Full traceback:\n%s", tb_str)

        # Try to get schema info for debugging
        try:
            schema_info = get_documents_table_columns_via_rest()
            log.error("PostgREST schema probe: %s", schema_info)
        except Exception:
            pass

        detail = f"Failed to save document metadata: {insert_err}"
        if DEV_MODE:
            detail = {
                "error": str(insert_err),
                "error_type": type(insert_err).__name__,
                "traceback": tb_str,
                "payload_sent": {
                    "filename": file.filename,
                    "storage_path": storage_path,
                    "file_size": len(file_bytes),
                    "status": "uploaded",
                },
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
        log.exception("Failed to delete document %d", doc_id)
        raise HTTPException(status_code=500, detail=f"Failed to delete document metadata: {e}")

    return {"detail": "Document deleted", "id": doc_id}
