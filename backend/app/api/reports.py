from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.auth import get_current_user
from app.models.models import User
from app.services.report_service import report_service

router = APIRouter(prefix="/reports", tags=["Reports Export"])

@router.get("/notices/pdf")
def export_notices_pdf(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    pdf_bytes = report_service.generate_notices_pdf(db)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=notices_report.pdf"}
    )

@router.get("/notices/excel")
def export_notices_excel(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    excel_bytes = report_service.generate_notices_excel(db)
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=notices_report.xlsx"}
    )

@router.get("/attendance/excel")
def export_attendance_excel(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    excel_bytes = report_service.generate_attendance_report(db)
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=attendance_report.xlsx"}
    )

@router.get("/events/excel")
def export_events_excel(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    excel_bytes = report_service.generate_event_report(db)
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=events_report.xlsx"}
    )
