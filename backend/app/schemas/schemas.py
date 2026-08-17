from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# Auth & User Schemas
class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str = "Student"  # Admin, Faculty, Student
    department_id: Optional[int] = None
    roll_number: Optional[str] = None
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    role: Optional[str] = "Student"

class GoogleLoginRequest(BaseModel):
    token: str
    full_name: str
    email: EmailStr
    profile_pic_url: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    profile_pic_url: Optional[str] = None
    department_id: Optional[int] = None

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    department_id: Optional[int] = None
    phone: Optional[str] = None
    profile_pic_url: Optional[str] = None
    roll_number: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Department Schemas
class DepartmentCreate(BaseModel):
    name: str
    code: str
    description: Optional[str] = None

class DepartmentResponse(BaseModel):
    id: int
    name: str
    code: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

# Notice Schemas
class NoticeCreate(BaseModel):
    title: str
    description: str
    department_id: Optional[int] = None
    category: str = "Academic"
    priority: str = "Normal"
    is_pinned: bool = False
    scheduled_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    attachment_url: Optional[str] = None
    attachment_name: Optional[str] = None
    attachment_type: Optional[str] = None

class NoticeUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    department_id: Optional[int] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    is_pinned: Optional[bool] = None
    is_archived: Optional[bool] = None
    scheduled_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    attachment_url: Optional[str] = None

class NoticeResponse(BaseModel):
    id: int
    title: str
    description: str
    department_id: Optional[int] = None
    category: str
    priority: str
    author_id: int
    author_name: Optional[str] = None
    department_name: Optional[str] = None
    is_pinned: bool
    is_archived: bool
    scheduled_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    attachment_url: Optional[str] = None
    attachment_name: Optional[str] = None
    attachment_type: Optional[str] = None
    views_count: int
    created_at: datetime
    is_bookmarked: Optional[bool] = False

    class Config:
        from_attributes = True

# Assignment Schemas
class AssignmentCreate(BaseModel):
    title: str
    description: str
    subject: str
    department_id: int
    due_date: datetime
    max_marks: int = 100
    attachment_url: Optional[str] = None

class AssignmentSubmissionCreate(BaseModel):
    assignment_id: int
    file_url: str
    notes: Optional[str] = None

class AssignmentResponse(BaseModel):
    id: int
    title: str
    description: str
    subject: str
    department_id: int
    faculty_id: int
    due_date: datetime
    max_marks: int
    attachment_url: Optional[str] = None
    created_at: datetime
    submitted: Optional[bool] = False

    class Config:
        from_attributes = True

# Attendance Schemas
class AttendanceMark(BaseModel):
    student_id: int
    subject: str
    class_section: Optional[str] = "CS-A"
    date: str  # YYYY-MM-DD
    status: str  # Present, Absent, Late
    remarks: Optional[str] = None

class AttendanceBatchMark(BaseModel):
    subject: str
    class_section: str = "CS-A"
    date: str
    records: List[dict]  # list of {student_id, status}

class AttendanceResponse(BaseModel):
    id: int
    student_id: int
    subject: str
    class_section: Optional[str] = "CS-A"
    date: str
    status: str
    remarks: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Timetable Schemas
class TimetableCreate(BaseModel):
    department_id: int
    day_of_week: str
    time_slot: str
    subject: str
    faculty_name: str
    room_number: str

class TimetableResponse(BaseModel):
    id: int
    department_id: int
    day_of_week: str
    time_slot: str
    subject: str
    faculty_name: str
    room_number: str

    class Config:
        from_attributes = True

# Event Schemas
class EventCreate(BaseModel):
    title: str
    description: str
    event_type: str = "Workshop"
    event_date: datetime
    location: str
    organizer: str
    max_participants: int = 100
    banner_url: Optional[str] = None

class EventResponse(BaseModel):
    id: int
    title: str
    description: str
    event_type: str
    event_date: datetime
    location: str
    organizer: str
    max_participants: int
    banner_url: Optional[str] = None
    registered_count: Optional[int] = 0
    is_registered: Optional[bool] = False
    qr_pass: Optional[str] = None

    class Config:
        from_attributes = True

