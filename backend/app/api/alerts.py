from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.models import Notification, User
from app.schemas.schemas import EmergencyAlertCreate
from app.api.auth import get_current_user
from app.services.notification_service import notification_service

router = APIRouter(prefix="/alerts", tags=["Emergency Alerts & Notifications"])

@router.post("/emergency")
def send_emergency_alert(payload: EmergencyAlertCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Only Admins can issue emergency alerts")

    notif = notification_service.send_notification(
        db,
        title=f"🚨 EMERGENCY ALERT: {payload.title}",
        body=payload.message,
        notification_type="Emergency"
    )
    return {"message": "Emergency alert broadcasted instantly to all users!", "alert": notif}

@router.get("/", response_model=List[dict])
def get_user_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    notifs = db.query(Notification).filter(
        (Notification.user_id == current_user.id) | (Notification.user_id == None)
    ).order_by(Notification.created_at.desc()).limit(30).all()

    return [
        {
            "id": n.id,
            "title": n.title,
            "body": n.body,
            "type": n.type,
            "is_read": n.is_read,
            "created_at": n.created_at
        } for n in notifs
    ]
