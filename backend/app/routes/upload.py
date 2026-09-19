from fastapi import APIRouter, HTTPException

from ..schemas.upload import DocumentItem, UploadRequest, UploadResponse
from ..services.rag import get_db, register_document

router = APIRouter()


@router.get("/documents", response_model=list[DocumentItem])
async def list_documents():
    conn = get_db()
    rows = conn.execute(
        "SELECT id, filename, storage_path, file_size, status, created_at FROM rag_documents ORDER BY id DESC"
    ).fetchall()
    conn.close()
    return [
        DocumentItem(
            id=r["id"],
            filename=r["filename"],
            storage_path=r["storage_path"],
            file_size=r["file_size"],
            status=r["status"],
            created_at=r["created_at"] or "",
        )
        for r in rows
    ]


@router.post("/upload", response_model=UploadResponse)
async def upload_file(request: UploadRequest):
    if not request.filename.strip():
        raise HTTPException(status_code=400, detail="Filename cannot be empty")
    if not request.storage_path.strip():
        raise HTTPException(status_code=400, detail="Storage path cannot be empty")

    try:
        document_id = register_document(
            filename=request.filename,
            storage_path=request.storage_path,
            size=request.size,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to register document: {str(e)}")

    return UploadResponse(
        filename=request.filename,
        size=request.size,
        status="uploaded",
        document_id=document_id,
    )
