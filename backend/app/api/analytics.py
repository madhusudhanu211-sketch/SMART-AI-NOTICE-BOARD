from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import User, Notice, Event, Assignment, Placement, Attendance
from app.api.auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics Dashboard"])

@router.get("/summary")
@router.get("/dashboard")
def get_analytics_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total_students = db.query(User).filter(User.role == "Student").count()
    total_faculty = db.query(User).filter(User.role == "Faculty").count()
    total_notices = db.query(Notice).count()
    active_notices = db.query(Notice).filter(Notice.is_archived == False).count()
    total_events = db.query(Event).count()
    total_placements = db.query(Placement).count()
    total_assignments = db.query(Assignment).count()

    total_views = sum(n.views_count for n in db.query(Notice).all())

    # Category breakdown chart data
    categories = ["Academic", "Examination", "Placements", "Circulars", "Events", "Sports", "Emergency"]
    cat_data = []
    for cat in categories:
        count = db.query(Notice).filter(Notice.category == cat).count()
        cat_data.append({"category": cat, "count": count})

    # Monthly statistics mock/real trends
    monthly_stats = [
        {"month": "Jan", "notices": 12, "views": 450},
        {"month": "Feb", "notices": 19, "views": 620},
        {"month": "Mar", "notices": 25, "views": 890},
        {"month": "Apr", "notices": 22, "views": 780},
        {"month": "May", "notices": 30, "views": 1150},
        {"month": "Jun", "notices": 18, "views": 940},
        {"month": "Jul", "notices": total_notices, "views": total_views}
    ]

    return {
        "total_students": total_students,
        "total_faculty": total_faculty,
        "total_notices": total_notices,
        "active_notices": active_notices,
        "total_events": total_events,
        "total_placements": total_placements,
        "total_assignments": total_assignments,
        "total_notice_views": total_views,
        "category_distribution": cat_data,
        "monthly_stats": monthly_stats
    }
