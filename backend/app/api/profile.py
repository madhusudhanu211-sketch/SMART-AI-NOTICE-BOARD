from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import User
from app.schemas.schemas import UserResponse, UserProfileUpdate

router = APIRouter(prefix="/profile", tags=["User Profile"])

@router.get("", response_model=UserResponse)
@router.get("/", response_model=UserResponse)
@router.get("/me", response_model=UserResponse)
def get_user_profile(db: Session = Depends(get_db)):
    user = db.query(User).filter(User.role == "Student").first()
    if not user:
        user = db.query(User).first()
    if not user:
        raise HTTPException(status_code=404, detail="Profile not found")
    return UserResponse.model_validate(user)

@router.put("", response_model=UserResponse)
@router.put("/", response_model=UserResponse)
@router.put("/me", response_model=UserResponse)
def update_user_profile(payload: UserProfileUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.role == "Student").first()
    if not user:
        user = db.query(User).first()
    if not user:
        raise HTTPException(status_code=404, detail="Profile not found")

    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.phone is not None:
        user.phone = payload.phone
    if payload.profile_pic_url is not None:
        user.profile_pic_url = payload.profile_pic_url
    if payload.department_id is not None:
        user.department_id = payload.department_id

    db.commit()
    db.refresh(user)
    return UserResponse.model_validate(user)
