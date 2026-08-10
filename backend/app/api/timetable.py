from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.models import Timetable
from app.schemas.schemas import TimetableResponse

router = APIRouter(prefix="/timetable", tags=["Timetable"])

@router.get("", response_model=List[TimetableResponse])
@router.get("/", response_model=List[TimetableResponse])
def get_timetable(
    day: Optional[str] = None,
    department_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Timetable)
    if day:
        query = query.filter(Timetable.day_of_week.ilike(day))
    if department_id:
        query = query.filter(Timetable.department_id == department_id)
        
    return query.all()
