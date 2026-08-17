from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
from app.db.session import get_db
from app.models.models import User, Department
from app.schemas.schemas import (
    UserRegister, UserLogin, TokenResponse, UserResponse,
    ForgotPasswordRequest, VerifyOTPRequest, ResetPasswordRequest, GoogleLoginRequest
)
from app.core.security import verify_password, get_password_hash, create_access_token, generate_otp
from fastapi.security import OAuth2PasswordBearer

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def get_current_user(
    token_header: Optional[str] = Depends(oauth2_scheme),
    token_query: Optional[str] = Query(None, alias="token"),
    db: Session = Depends(get_db)
) -> User:
    from jose import jwt, JWTError
    from app.core.config import settings
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token = token_header or token_query
    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user

def require_faculty(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ["Faculty", "Admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Faculty or Admin permissions required"
        )
    return current_user

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Admin permissions required"
        )
    return current_user

@router.post("/register", response_model=TokenResponse)
def register_user(payload: UserRegister, db: Session = Depends(get_db)):
    valid_roles = ["Student", "Faculty", "Admin"]
    user_role = payload.role.capitalize() if payload.role else "Student"
    if user_role not in valid_roles:
        raise HTTPException(status_code=400, detail="Invalid role. Must be Student, Faculty, or Admin")

    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email is already registered")

    hashed_pwd = get_password_hash(payload.password)
    new_user = User(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=hashed_pwd,
        role=user_role,
        department_id=payload.department_id,
        roll_number=payload.roll_number,
        phone=payload.phone
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(subject=new_user.id)
    return TokenResponse(access_token=token, user=UserResponse.model_validate(new_user))

@router.post("/login", response_model=TokenResponse)
def login_user(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="User account is deactivated")

    # Validate selected role against actual database user role
    if payload.role and payload.role.lower() != user.role.lower():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Your account is registered as {user.role}. Please select {user.role}."
        )

    token = create_access_token(subject=user.id)
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)

@router.post("/google-login", response_model=TokenResponse)
def google_login(payload: GoogleLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        user = User(
            full_name=payload.full_name,
            email=payload.email,
            hashed_password=get_password_hash("GoogleAuth123!"),
            role="Student",
            profile_pic_url=payload.profile_pic_url
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token(subject=user.id)
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))

@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User with this email not found")

    otp = generate_otp()
    user.otp_code = otp
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
    db.commit()

    return {"message": "OTP sent successfully to email", "demo_otp": otp}

@router.post("/verify-otp")
def verify_otp(payload: VerifyOTPRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or user.otp_code != payload.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP code")

    if user.otp_expires_at and user.otp_expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP has expired")

    return {"message": "OTP verified successfully"}

@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or user.otp_code != payload.otp:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    user.hashed_password = get_password_hash(payload.new_password)
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()

    return {"message": "Password reset successfully. Please login with your new password."}
