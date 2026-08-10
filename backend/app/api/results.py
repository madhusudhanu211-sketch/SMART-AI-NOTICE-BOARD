from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.models import Result
from app.schemas.schemas import ResultResponse

router = APIRouter(prefix="/results", tags=["Results"])

@router.get("", response_model=List[ResultResponse])
@router.get("/", response_model=List[ResultResponse])
def get_results(
    semester: Optional[str] = None,
    student_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Result)
    if semester:
        query = query.filter(Result.semester.ilike(f"%{semester}%"))
    if student_id:
        query = query.filter(Result.student_id == student_id)
        
    return query.all()
