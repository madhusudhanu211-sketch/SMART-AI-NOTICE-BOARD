from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.models import Department, User
from app.schemas.schemas import DepartmentCreate, DepartmentResponse
from app.api.auth import get_current_user

router = APIRouter(prefix="/departments", tags=["Departments"])

@router.get("/", response_model=List[DepartmentResponse])
def get_departments(db: Session = Depends(get_db)):
    depts = db.query(Department).all()
    return [DepartmentResponse.model_validate(d) for d in depts]

@router.post("/", response_model=DepartmentResponse)
def create_department(payload: DepartmentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Only Admins can create departments")

    existing = db.query(Department).filter(Department.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Department already exists")

    dept = Department(name=payload.name, code=payload.code, description=payload.description)
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return DepartmentResponse.model_validate(dept)
