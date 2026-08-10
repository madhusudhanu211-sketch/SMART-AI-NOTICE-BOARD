from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import Feedback, User
from app.schemas.schemas import FeedbackCreate, FeedbackResponse

router = APIRouter(prefix="/feedback", tags=["Feedback"])

@router.post("", response_model=FeedbackResponse)
@router.post("/", response_model=FeedbackResponse)
def submit_feedback(payload: FeedbackCreate, db: Session = Depends(get_db)):
    student_user = db.query(User).filter(User.role == "Student").first()
    user_id = student_user.id if student_user else 1

    fb = Feedback(
        user_id=user_id,
        message=payload.message,
        rating=payload.rating
    )
    db.add(fb)
    db.commit()
    db.refresh(fb)

    res = FeedbackResponse.model_validate(fb)
    res.user_name = student_user.full_name if student_user else "Student User"
    return res
