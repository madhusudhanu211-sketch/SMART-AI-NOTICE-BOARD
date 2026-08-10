from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.schemas import VoiceCommandRequest, VoiceCommandResponse
from app.services.voice_service import voice_service
from app.models.models import VoiceCommand

router = APIRouter(prefix="/voice", tags=["Voice Assistant"])

@router.post("", response_model=VoiceCommandResponse)
@router.post("/", response_model=VoiceCommandResponse)
@router.post("/process", response_model=VoiceCommandResponse)
def process_voice_command(payload: VoiceCommandRequest, db: Session = Depends(get_db)):
    res = voice_service.process_command(payload.command)

    try:
        vc = VoiceCommand(
            user_id=1,
            transcript=payload.command,
            intent=res.get("action", "UNKNOWN"),
            action_taken=res.get("message", "")
        )
        db.add(vc)
        db.commit()
    except Exception as e:
        print(f"[Voice Audit Error] {e}")

    return VoiceCommandResponse(
        command=res["command"],
        action=res["action"],
        target=res["target"],
        data=res.get("data"),
        message=res["message"]
    )
