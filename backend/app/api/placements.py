from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.models import Placement
from app.schemas.schemas import PlacementResponse, PlacementCreate

router = APIRouter(prefix="/placements", tags=["Placements"])

@router.get("", response_model=List[PlacementResponse])
@router.get("/", response_model=List[PlacementResponse])
def get_placements(db: Session = Depends(get_db)):
    return db.query(Placement).order_by(Placement.deadline.asc()).all()

@router.post("", response_model=PlacementResponse)
@router.post("/", response_model=PlacementResponse)
def create_placement(payload: PlacementCreate, db: Session = Depends(get_db)):
    plc = Placement(
        company_name=payload.company_name,
        job_role=payload.job_role,
        eligibility_criteria=payload.eligibility_criteria,
        salary_package=payload.salary_package,
        deadline=payload.deadline,
        interview_schedule=payload.interview_schedule,
        apply_link=payload.apply_link,
        company_logo_url=payload.company_logo_url
    )
    db.add(plc)
    db.commit()
    db.refresh(plc)
    return plc
