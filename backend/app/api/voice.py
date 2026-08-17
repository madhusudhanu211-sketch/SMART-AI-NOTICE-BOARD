from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from app.db.session import get_db
from app.schemas.schemas import VoiceCommandRequest, VoiceCommandResponse
from app.services.voice_service import voice_service
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
