from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from app.db.session import get_db
from app.models.models import User, Attendance, Notice, Assignment, Event, VoiceCommand
from app.schemas.schemas import (
    AssistantQueryRequest,
    AssistantIntentResponse,
    AssistantContextResponse
)
from app.api.auth import get_current_user
from app.services.voice_service import voice_service

router = APIRouter(prefix="/assistant", tags=["AI Voice Assistant"])

@router.post("/voice-intent", response_model=AssistantIntentResponse)
@router.post("/query", response_model=AssistantIntentResponse)
def process_assistant_voice_intent(
    payload: AssistantQueryRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Real-world AI Voice Assistant endpoint.
    Processes natural-language speech/text queries, parses intents, verifies RBAC,
    fetches database context, and supports conversational follow-ups.
    """
    res = voice_service.process_command(
        raw_command=payload.message,
        current_user=current_user,
        db=db,
        language=payload.language or "en",
        history=payload.conversation_history
    )

    # Audit logging for faculty/admin or key voice commands
    try:
        if current_user:
            vc = VoiceCommand(
                user_id=current_user.id,
                transcript=payload.message,
                intent=res.get("intent", "UNKNOWN"),
                action_taken=res.get("response", "")
            )
            db.add(vc)
            db.commit()
    except Exception as e:
        print(f"[Assistant Voice Audit Error] {e}")

    return AssistantIntentResponse(
        intent=res.get("intent", "UNKNOWN"),
        response=res.get("response", ""),
        data=res.get("data"),
        navigation=res.get("navigation"),
        requires_confirmation=res.get("requires_confirmation", False),
        confirmation_payload=res.get("confirmation_payload"),
        language=res.get("language", "en")
    )


@router.get("/context", response_model=AssistantContextResponse)
def get_assistant_context(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns relevant academic context for the logged-in user to hydrate AI prompts.
    """
    dept_name = current_user.department.name if current_user.department else None

    # Calculate Attendance
    attendance_records = db.query(Attendance).filter(Attendance.student_id == current_user.id).all()
    attendance_summary = None
    if attendance_records:
        total = len(attendance_records)
        present = len([r for r in attendance_records if r.status == "Present"])
        attendance_summary = {
            "total_classes": total,
            "present_classes": present,
            "percentage": round((present / total) * 100, 1)
        }

    pending_assignments = db.query(Assignment).count()
    upcoming_events = db.query(Event).count()
    unread_notices = db.query(Notice).filter(Notice.is_archived == False).count()

    return AssistantContextResponse(
        user_id=current_user.id,
        user_name=current_user.full_name,
        role=current_user.role,
        department_name=dept_name,
        attendance_summary=attendance_summary,
        pending_assignments_count=pending_assignments,
        upcoming_events_count=upcoming_events,
        unread_notices_count=unread_notices
    )
