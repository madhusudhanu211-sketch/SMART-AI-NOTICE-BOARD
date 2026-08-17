"""
Smart Campus AI – Full Conversation API
Endpoints:
  POST   /ai/conversations                     – create a new conversation
  GET    /ai/conversations                     – list user's conversations
  DELETE /ai/conversations/{id}                – delete a conversation
  PATCH  /ai/conversations/{id}/rename         – rename a conversation
  GET    /ai/conversations/{id}/messages       – load messages in a conversation
  POST   /ai/conversations/{id}/chat           – send a message (non-streaming)
  GET    /ai/conversations/{id}/stream?msg=…   – SSE streaming response
  PATCH  /ai/messages/{id}/feedback            – like / dislike a message
  POST   /ai/chat                              – legacy endpoint (voice assistant)
"""

import asyncio
import json
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.db.session import get_db
from app.models.models import ChatConversation, ChatMessage, ChatHistory, User
from app.schemas.schemas import (
    AIChatRequest,
    AIChatResponse,
    ChatConversationCreate,
    ChatConversationRename,
    ChatConversationResponse,
    ChatMessageResponse,
    MessageFeedbackRequest,
)
from app.services.gemini_service import gemini_ai_service

router = APIRouter(prefix="/ai", tags=["AI Chatbot"])


# ─────────────────────────────────────────────────────────────────────────────
# Helper: auto-generate a conversation title from the first user message
# ─────────────────────────────────────────────────────────────────────────────
def _auto_title(message: str) -> str:
    title = message.strip()
    if len(title) > 60:
        title = title[:57] + "..."
    return title or "New Conversation"


# ─────────────────────────────────────────────────────────────────────────────
# Helper: build conversation history list from DB messages
# ─────────────────────────────────────────────────────────────────────────────
def _build_history(messages: list) -> list:
    return [{"role": m.role, "content": m.content} for m in messages]


# ─────────────────────────────────────────────────────────────────────────────
# Helper: serialize a conversation for the response
# ─────────────────────────────────────────────────────────────────────────────
def _serialize_conversation(conv: ChatConversation, db: Session) -> dict:
    msg_count = len(conv.messages)
    last_msg = conv.messages[-1].content[:100] if conv.messages else None
    return {
        "id": conv.id,
        "user_id": conv.user_id,
        "title": conv.title,
        "created_at": conv.created_at,
        "updated_at": conv.updated_at,
        "message_count": msg_count,
        "last_message": last_msg,
    }


