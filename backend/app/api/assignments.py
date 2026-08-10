from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.models import Assignment, User
from app.schemas.schemas import AssignmentCreate, AssignmentResponse, AssignmentSubmissionCreate

router = APIRouter(prefix="/assignments", tags=["Assignments"])

@router.get("", response_model=List[AssignmentResponse])
@router.get("/", response_model=List[AssignmentResponse])
def get_assignments(
    department_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Assignment)
    if department_id:
        query = query.filter(Assignment.department_id == department_id)
    return query.order_by(Assignment.due_date.asc()).all()

@router.post("", response_model=AssignmentResponse)
@router.post("/", response_model=AssignmentResponse)
def create_assignment(payload: AssignmentCreate, db: Session = Depends(get_db)):
    faculty_user = db.query(User).filter(User.role == "Faculty").first()
    faculty_id = faculty_user.id if faculty_user else 1

    assignment = Assignment(
        title=payload.title,
        description=payload.description,
        subject=payload.subject,
        department_id=payload.department_id,
        faculty_id=faculty_id,
        due_date=payload.due_date,
        max_marks=payload.max_marks,
        attachment_url=payload.attachment_url
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment
