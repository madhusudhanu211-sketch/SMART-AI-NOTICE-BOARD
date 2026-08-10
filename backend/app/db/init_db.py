from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.db.session import engine, Base
from app.models.models import (
    User, Department, Notice, NoticeCategory, Assignment,
    Attendance, Timetable, Event, Placement, Notification,
    Result, Document
)
from app.core.security import get_password_hash

def init_db(db: Session):
    Base.metadata.create_all(bind=engine)

    # 1. Seed Departments
    if db.query(Department).count() == 0:
        depts = [
            Department(name="Computer Science & Engineering", code="CSE", description="Department of CSE"),
            Department(name="Electronics & Communication", code="ECE", description="Department of ECE"),
            Department(name="Mechanical Engineering", code="MECH", description="Department of MECH"),
            Department(name="Civil Engineering", code="CIVIL", description="Department of CIVIL"),
            Department(name="Information Technology", code="IT", description="Department of IT")
        ]
        db.add_all(depts)
        db.commit()

    cse_dept = db.query(Department).filter(Department.code == "CSE").first()
    ece_dept = db.query(Department).filter(Department.code == "ECE").first()

    # 2. Seed Users (Admin, Faculty, Student)
    if db.query(User).count() == 0:
        pwd = get_password_hash("Password123!")
        pwd_simple = get_password_hash("password123")
        
        admin = User(
            full_name="Dr. Arthur Pendelton",
            email="admin@smartnoticeboard.edu",
            hashed_password=pwd,
            role="Admin",
            phone="+91 9876543210"
        )
        
        faculty = User(
            full_name="Prof. Sarah Jenkins",
            email="faculty@smartnoticeboard.edu",
            hashed_password=pwd,
            role="Faculty",
            department_id=cse_dept.id if cse_dept else 1,
            phone="+91 9876543211"
        )

        student = User(
            full_name="Alex Mercer",
            email="student@smartnoticeboard.edu",
            hashed_password=pwd,
            role="Student",
            department_id=cse_dept.id if cse_dept else 1,
            roll_number="21CSE042",
            phone="+91 9876543212"
        )

        student_campus = User(
            full_name="Alex Mercer",
            email="student@campus.edu",
            hashed_password=pwd_simple,
            role="Student",
            department_id=cse_dept.id if cse_dept else 1,
            roll_number="21CSE042",
            phone="+91 9876543212"
        )

        faculty_campus = User(
            full_name="Prof. Sarah Jenkins",
            email="faculty@campus.edu",
            hashed_password=pwd_simple,
            role="Faculty",
            department_id=cse_dept.id if cse_dept else 1,
            phone="+91 9876543211"
        )

        admin_campus = User(
            full_name="Dr. Arthur Pendelton",
            email="admin@campus.edu",
            hashed_password=pwd_simple,
            role="Admin",
            phone="+91 9876543210"
        )

        db.add_all([admin, faculty, student, student_campus, faculty_campus, admin_campus])
        db.commit()

    admin_user = db.query(User).filter(User.role == "Admin").first()
    faculty_user = db.query(User).filter(User.role == "Faculty").first()
    student_user = db.query(User).filter(User.role == "Student").first()

    # 3. Seed Categories
    if db.query(NoticeCategory).count() == 0:
        cats = [
            NoticeCategory(name="Academic", icon="book-open"),
            NoticeCategory(name="Examination", icon="file-text"),
            NoticeCategory(name="Placements", icon="briefcase"),
            NoticeCategory(name="Circulars", icon="bell"),
            NoticeCategory(name="Events", icon="calendar"),
            NoticeCategory(name="Holidays", icon="sun"),
            NoticeCategory(name="Scholarships", icon="award"),
            NoticeCategory(name="Sports", icon="activity"),
            NoticeCategory(name="Workshops", icon="cpu"),
            NoticeCategory(name="Emergency", icon="alert-triangle")
        ]
        db.add_all(cats)
        db.commit()

    # 4. Seed Notices
    if db.query(Notice).count() == 0 and admin_user:
        notices = [
            Notice(
                title="🚨 Urgent Campus Maintenance Notice",
                description="Power supply maintenance will occur on Block A & B this Saturday from 10:00 AM to 2:00 PM. Laboratories will remain closed.",
                category="Emergency",
                priority="Urgent",
                is_pinned=True,
                author_id=admin_user.id,
                department_id=None
            ),
            Notice(
                title="End Semester Mid-Term Examination Schedule Released",
                description="The mid-term examination timetable for 3rd and 4th year CSE students has been finalized. Hall tickets are available in student portal.",
                category="Examination",
                priority="High",
                is_pinned=True,
                author_id=admin_user.id,
                department_id=cse_dept.id if cse_dept else None,
                attachment_url="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                attachment_name="CSE_MidTerm_Timetable.pdf",
                attachment_type="pdf"
            ),
            Notice(
                title="Google & Microsoft On-Campus Placement Drive 2026",
                description="Registration is open for final year CSE & ECE students. Min CGPA: 7.5. Package offered up to 28 LPA.",
                category="Placements",
                priority="High",
                is_pinned=False,
                author_id=admin_user.id,
                department_id=None,
                attachment_url="https://images.unsplash.com/photo-1522071820081-009f0129c71c",
                attachment_name="Placement_Flyer.jpg",
                attachment_type="image"
            ),
            Notice(
                title="Annual Inter-College Hackathon 2026 Registration",
                description="Join the 48-hour AI & Cloud Innovation Hackathon with cash prizes up to $5,000. Register your team of 4 by August 15.",
                category="Events",
                priority="Normal",
                is_pinned=False,
                author_id=faculty_user.id if faculty_user else admin_user.id,
                department_id=cse_dept.id if cse_dept else None
            ),
            Notice(
                title="National Merit Scholarship Application Window Open",
                description="Eligible students with family annual income under 5 LPA can apply for the merit-cum-means scholarship before Sept 1st.",
                category="Scholarships",
                priority="Normal",
                is_pinned=False,
                author_id=admin_user.id
            )
        ]
        db.add_all(notices)
        db.commit()

    # 5. Seed Timetable
    if db.query(Timetable).count() == 0 and cse_dept:
        slots = [
            Timetable(department_id=cse_dept.id, day_of_week="Monday", time_slot="09:00 AM - 10:00 AM", subject="Data Structures", faculty_name="Prof. Sarah Jenkins", room_number="Lab 101"),
            Timetable(department_id=cse_dept.id, day_of_week="Monday", time_slot="10:15 AM - 11:15 AM", subject="Operating Systems", faculty_name="Dr. Mark Vance", room_number="Room 304"),
            Timetable(department_id=cse_dept.id, day_of_week="Monday", time_slot="11:30 AM - 12:30 PM", subject="Artificial Intelligence", faculty_name="Dr. Helen Carter", room_number="Auditorium B"),
            Timetable(department_id=cse_dept.id, day_of_week="Tuesday", time_slot="09:00 AM - 10:00 AM", subject="Database Systems", faculty_name="Prof. Sarah Jenkins", room_number="Lab 102"),
            Timetable(department_id=cse_dept.id, day_of_week="Wednesday", time_slot="02:00 PM - 04:00 PM", subject="Python Web FullStack Lab", faculty_name="Prof. Sarah Jenkins", room_number="Lab 205")
        ]
        db.add_all(slots)
        db.commit()

    # 6. Seed Assignments
    if db.query(Assignment).count() == 0 and faculty_user and cse_dept:
        assign = Assignment(
            title="Design & Implement RESTful API for Smart Notice Board",
            description="Build FastAPI endpoints for User Authentication, Notice Filters, and Gemini AI Chatbot integration.",
            subject="Web Architecture",
            department_id=cse_dept.id,
            faculty_id=faculty_user.id,
            due_date=datetime.utcnow() + timedelta(days=5),
            max_marks=100
        )
        db.add(assign)
        db.commit()

    # 7. Seed Attendance
    if db.query(Attendance).count() == 0 and student_user and faculty_user:
        today_str = datetime.utcnow().strftime("%Y-%m-%d")
        atts = [
            Attendance(student_id=student_user.id, faculty_id=faculty_user.id, subject="Data Structures", date=today_str, status="Present"),
            Attendance(student_id=student_user.id, faculty_id=faculty_user.id, subject="Operating Systems", date=today_str, status="Present"),
            Attendance(student_id=student_user.id, faculty_id=faculty_user.id, subject="Artificial Intelligence", date=today_str, status="Absent", remarks="Medical Leave")
        ]
        db.add_all(atts)
        db.commit()

    # 8. Seed Events
    if db.query(Event).count() == 0:
        evt = Event(
            title="AI & Gemini 3.6 Workshop 2026",
            description="Hands-on workshop building AI-agentic apps with Google Gemini and Python FastAPI.",
            event_type="Workshop",
            event_date=datetime.utcnow() + timedelta(days=7),
            location="Main Auditorium",
            organizer="CSE Tech Club",
            max_participants=200,
            banner_url="https://images.unsplash.com/photo-1540575467063-178a50c2df87"
        )
        db.add(evt)
        db.commit()

    # 9. Seed Placements
    if db.query(Placement).count() == 0:
        plc = Placement(
            company_name="Google Cloud Systems",
            job_role="Software Engineer - AI Platforms",
            eligibility_criteria="B.Tech CSE/IT with CGPA >= 8.0. No active backlogs.",
            salary_package="24.5 LPA",
            deadline=datetime.utcnow() + timedelta(days=12),
            interview_schedule="Online Assessment on August 15, Technical Interview on August 20.",
            company_logo_url="https://www.google.com/favicon.ico"
        )
        db.add(plc)
        db.commit()

    # 10. Seed Results
    if db.query(Result).count() == 0 and student_user:
        results = [
            Result(student_id=student_user.id, subject="Data Structures", semester="Semester V", grade="A+", marks_obtained=92.0, total_marks=100.0),
            Result(student_id=student_user.id, subject="Operating Systems", semester="Semester V", grade="A", marks_obtained=85.0, total_marks=100.0),
            Result(student_id=student_user.id, subject="Database Systems", semester="Semester V", grade="O", marks_obtained=96.0, total_marks=100.0)
        ]
        db.add_all(results)
        db.commit()

    # 11. Seed Documents
    if db.query(Document).count() == 0 and admin_user:
        docs = [
            Document(title="Academic Calendar 2026-2027", category="Syllabus & Rules", file_url="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", department_id=cse_dept.id if cse_dept else None, uploaded_by=admin_user.id),
            Document(title="Campus Anti-Ragging Guidelines & Conduct Policy", category="Policies", file_url="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", department_id=None, uploaded_by=admin_user.id)
        ]
        db.add_all(docs)
        db.commit()
