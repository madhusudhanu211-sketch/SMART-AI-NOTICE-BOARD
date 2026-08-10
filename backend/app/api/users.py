from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import base64

from app.db.session import get_db
from app.models.models import User
from app.schemas.schemas import UserResponse, UserProfileUpdate, ChangePasswordRequest, UserRegister
from app.api.auth import get_current_user
from app.core.security import verify_password, get_password_hash

router = APIRouter(prefix="/users", tags=["Users"])

class LanguagePreferenceRequest(BaseModel):
    language: str

class ProfilePhotoUploadRequest(BaseModel):
    photo_data_url: str

# In-memory language preference store per user session/email
_user_language_preferences = {}

@router.get("/language")
def get_user_language(current_user: User = Depends(get_current_user)):
    lang = _user_language_preferences.get(current_user.email, "en")
    return {"language": lang, "supported": ["en", "te", "hi", "ta"]}

@router.put("/language")
def update_user_language(payload: LanguagePreferenceRequest, current_user: User = Depends(get_current_user)):
    if payload.language not in ["en", "te", "hi", "ta"]:
        raise HTTPException(status_code=400, detail="Invalid language code. Supported: en, te, hi, ta")
    _user_language_preferences[current_user.email] = payload.language
    return {"message": "Language preference updated", "language": payload.language}

@router.get("/profile", response_model=UserResponse)
def get_current_profile(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)

@router.put("/profile", response_model=UserResponse)
def update_profile(payload: UserProfileUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if payload.full_name:
        current_user.full_name = payload.full_name
    if payload.phone:
        current_user.phone = payload.phone
    if payload.profile_pic_url is not None:
        current_user.profile_pic_url = payload.profile_pic_url
    if payload.department_id:
        current_user.department_id = payload.department_id

    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)

@router.post("/profile/photo", response_model=UserResponse)
def upload_profile_photo(payload: ProfilePhotoUploadRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    data_url = payload.photo_data_url
    
    # Validate Base64 Data URL or HTTP URL
    if not data_url or not (data_url.startswith("data:image/") or data_url.startswith("http")):
        raise HTTPException(status_code=400, detail="Please select a valid JPG, JPEG, or PNG image.")

    # Size check for data URL (~5MB payload limit check)
    if len(data_url) > 7 * 1024 * 1024:  # ~5MB raw binary translates to ~6.7MB base64
        raise HTTPException(status_code=400, detail="Profile photo must be smaller than 5 MB.")

    current_user.profile_pic_url = data_url
    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)

@router.delete("/profile/photo", response_model=UserResponse)
def remove_profile_photo(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    current_user.profile_pic_url = None
    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)

@router.get("/", response_model=List[UserResponse])
def get_users(role: Optional[str] = None, department_id: Optional[int] = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if department_id:
        query = query.filter(User.department_id == department_id)
    return [UserResponse.model_validate(u) for u in query.all()]

@router.post("/change-password")
def change_password(payload: ChangePasswordRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not verify_password(payload.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    current_user.hashed_password = get_password_hash(payload.new_password)
    db.commit()
    return {"message": "Password changed successfully"}

@router.post("/create-user", response_model=UserResponse)
def create_user(payload: UserRegister, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "Admin":
        raise HTTPException(status_code=430, detail="Only Admins can create user profiles")

    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User email already exists")

    new_user = User(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        role=payload.role,
        department_id=payload.department_id,
        roll_number=payload.roll_number,
        phone=payload.phone
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return UserResponse.model_validate(new_user)
