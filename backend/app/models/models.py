from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="Student")  # Admin, Faculty, Student
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    phone = Column(String(20), nullable=True)
    profile_pic_url = Column(String(255), nullable=True)
    roll_number = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    otp_code = Column(String(6), nullable=True)
    otp_expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    department = relationship("Department", back_populates="users")
    notices = relationship("Notice", back_populates="author")
    submissions = relationship("AssignmentSubmission", back_populates="student")
    event_registrations = relationship("EventRegistration", back_populates="student")
    placement_applications = relationship("PlacementApplication", back_populates="student")
    results = relationship("Result", back_populates="student")

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    code = Column(String(20), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="department")
    notices = relationship("Notice", back_populates="department")
    documents = relationship("Document", back_populates="department")

class NoticeCategory(Base):
    __tablename__ = "notice_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    icon = Column(String(50), default="bell")

class Notice(Base):
    __tablename__ = "notices"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    category = Column(String(50), nullable=False, default="Academic")
    priority = Column(String(20), nullable=False, default="Normal")  # Low, Normal, High, Urgent
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_pinned = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)
    scheduled_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    attachment_url = Column(String(255), nullable=True)
    attachment_name = Column(String(100), nullable=True)
    attachment_type = Column(String(20), nullable=True)  # pdf, image, doc, video
    views_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    author = relationship("User", back_populates="notices")
    department = relationship("Department", back_populates="notices")

class NoticeBookmark(Base):
    __tablename__ = "notice_bookmarks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    notice_id = Column(Integer, ForeignKey("notices.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    subject = Column(String(100), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    faculty_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    due_date = Column(DateTime, nullable=False)
    max_marks = Column(Integer, default=100)
    attachment_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    submissions = relationship("AssignmentSubmission", back_populates="assignment")

class AssignmentSubmission(Base):
    __tablename__ = "assignment_submissions"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_url = Column(String(255), nullable=False)
    notes = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    marks_obtained = Column(Float, nullable=True)
    feedback = Column(Text, nullable=True)

    assignment = relationship("Assignment", back_populates="submissions")
    student = relationship("User", back_populates="submissions")

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float, UniqueConstraint

class Attendance(Base):
    __tablename__ = "attendance"
    __table_args__ = (
        UniqueConstraint('student_id', 'subject', 'date', name='uq_student_subject_date'),
    )

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    faculty_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String(100), nullable=False)
    class_section = Column(String(50), nullable=False, default="CS-A")
    date = Column(String(10), nullable=False)  # YYYY-MM-DD
    status = Column(String(20), nullable=False)  # Present, Absent, Late
    remarks = Column(String(200), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Timetable(Base):
    __tablename__ = "timetables"

    id = Column(Integer, primary_key=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    day_of_week = Column(String(20), nullable=False)  # Monday, Tuesday...
    time_slot = Column(String(50), nullable=False)  # 09:00 AM - 10:00 AM
    subject = Column(String(100), nullable=False)
    faculty_name = Column(String(100), nullable=False)
    room_number = Column(String(50), nullable=False)

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    event_type = Column(String(50), nullable=False, default="Workshop")  # Workshop, Seminar, Hackathon, Cultural
    event_date = Column(DateTime, nullable=False)
    location = Column(String(150), nullable=False)
    organizer = Column(String(100), nullable=False)
    max_participants = Column(Integer, default=100)
    banner_url = Column(String(255), nullable=True)
    qr_code_token = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    registrations = relationship("EventRegistration", back_populates="event")

class EventRegistration(Base):
    __tablename__ = "event_registrations"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    pass_code = Column(String(50), nullable=False)
    checked_in = Column(Boolean, default=False)
    registered_at = Column(DateTime, default=datetime.utcnow)

    event = relationship("Event", back_populates="registrations")
    student = relationship("User", back_populates="event_registrations")

class Placement(Base):
    __tablename__ = "placements"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(100), nullable=False)
    job_role = Column(String(100), nullable=False)
    eligibility_criteria = Column(Text, nullable=False)
    salary_package = Column(String(50), nullable=False)
    deadline = Column(DateTime, nullable=False)
    interview_schedule = Column(String(200), nullable=True)
    apply_link = Column(String(255), nullable=True)
    company_logo_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    applications = relationship("PlacementApplication", back_populates="placement")

class PlacementApplication(Base):
    __tablename__ = "placement_applications"

    id = Column(Integer, primary_key=True, index=True)
    placement_id = Column(Integer, ForeignKey("placements.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    resume_url = Column(String(255), nullable=False)
    status = Column(String(30), default="Applied")  # Applied, Shortlisted, Interviewed, Selected, Rejected
    applied_at = Column(DateTime, default=datetime.utcnow)

    placement = relationship("Placement", back_populates="applications")
    student = relationship("User", back_populates="placement_applications")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Null means broadcast to all
    title = Column(String(150), nullable=False)
    body = Column(Text, nullable=False)
    type = Column(String(30), default="Notice")  # Emergency, Notice, Assignment, Event, Placement
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user_query = Column(Text, nullable=False)
    bot_response = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class ChatConversation(Base):
    __tablename__ = "chat_conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False, default="New Conversation")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    messages = relationship("ChatMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="ChatMessage.created_at")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("chat_conversations.id"), nullable=False)
    role = Column(String(20), nullable=False)  # "user" or "assistant"
    content = Column(Text, nullable=False)
    feedback = Column(String(10), nullable=True)  # "like", "dislike", or None
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("ChatConversation", back_populates="messages")

class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    rating = Column(Integer, default=5)
    created_at = Column(DateTime, default=datetime.utcnow)

class Result(Base):
    __tablename__ = "results"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String(100), nullable=False)
    semester = Column(String(50), nullable=False)
    grade = Column(String(10), nullable=False)
    marks_obtained = Column(Float, nullable=False)
    total_marks = Column(Float, default=100.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("User", back_populates="results")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False, default="General")
    file_url = Column(String(255), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    department = relationship("Department", back_populates="documents")

class VoiceCommand(Base):
    __tablename__ = "voice_commands"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    transcript = Column(String(255), nullable=False)
    intent = Column(String(100), nullable=False)
    action_taken = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(200), nullable=False)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
