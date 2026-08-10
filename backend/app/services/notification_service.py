from sqlalchemy.orm import Session
from app.models.models import Notification

class NotificationService:
    @staticmethod
    def send_notification(db: Session, title: str, body: str, notification_type: str = "Notice", user_id: int = None):
        notif = Notification(
            user_id=user_id,
            title=title,
            body=body,
            type=notification_type
        )
        db.add(notif)
        db.commit()
        db.refresh(notif)
        print(f"[NOTIFICATION] Dispatched: [{notification_type}] {title} -> Target User: {user_id or 'BROADCAST'}")
        return notif

notification_service = NotificationService()
