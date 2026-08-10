from fastapi import APIRouter
from app.core.config import settings

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "app": settings.PROJECT_NAME,
        "version": "1.0.0",
        "database": "connected"
    }
