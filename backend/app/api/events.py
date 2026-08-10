from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.models import Event
from app.schemas.schemas import EventResponse, EventCreate

router = APIRouter(prefix="/events", tags=["Events"])

@router.get("", response_model=List[EventResponse])
@router.get("/", response_model=List[EventResponse])
def get_events(db: Session = Depends(get_db)):
    return db.query(Event).order_by(Event.event_date.asc()).all()

@router.post("", response_model=EventResponse)
@router.post("/", response_model=EventResponse)
def create_event(payload: EventCreate, db: Session = Depends(get_db)):
    evt = Event(
        title=payload.title,
        description=payload.description,
        event_type=payload.event_type,
        event_date=payload.event_date,
        location=payload.location,
        organizer=payload.organizer,
        max_participants=payload.max_participants,
        banner_url=payload.banner_url
    )
    db.add(evt)
    db.commit()
    db.refresh(evt)
    return evt
