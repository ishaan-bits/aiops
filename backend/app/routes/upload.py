from __future__ import annotations

import logging
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from ..schemas.upload import DocumentItem, UploadResponse
from ..services import database, storage
from ..services.auth import require_user

log = logging.getLogger(__name__)
router = APIRouter()

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".csv"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB


@router.get("/documents", response_model=list[DocumentItem])
async def get_documents(_user: dict = Depends(require_user)):
    rows = database.list_documents()
    return [
        DocumentItem(
            id=r["id"],
            filename=r["filename"],
            storage_path=r["storage_path"],
            file_size=r.get("file_size", 0),
            chunk_count=r.get("chunk_count", 0),
            status=r.get("status", "uploaded"),
            created_at=str(r.get("created_at", "")),
        )
        for r in rows
    ]


@router.post("/documents/upload", response_model=UploadResponse)
async def post_upload(file: UploadFile = File(...), _user: dict = Depends(require_user)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is required")

    ext = "." + file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type '{ext}' not supported. Use PDF, DOCX, or CSV.")

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File exceeds 50 MB limit")

    storage_path = f"{uuid.uuid4().hex}{ext}"

    # Step 1: Write file to local storage
    try:
        storage.save_file(file_bytes, storage_path)
    except Exception as e:
        log.exception("File storage failed")
        raise HTTPException(status_code=500, detail=f"File storage failed: {e}")

    # Step 2: Insert metadata — remove the file on failure
    try:
        doc = database.create_document(
            filename=file.filename,
            storage_path=storage_path,
            file_size=len(file_bytes),
        )
    except Exception as insert_err:
        try:
            storage.delete_file(storage_path)
        except Exception:
            log.warning("Storage rollback failed for %s", storage_path)

        log.error("create_document failed: %s", insert_err, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to save document metadata: {insert_err}")

    return UploadResponse(
        id=doc["id"],
        filename=doc["filename"],
        storage_path=doc["storage_path"],
        file_size=doc.get("file_size", len(file_bytes)),
        status=doc.get("status", "uploaded"),
    )


@router.delete("/documents/{doc_id}")
async def delete_doc(doc_id: int, _user: dict = Depends(require_user)):
    doc = database.get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if doc.get("storage_path"):
        try:
            storage.delete_file(doc["storage_path"])
        except Exception:
            pass

    try:
        database.delete_document(doc_id)
    except Exception as e:
        log.exception("delete_document failed for id=%d", doc_id)
        raise HTTPException(status_code=500, detail=f"Failed to delete document: {e}")

    return {"detail": "Document deleted", "id": doc_id}
