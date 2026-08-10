from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.models import Notice, User, Department, NoticeBookmark
from app.schemas.schemas import NoticeCreate, NoticeUpdate, NoticeResponse
from app.api.auth import get_current_user
from app.services.notification_service import notification_service

router = APIRouter(prefix="/notices", tags=["Notices"])

@router.get("", response_model=List[NoticeResponse])
@router.get("/", response_model=List[NoticeResponse])
def list_notices(
    category: Optional[str] = None,
    priority: Optional[str] = None,
    department_id: Optional[int] = None,
    search: Optional[str] = None,
    is_archived: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(Notice).filter(Notice.is_archived == is_archived)

    if category and category != "ALL":
        query = query.filter(Notice.category == category)
    if priority and priority != "ALL":
        query = query.filter(Notice.priority == priority)
    if department_id:
        query = query.filter(Notice.department_id == department_id)
    if search:
        search_term = f"%{search}%"
        query = query.filter((Notice.title.ilike(search_term)) | (Notice.description.ilike(search_term)))

    notices = query.order_by(Notice.is_pinned.desc(), Notice.created_at.desc()).all()

    res = []
    for n in notices:
        author = db.query(User).filter(User.id == n.author_id).first()
        dept = db.query(Department).filter(Department.id == n.department_id).first() if n.department_id else None
        
        n_res = NoticeResponse.model_validate(n)
        n_res.author_name = author.full_name if author else "System Admin"
        n_res.department_name = dept.name if dept else "All Departments"
        res.append(n_res)

    return res

@router.get("/{notice_id}", response_model=NoticeResponse)
def get_notice_details(notice_id: int, db: Session = Depends(get_db)):
    notice = db.query(Notice).filter(Notice.id == notice_id).first()
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")

    notice.views_count += 1
    db.commit()

    author = db.query(User).filter(User.id == notice.author_id).first()
    dept = db.query(Department).filter(Department.id == notice.department_id).first() if notice.department_id else None

    n_res = NoticeResponse.model_validate(notice)
    n_res.author_name = author.full_name if author else "System Admin"
    n_res.department_name = dept.name if dept else "All Departments"
    return n_res

@router.post("", response_model=NoticeResponse)
@router.post("/", response_model=NoticeResponse)
def create_notice(payload: NoticeCreate, db: Session = Depends(get_db)):
    # Fallback default author to Admin user (id=1)
    admin_user = db.query(User).filter(User.role == "Admin").first()
    author_id = admin_user.id if admin_user else 1

    notice = Notice(
        title=payload.title,
        description=payload.description,
        department_id=payload.department_id,
        category=payload.category,
        priority=payload.priority,
        author_id=author_id,
        is_pinned=payload.is_pinned,
        scheduled_at=payload.scheduled_at,
        expires_at=payload.expires_at,
        attachment_url=payload.attachment_url,
        attachment_name=payload.attachment_name,
        attachment_type=payload.attachment_type
    )
    db.add(notice)
    db.commit()
    db.refresh(notice)

    notification_service.send_notification(
        db,
        title=f"📢 New Notice: {notice.title}",
        body=f"{notice.description[:100]}...",
        notification_type="Notice"
    )

    n_res = NoticeResponse.model_validate(notice)
    n_res.author_name = admin_user.full_name if admin_user else "System Admin"
    return n_res

@router.put("/{notice_id}", response_model=NoticeResponse)
def update_notice(notice_id: int, payload: NoticeUpdate, db: Session = Depends(get_db)):
    notice = db.query(Notice).filter(Notice.id == notice_id).first()
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")

    if payload.title is not None:
        notice.title = payload.title
    if payload.description is not None:
        notice.description = payload.description
    if payload.category is not None:
        notice.category = payload.category
    if payload.priority is not None:
        notice.priority = payload.priority
    if payload.is_pinned is not None:
        notice.is_pinned = payload.is_pinned
    if payload.is_archived is not None:
        notice.is_archived = payload.is_archived
    if payload.attachment_url is not None:
        notice.attachment_url = payload.attachment_url

    db.commit()
    db.refresh(notice)

    n_res = NoticeResponse.model_validate(notice)
    n_res.author_name = "System Admin"
    return n_res

@router.delete("/{notice_id}")
def delete_notice(notice_id: int, db: Session = Depends(get_db)):
    notice = db.query(Notice).filter(Notice.id == notice_id).first()
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")

    db.delete(notice)
    db.commit()
    return {"message": "Notice deleted successfully"}
