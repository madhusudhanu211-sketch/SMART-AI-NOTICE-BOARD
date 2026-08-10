from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.models import Document
from app.schemas.schemas import DocumentResponse, DocumentCreate

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.get("", response_model=List[DocumentResponse])
@router.get("/", response_model=List[DocumentResponse])
def get_documents(
    category: Optional[str] = None,
    department_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Document)
    if category:
        query = query.filter(Document.category.ilike(f"%{category}%"))
    if department_id:
        query = query.filter(Document.department_id == department_id)
        
    return query.order_by(Document.created_at.desc()).all()

@router.post("", response_model=DocumentResponse)
@router.post("/", response_model=DocumentResponse)
def create_document(payload: DocumentCreate, db: Session = Depends(get_db)):
    doc = Document(
        title=payload.title,
        category=payload.category,
        file_url=payload.file_url,
        department_id=payload.department_id,
        uploaded_by=1
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc
