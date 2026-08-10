from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from app.services.file_service import file_service
from app.api.auth import get_current_user
from app.models.models import User

router = APIRouter(prefix="/files", tags=["File Storage"])

@router.post("/upload")
async def upload_file(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    try:
        result = await file_service.save_file(file)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")
