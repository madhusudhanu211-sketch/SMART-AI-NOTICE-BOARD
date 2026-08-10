import os
import io
import pandas as pd
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from sqlalchemy.orm import Session
from app.models.models import Notice, User, Event, Attendance, AssignmentSubmission, EventRegistration

class ReportService:
    @staticmethod
    def generate_notices_pdf(db: Session) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
        styles = getSampleStyleSheet()
        elements = []

        # Title
        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Heading1'],
            fontSize=20,
            leading=24,
            textColor=colors.HexColor('#0F172A'),
            alignment=1, # Center
            spaceAfter=15
        )
        elements.append(Paragraph("Smart Notice Board - Official Notices Report", title_style))
        elements.append(Spacer(1, 10))

        # Fetch Notices
        notices = db.query(Notice).order_by(Notice.created_at.desc()).all()
        
        table_data = [["ID", "Category", "Title", "Priority", "Created At"]]
        for n in notices:
            table_data.append([
                str(n.id),
                n.category,
                Paragraph(n.title, styles['Normal']),
                n.priority,
                n.created_at.strftime("%Y-%m-%d")
            ])

        t = Table(table_data, colWidths=[30, 80, 250, 70, 90])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#6366F1')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 10),
            ('BOTTOMPADDING', (0,0), (-1,0), 8),
            ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#F8FAFC')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ]))
        elements.append(t)
        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()

    @staticmethod
    def generate_notices_excel(db: Session) -> bytes:
        notices = db.query(Notice).order_by(Notice.created_at.desc()).all()
        data = []
        for n in notices:
            data.append({
                "Notice ID": n.id,
                "Title": n.title,
                "Category": n.category,
                "Priority": n.priority,
                "Author ID": n.author_id,
                "Pinned": n.is_pinned,
                "Views": n.views_count,
                "Created At": n.created_at.strftime("%Y-%m-%d %H:%M")
            })
        df = pd.DataFrame(data)
        buffer = io.BytesIO()
        with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Notices')
        buffer.seek(0)
        return buffer.getvalue()

    @staticmethod
    def generate_attendance_report(db: Session) -> bytes:
        records = db.query(Attendance).order_by(Attendance.created_at.desc()).all()
        data = []
        for r in records:
            student = db.query(User).filter(User.id == r.student_id).first()
            data.append({
                "Record ID": r.id,
                "Student Name": student.full_name if student else "Unknown",
                "Roll Number": student.roll_number if student else "N/A",
                "Subject": r.subject,
                "Date": r.date,
                "Status": r.status,
                "Remarks": r.remarks or ""
            })
        df = pd.DataFrame(data)
        buffer = io.BytesIO()
        with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Attendance')
        buffer.seek(0)
        return buffer.getvalue()

    @staticmethod
    def generate_event_report(db: Session) -> bytes:
        events = db.query(Event).all()
        data = []
        for e in events:
            reg_count = db.query(EventRegistration).filter(EventRegistration.event_id == e.id).count()
            data.append({
                "Event ID": e.id,
                "Title": e.title,
                "Type": e.event_type,
                "Date": e.event_date.strftime("%Y-%m-%d"),
                "Location": e.location,
                "Organizer": e.organizer,
                "Max Capacity": e.max_participants,
                "Registered Students": reg_count
            })
        df = pd.DataFrame(data)
        buffer = io.BytesIO()
        with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Events')
        buffer.seek(0)
        return buffer.getvalue()

report_service = ReportService()
