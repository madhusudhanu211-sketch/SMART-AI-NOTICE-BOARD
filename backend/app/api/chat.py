from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.schemas import AIChatRequest, AIChatResponse
from app.services.ai_service import ai_service
from app.models.models import ChatHistory

router = APIRouter(tags=["AI Chatbot"])

@router.post("/chat", response_model=AIChatResponse)
@router.post("/ai/ask", response_model=AIChatResponse)
def ai_chat_query(payload: AIChatRequest, db: Session = Depends(get_db)):
    query = payload.query or payload.question or "Hello"
    result = ai_service.query_assistant(query)

    try:
        history = ChatHistory(
            user_id=1,
            user_query=query,
            bot_response=result["answer"]
        )
        db.add(history)
        db.commit()
    except Exception as e:
        print(f"[Chat Audit Error] {e}")

    return AIChatResponse(
        query=query,
        answer=result["answer"],
        suggested_questions=result.get("suggested_questions", [])
    )

@router.get("/chat/history")
@router.get("/ai/history")
def get_chat_history(db: Session = Depends(get_db)):
    chats = db.query(ChatHistory).order_by(ChatHistory.created_at.desc()).limit(20).all()
    return [
        {
            "id": c.id,
            "user_id": c.user_id,
            "user_query": c.user_query,
            "bot_response": c.bot_response,
            "created_at": c.created_at
        } for c in chats
    ]

