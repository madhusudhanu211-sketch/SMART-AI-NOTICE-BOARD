from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.schemas import AIChatRequest, AIChatResponse
from app.models.models import User, ChatHistory
from app.api.auth import get_current_user
from app.services.gemini_service import gemini_ai_service

router = APIRouter(prefix="/ai", tags=["AI Chatbot"])

@router.post("/chat", response_model=AIChatResponse)
def chat_with_ai(payload: AIChatRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = gemini_ai_service.process_natural_voice_command(
        query=payload.query,
        db=db,
        current_user=current_user
    )

    answer = result.get("message", "I am processing your query.")
    suggested = result.get("suggested_questions", [
        "Tell me more",
        "What are the latest notices?",
        "Show my attendance percentage",
        "Open timetable schedule"
    ])

    # Save conversation to history table
    history = ChatHistory(
        user_id=current_user.id,
        user_query=payload.query,
        bot_response=answer
    )
    db.add(history)
    db.commit()

    return AIChatResponse(
        query=payload.query,
        answer=answer,
        suggested_questions=suggested
    )