# Placement Schemas
class PlacementCreate(BaseModel):
    company_name: str
    job_role: str
    eligibility_criteria: str
    salary_package: str
    deadline: datetime
    interview_schedule: Optional[str] = None
    apply_link: Optional[str] = None
    company_logo_url: Optional[str] = None

class PlacementResponse(BaseModel):
    id: int
    company_name: str
    job_role: str
    eligibility_criteria: str
    salary_package: str
    deadline: datetime
    interview_schedule: Optional[str] = None
    apply_link: Optional[str] = None
    company_logo_url: Optional[str] = None
    has_applied: Optional[bool] = False
    created_at: datetime

    class Config:
        from_attributes = True

# Result Schemas
class ResultResponse(BaseModel):
    id: int
    student_id: int
    subject: str
    semester: str
    grade: str
    marks_obtained: float
    total_marks: float
    created_at: datetime

    class Config:
        from_attributes = True

# Document Schemas
class DocumentCreate(BaseModel):
    title: str
    category: str = "General"
    file_url: str
    department_id: Optional[int] = None

class DocumentResponse(BaseModel):
    id: int
    title: str
    category: str
    file_url: str
    department_id: Optional[int] = None
    uploaded_by: int
    created_at: datetime

    class Config:
        from_attributes = True

# AI & Voice Schemas
class AIChatRequest(BaseModel):
    query: Optional[str] = None
    question: Optional[str] = None
    conversation_id: Optional[int] = None
    language: Optional[str] = "en"
    history: Optional[List[dict]] = []  # [{"role": "user"|"assistant", "content": "..."}]

class AIChatResponse(BaseModel):
    query: str
    answer: str
    suggested_questions: List[str] = []
    conversation_id: Optional[int] = None
    message_id: Optional[int] = None

# Conversation Schemas
class ChatConversationCreate(BaseModel):
    title: Optional[str] = "New Conversation"

class ChatConversationRename(BaseModel):
    title: str

class ChatMessageResponse(BaseModel):
    id: int
    conversation_id: int
    role: str
    content: str
    feedback: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ChatConversationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: Optional[int] = 0
    last_message: Optional[str] = None

    class Config:
        from_attributes = True

class ChatStreamRequest(BaseModel):
    message: str
    conversation_id: Optional[int] = None
    language: Optional[str] = "en"

class MessageFeedbackRequest(BaseModel):
    feedback: str  # "like" or "dislike"

class VoiceCommandRequest(BaseModel):
    command: str

class VoiceCommandResponse(BaseModel):
    command: str
    action: str  # NAVIGATE, READ, SEARCH, THEME, LOGOUT
    target: Optional[str] = None
    data: Optional[dict] = None
    message: str

class AssistantQueryRequest(BaseModel):
    message: str
    language: Optional[str] = "en"
    platform: Optional[str] = "web"
    conversation_history: Optional[List[dict]] = []

class AssistantIntentResponse(BaseModel):
    intent: str
    response: str
    data: Optional[dict] = None
    navigation: Optional[str] = None
    requires_confirmation: bool = False
    confirmation_payload: Optional[dict] = None
    language: str = "en"

class AssistantContextResponse(BaseModel):
    user_id: int
    user_name: str
    role: str
    department_name: Optional[str] = None
    attendance_summary: Optional[dict] = None
    pending_assignments_count: int = 0
    upcoming_events_count: int = 0
    unread_notices_count: int = 0


# Feedback Schema
class FeedbackCreate(BaseModel):
    message: str
    rating: int = 5

class FeedbackResponse(BaseModel):
    id: int
    user_id: int
    user_name: Optional[str] = None
    message: str
    rating: int
    created_at: datetime

    class Config:
        from_attributes = True

# Alert Schema
class EmergencyAlertCreate(BaseModel):
    title: str
    message: str

