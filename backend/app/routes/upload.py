from fastapi import APIRouter, HTTPException

from ..schemas.upload import UploadRequest, UploadResponse
from ..services.rag import register_document

router = APIRouter()


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