# ─────────────────────────────────────────────────────────────────────────────
# 1. Create a new conversation
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/conversations")
def create_conversation(
    payload: ChatConversationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conv = ChatConversation(
        user_id=current_user.id,
        title=payload.title or "New Conversation",
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return _serialize_conversation(conv, db)


# ─────────────────────────────────────────────────────────────────────────────
# 2. List all conversations for the current user
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/conversations")
def list_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    convs = (
        db.query(ChatConversation)
        .filter(ChatConversation.user_id == current_user.id)
        .order_by(ChatConversation.updated_at.desc())
        .limit(100)
        .all()
    )
    return [_serialize_conversation(c, db) for c in convs]


# ─────────────────────────────────────────────────────────────────────────────
# 3. Delete all conversations for current user
# ─────────────────────────────────────────────────────────────────────────────
@router.delete("/conversations/clear-all")
def delete_all_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    convs = db.query(ChatConversation).filter(
        ChatConversation.user_id == current_user.id
    ).all()
    for c in convs:
        db.delete(c)
    db.commit()
    return {"success": True, "message": "All conversations deleted"}


# ─────────────────────────────────────────────────────────────────────────────
# 3b. Delete a single conversation
# ─────────────────────────────────────────────────────────────────────────────
@router.delete("/conversations/{conv_id}")
def delete_conversation(
    conv_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conv = db.query(ChatConversation).filter(
        ChatConversation.id == conv_id,
        ChatConversation.user_id == current_user.id,
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    db.delete(conv)
    db.commit()
    return {"success": True, "id": conv_id}


# ─────────────────────────────────────────────────────────────────────────────
# 3c. Clear messages inside a conversation (keep conversation container)
# ─────────────────────────────────────────────────────────────────────────────
@router.delete("/conversations/{conv_id}/clear")
def clear_conversation_messages(
    conv_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conv = db.query(ChatConversation).filter(
        ChatConversation.id == conv_id,
        ChatConversation.user_id == current_user.id,
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    db.query(ChatMessage).filter(ChatMessage.conversation_id == conv_id).delete()
    conv.updated_at = datetime.utcnow()
    db.commit()
    return {"success": True, "id": conv_id, "message": "Conversation cleared"}



# ─────────────────────────────────────────────────────────────────────────────
# 4. Rename a conversation
# ─────────────────────────────────────────────────────────────────────────────
@router.patch("/conversations/{conv_id}/rename")
def rename_conversation(
    conv_id: int,
    payload: ChatConversationRename,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conv = db.query(ChatConversation).filter(
        ChatConversation.id == conv_id,
        ChatConversation.user_id == current_user.id,
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    conv.title = payload.title[:200]
    db.commit()
    db.refresh(conv)
    return _serialize_conversation(conv, db)


# ─────────────────────────────────────────────────────────────────────────────
# 5. Get messages in a conversation
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/conversations/{conv_id}/messages")
def get_messages(
    conv_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conv = db.query(ChatConversation).filter(
        ChatConversation.id == conv_id,
        ChatConversation.user_id == current_user.id,
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return [
        {
            "id": m.id,
            "conversation_id": m.conversation_id,
            "role": m.role,
            "content": m.content,
            "feedback": m.feedback,
            "created_at": m.created_at,
        }
        for m in conv.messages
    ]


# ─────────────────────────────────────────────────────────────────────────────
# 6. Send a message (non-streaming) – creates conversation if needed
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/conversations/{conv_id}/chat")
def chat_in_conversation(
    conv_id: int,
    payload: AIChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    message = (payload.query or payload.question or "").strip()
    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    language = payload.language or "en"

    # Load or 404 the conversation (must belong to this user)
    conv = db.query(ChatConversation).filter(
        ChatConversation.id == conv_id,
        ChatConversation.user_id == current_user.id,
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Auto-title if still default
    if conv.title == "New Conversation":
        conv.title = _auto_title(message)

    # Build history from existing messages
    history = _build_history(conv.messages)

    # Save user message
    user_msg = ChatMessage(conversation_id=conv.id, role="user", content=message)
    db.add(user_msg)
    db.flush()

    # Generate AI response
    try:
        answer = gemini_ai_service.generate_chat_response(
            message=message,
            conversation_history=history,
            db=db,
            current_user=current_user,
            language=language,
        )
    except Exception as e:
        print(f"[AI Chat Error] {e}")
        answer = "I'm sorry, I encountered an error processing your request. Please try again."

    # Save assistant message
    assistant_msg = ChatMessage(conversation_id=conv.id, role="assistant", content=answer)
    db.add(assistant_msg)

    # Update conversation timestamp
    conv.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user_msg)
    db.refresh(assistant_msg)

    return {
        "conversation_id": conv.id,
        "user_message_id": user_msg.id,
        "assistant_message_id": assistant_msg.id,
        "answer": answer,
        "title": conv.title,
        "suggested_questions": gemini_ai_service._get_followup_questions(message.lower()),
    }


# ─────────────────────────────────────────────────────────────────────────────
# 7. SSE Streaming endpoint
# GET /ai/conversations/{id}/stream?msg=…&lang=en
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/conversations/{conv_id}/stream")
def stream_chat(
    conv_id: int,
    msg: str = Query(..., description="User message text"),
    lang: str = Query("en", description="Language code: en, te, hi, ta"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    message = msg.strip()
    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # Load conversation
    conv = db.query(ChatConversation).filter(
        ChatConversation.id == conv_id,
        ChatConversation.user_id == current_user.id,
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Auto-title
    if conv.title == "New Conversation":
        conv.title = _auto_title(message)

    # Build history BEFORE saving the new user message (so we don't include it)
    history = _build_history(conv.messages)

    # Save user message immediately
    user_msg = ChatMessage(conversation_id=conv.id, role="user", content=message)
    db.add(user_msg)
    db.flush()
    user_msg_id = user_msg.id
    conv_title = conv.title

    # Collect full response for DB storage
    full_response_parts = []

    def generate():
        try:
            # Send metadata first as a special SSE event
            meta = json.dumps({
                "type": "meta",
                "user_message_id": user_msg_id,
                "title": conv_title,
            })
            yield f"data: {meta}\n\n"

            # Stream AI response chunks
            for chunk in gemini_ai_service.generate_chat_response_stream(
                message=message,
                conversation_history=history,
                db=db,
                current_user=current_user,
                language=lang,
            ):
                if chunk:
                    full_response_parts.append(chunk)
                    payload = json.dumps({"type": "token", "text": chunk})
                    yield f"data: {payload}\n\n"

            # Save assistant message and close
            full_text = "".join(full_response_parts)
            with db.begin_nested():
                assistant_msg = ChatMessage(
                    conversation_id=conv_id,
                    role="assistant",
                    content=full_text,
                )
                db.add(assistant_msg)
                conv.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(assistant_msg)

            done = json.dumps({"type": "done", "assistant_message_id": assistant_msg.id})
            yield f"data: {done}\n\n"

        except Exception as e:
            print(f"[Stream Error] {e}")
            error_payload = json.dumps({"type": "error", "message": "Stream interrupted. Please try again."})
            yield f"data: {error_payload}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


# ─────────────────────────────────────────────────────────────────────────────
# 8. Message feedback (like / dislike)
# ─────────────────────────────────────────────────────────────────────────────
@router.patch("/messages/{message_id}/feedback")
def set_message_feedback(
    message_id: int,
    payload: MessageFeedbackRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.feedback not in ("like", "dislike", "none"):
        raise HTTPException(status_code=400, detail="feedback must be 'like', 'dislike', or 'none'")

    # Verify ownership via the conversation
    msg = db.query(ChatMessage).filter(ChatMessage.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")

    conv = db.query(ChatConversation).filter(
        ChatConversation.id == msg.conversation_id,
        ChatConversation.user_id == current_user.id,
    ).first()
    if not conv:
        raise HTTPException(status_code=403, detail="Access denied")

    msg.feedback = None if payload.feedback == "none" else payload.feedback
    db.commit()
    return {"success": True, "message_id": message_id, "feedback": msg.feedback}


# ─────────────────────────────────────────────────────────────────────────────
# 9. Quick-start: POST /ai/conversations/new-with-message
#    Creates conversation + sends first message in one shot
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/conversations/start")
def start_new_conversation(
    payload: AIChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    message = (payload.query or payload.question or "").strip()
    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    language = payload.language or "en"

    # Create conversation
    conv = ChatConversation(
        user_id=current_user.id,
        title=_auto_title(message),
    )
    db.add(conv)
    db.flush()

    # Save user message
    user_msg = ChatMessage(conversation_id=conv.id, role="user", content=message)
    db.add(user_msg)
    db.flush()

    # Generate response
    try:
        answer = gemini_ai_service.generate_chat_response(
            message=message,
            conversation_history=[],
            db=db,
            current_user=current_user,
            language=language,
        )
    except Exception as e:
        print(f"[Start Conversation Error] {e}")
        answer = "I'm sorry, I couldn't process your request. Please try again."

    assistant_msg = ChatMessage(conversation_id=conv.id, role="assistant", content=answer)
    db.add(assistant_msg)
    conv.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(conv)

    return {
        "conversation_id": conv.id,
        "title": conv.title,
        "user_message_id": user_msg.id,
        "assistant_message_id": assistant_msg.id,
        "answer": answer,
        "suggested_questions": gemini_ai_service._get_followup_questions(message.lower()),
    }


# ─────────────────────────────────────────────────────────────────────────────
# 10. LEGACY: POST /ai/chat – kept for voice assistant & backward compat
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/chat", response_model=AIChatResponse)
def legacy_chat(
    payload: AIChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (payload.query or payload.question or "Hello").strip()
    language = payload.language or "en"
    history = payload.history or []

    result = gemini_ai_service.process_natural_voice_command(
        query=query,
        db=db,
        current_user=current_user,
    )

    answer = result.get("message", "I am processing your query.")
    suggested = result.get("suggested_questions", [
        "Tell me more",
        "What are the latest notices?",
        "Show my attendance percentage",
    ])

    # Audit log in old flat table
    try:
        history_entry = ChatHistory(
            user_id=current_user.id,
            user_query=query,
            bot_response=answer,
        )
        db.add(history_entry)
        db.commit()
    except Exception as e:
        print(f"[Legacy Chat Audit] {e}")

    return AIChatResponse(
        query=query,
        answer=answer,
        suggested_questions=suggested,
    )
