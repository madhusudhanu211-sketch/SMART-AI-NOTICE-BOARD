from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional
from app.db.session import get_db
from app.schemas.schemas import VoiceCommandRequest, VoiceCommandResponse
from app.services.voice_service import voice_service
from app.services.gemini_service import gemini_ai_service
from app.models.models import VoiceCommand, User
from app.api.auth import oauth2_scheme

def get_optional_user(
    token_header: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    if not token_header:
        return None
    try:
        from jose import jwt
        from app.core.config import settings
        payload = jwt.decode(token_header, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email:
            return db.query(User).filter(User.email == email).first()
    except Exception:
        pass
    return None

router = APIRouter(prefix="/voice", tags=["Voice Assistant"])

@router.post("", response_model=VoiceCommandResponse)
@router.post("/", response_model=VoiceCommandResponse)
@router.post("/process", response_model=VoiceCommandResponse)
def process_voice_command(
    payload: VoiceCommandRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    res = voice_service.process_command(
        raw_command=payload.command,
        current_user=current_user,
        db=db
    )

    try:
        vc = VoiceCommand(
            user_id=current_user.id if current_user else 1,
            transcript=payload.command,
            intent=res.get("intent", res.get("action", "UNKNOWN")),
            action_taken=res.get("response", res.get("message", ""))
        )
        db.add(vc)
        db.commit()
    except Exception as e:
        print(f"[Voice Audit Error] {e}")

    return VoiceCommandResponse(
        command=res.get("response", res.get("command", payload.command)),
        action=res.get("intent", res.get("action", "UNKNOWN")),
        target=res.get("target"),
        data=res.get("data"),
        message=res.get("response", res.get("message", ""))
    )

@router.post("/transcribe-audio")
async def transcribe_and_execute_audio(
    file: UploadFile = File(...),
    language: str = "en",
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    audio_bytes = await file.read()
    transcript = ""

    # 1. Use Gemini multimodal audio model if configured
    if gemini_ai_service and gemini_ai_service.client:
        try:
            prompt = (
                f"You are the Voice Recognition subsystem of the Smart Notice Board. "
                f"Transcribe the spoken words from this audio. The language may be {language} (English, Telugu, Hindi, or Tamil). "
                f"Return ONLY the plain transcribed text without punctuation or conversational commentary."
            )
            resp = gemini_ai_service.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[
                    {"mime_type": file.content_type or "audio/m4a", "data": audio_bytes},
                    prompt
                ]
            )
            if resp and resp.text:
                transcript = resp.text.strip().strip('"').strip("'")
        except Exception as e:
            print(f"[Gemini Audio Transcription Warning] {e}")

    # 2. If no speech detected in audio, do NOT fabricate or auto-select a demo question
    if not transcript or not transcript.strip():
        no_speech_msg = (
            "మైక్రోఫోన్ నుండి ఎటువంటి మాటలు నమోదు కాలేదు. దయచేసి స్పష్టంగా మాట్లాడండి."
            if language == "te"
            else "No speech was detected from your microphone. Please speak clearly into your microphone and try again."
        )
        return {
            "transcript": "",
            "response": no_speech_msg,
            "intent": "NO_SPEECH_DETECTED",
            "navigation": None,
            "requires_confirmation": False,
            "confirmation_payload": None
        }

    # 3. Process the recognized transcript through real-world voice intent engine
    res = voice_service.process_command(
        raw_command=transcript,
        current_user=current_user,
        db=db,
        language=language
    )

    try:
        vc = VoiceCommand(
            user_id=current_user.id if current_user else 1,
            transcript=transcript,
            intent=res.get("intent", "UNKNOWN"),
            action_taken=res.get("response", res.get("message", ""))
        )
        db.add(vc)
        db.commit()
    except Exception:
        pass

    return {
        "transcript": transcript,
        "response": res.get("response", res.get("message", "")),
        "intent": res.get("intent", "UNKNOWN"),
        "navigation": res.get("navigation", "/notices"),
        "requires_confirmation": res.get("requires_confirmation", False),
        "confirmation_payload": res.get("confirmation_payload")
    }
