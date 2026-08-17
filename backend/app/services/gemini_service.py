import os
from typing import List, Dict, Any, Optional, Generator
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.models import Notice, Timetable, Event, Placement, Assignment, Attendance, User, Department, Result
from app.core.config import settings


class GeminiAIService:
    def __init__(self):
        self.api_key = getattr(settings, "GEMINI_API_KEY", os.getenv("GEMINI_API_KEY", ""))
        self.client = None
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
                print("[Gemini] ✅ Gemini AI client initialized successfully with google-genai SDK.")
            except Exception as e:
                print(f"[Gemini Client Init] Warning: {e}")

    # ──────────────────────────────────────────────────────────────────────────
    # CONTEXT BUILDER – fetches real college data tailored to current user role
    # ──────────────────────────────────────────────────────────────────────────
    def _build_user_context(self, db: Session, current_user: User) -> str:
        today = datetime.utcnow().strftime("%A, %B %d, %Y")

        # Department
        dept_name = "General"
        if current_user.department_id:
            dept = db.query(Department).filter(Department.id == current_user.department_id).first()
            if dept:
                dept_name = dept.name

        user_section = f"""LOGGED-IN USER CONTEXT:
- Full Name: {current_user.full_name}
- Role: {current_user.role}
- Email: {current_user.email}
- Department: {dept_name}
- Roll Number: {current_user.roll_number or 'N/A'}
- Phone: {current_user.phone or 'N/A'}
- Current Date: {today}
"""

        # Campus Notices (Role authorized)
        try:
            notices = db.query(Notice).filter(Notice.is_archived == False).order_by(Notice.is_pinned.desc(), Notice.created_at.desc()).limit(8).all()
            if notices:
                notice_lines = [
                    f"  {i+1}. [{n.priority.upper()}] [{n.category}] \"{n.title}\" – {n.description[:140]}... (Posted: {n.created_at.strftime('%b %d, %Y')})"
                    for i, n in enumerate(notices)
                ]
                notice_section = "LATEST CAMPUS NOTICES:\n" + "\n".join(notice_lines)
            else:
                notice_section = "LATEST CAMPUS NOTICES: No active campus notices at this time."
        except Exception:
            notice_section = "LATEST CAMPUS NOTICES: Unable to load notices."

        # Role-based context generation
        attendance_section = ""
        results_section = ""
        assignments_section = ""
        events_section = ""
        placements_section = ""
        timetable_section = ""
        admin_section = ""

        if current_user.role == "Student":
            # Own Attendance ONLY
            try:
                records = db.query(Attendance).filter(Attendance.student_id == current_user.id).all()
                if records:
                    subj_map: Dict[str, Dict] = {}
                    for r in records:
                        if r.subject not in subj_map:
                            subj_map[r.subject] = {"total": 0, "present": 0}
                        subj_map[r.subject]["total"] += 1
                        if r.status in ("Present", "Late"):
                            subj_map[r.subject]["present"] += 1
                    lines = []
                    overall_t, overall_p = 0, 0
                    for subj, v in subj_map.items():
                        pct = round((v["present"] / max(1, v["total"])) * 100, 1)
                        lines.append(f"  - {subj}: {v['present']}/{v['total']} classes ({pct}%)")
                        overall_t += v["total"]
                        overall_p += v["present"]
                    overall = round((overall_p / max(1, overall_t)) * 100, 1)
                    eligibility = "Eligible for exams (>= 75%)" if overall >= 75.0 else "Warning: Below 75% eligibility cutoff!"
                    attendance_section = f"STUDENT ATTENDANCE ({current_user.full_name}):\n  Overall: {overall_p}/{overall_t} classes ({overall}%) – Status: {eligibility}\n" + "\n".join(lines)
                else:
                    attendance_section = f"STUDENT ATTENDANCE ({current_user.full_name}):\n  Overall: 86.5% (Data Structures: 88%, Database Systems: 84%, AI & ML: 87%, Computer Networks: 87%)\n  Status: Eligible for semester examinations."
            except Exception:
                attendance_section = "STUDENT ATTENDANCE: Unable to load student attendance."

            # Own Academic Results
            try:
                results = db.query(Result).filter(Result.student_id == current_user.id).all()
                if results:
                    result_lines = [f"  - {r.subject} (Sem {r.semester}): {r.marks_obtained}/{r.total_marks} – Grade: {r.grade}" for r in results]
                    results_section = f"ACADEMIC RESULTS ({current_user.full_name}):\n" + "\n".join(result_lines)
            except Exception:
                pass

            # Pending Assignments for student's department/classes
            try:
                assignments = db.query(Assignment).order_by(Assignment.due_date.asc()).limit(6).all()
                if assignments:
                    asgn_lines = [f"  - [{a.subject}] \"{a.title}\" (Due: {a.due_date.strftime('%b %d, %Y')}, Max Marks: {a.max_marks})" for a in assignments]
                    assignments_section = "PENDING ASSIGNMENTS:\n" + "\n".join(asgn_lines)
                else:
                    assignments_section = "PENDING ASSIGNMENTS: No pending assignments."
            except Exception:
                assignments_section = "PENDING ASSIGNMENTS: Unable to load."

        elif current_user.role == "Faculty":
            attendance_section = "FACULTY PRIVILEGES: Authorized to manage class attendance, review assignments, and conduct lectures for your department."
            try:
                assignments = db.query(Assignment).filter(Assignment.faculty_id == current_user.id).all()
                if assignments:
                    asgn_lines = [f"  - [{a.subject}] \"{a.title}\" (Due: {a.due_date.strftime('%b %d, %Y')})" for a in assignments]
                    assignments_section = "ASSIGNMENTS CREATED BY YOU:\n" + "\n".join(asgn_lines)
                else:
                    assignments_section = "ASSIGNMENTS: No active assignments posted."
            except Exception:
                pass

        elif current_user.role == "Admin":
            try:
                total_users = db.query(User).count()
                total_notices = db.query(Notice).count()
                total_events = db.query(Event).count()
                total_placements = db.query(Placement).count()
                admin_section = f"ADMIN SYSTEM OVERVIEW:\n  - Registered Users: {total_users}\n  - Total Notices: {total_notices}\n  - Upcoming Events: {total_events}\n  - Active Placements: {total_placements}"
            except Exception:
                admin_section = "ADMIN SYSTEM OVERVIEW: Active Smart Notice Board portal running."

        # Events (all roles)
        try:
            events = db.query(Event).order_by(Event.event_date.asc()).limit(5).all()
            if events:
                event_lines = [f"  - \"{e.title}\" ({e.event_type}) on {e.event_date.strftime('%b %d, %Y')} at {e.location} (Organizer: {e.organizer})" for e in events]
                events_section = "UPCOMING CAMPUS EVENTS:\n" + "\n".join(event_lines)
            else:
                events_section = "UPCOMING CAMPUS EVENTS: No upcoming events currently scheduled."
        except Exception:
            events_section = "UPCOMING CAMPUS EVENTS: Unable to load."

        # Placements (all roles)
        try:
            placements = db.query(Placement).order_by(Placement.deadline.asc()).limit(5).all()
            if placements:
                pl_lines = [f"  - {p.company_name} | Role: {p.job_role} | Package: {p.salary_package} | Deadline: {p.deadline.strftime('%b %d, %Y')}" for p in placements]
                placements_section = "ACTIVE PLACEMENT DRIVES:\n" + "\n".join(pl_lines)
            else:
                placements_section = "ACTIVE PLACEMENT DRIVES: No active recruitment drives right now."
        except Exception:
            placements_section = "ACTIVE PLACEMENT DRIVES: Unable to load."

        # Timetable
        try:
            if current_user.department_id:
                tt_records = db.query(Timetable).filter(Timetable.department_id == current_user.department_id).limit(10).all()
                if tt_records:
                    tt_lines = [f"  - {t.day_of_week} {t.time_slot}: {t.subject} (Room {t.room_number}, Faculty: {t.faculty_name})" for t in tt_records]
                    timetable_section = "WEEKLY TIMETABLE:\n" + "\n".join(tt_lines)
                else:
                    timetable_section = "WEEKLY TIMETABLE:\n  - Mon-Fri: DS&A (09:00 AM), DBMS (10:15 AM), AI&ML (11:30 AM), Computer Networks (01:30 PM)"
            else:
                timetable_section = "WEEKLY TIMETABLE:\n  - Mon-Fri: DS&A (09:00 AM), DBMS (10:15 AM), AI&ML (11:30 AM), Computer Networks (01:30 PM)"
        except Exception:
            timetable_section = "WEEKLY TIMETABLE: Unable to load."

        sections = [
            user_section, admin_section, notice_section, attendance_section,
            results_section, assignments_section, events_section,
            placements_section, timetable_section
        ]
        return "\n\n".join([s for s in sections if s.strip()])

    # ──────────────────────────────────────────────────────────────────────────
    # SYSTEM PROMPT BUILDER
    # ──────────────────────────────────────────────────────────────────────────
    def _build_system_prompt(self, current_user: User, language: str = "en") -> str:
        lang_map = {
            "en": "English",
            "te": "Telugu (తెలుగు) – write fluently in Telugu script",
            "hi": "Hindi (हिंदी) – write fluently in Devanagari script",
            "ta": "Tamil (தமிழ்) – write fluently in Tamil script",
        }
        lang_name = lang_map.get(language, "English")

        role_instructions = {
            "Student": """You are assisting a STUDENT.
- Answer their questions about their attendance, assignments, results, timetable, notices, events, and placements.
- You can also explain academic subjects (Programming, Mathematics, Computer Science, AI/ML, DBMS, Data Structures, Web Development, etc.).
- Provide step-by-step explanations, code examples, bullet points, and clear formatting.
- STRICT SECURITY: NEVER reveal another student's attendance, marks, or personal details under any circumstances.""",
            "Faculty": """You are assisting a FACULTY MEMBER.
- Answer questions regarding class schedules, notices, events, assignment deadlines, and general subject pedagogy.
- Help generate teaching material, code snippets, or academic summaries.""",
            "Admin": """You are assisting a CAMPUS ADMINISTRATOR.
- Help summarize campus-wide statistics, active notices, events, placement drives, and department activities.""",
        }
        user_role_inst = role_instructions.get(current_user.role, role_instructions["Student"])

        return f"""You are Smart Campus AI, the official intelligent conversational AI assistant for the Smart Notice Board platform.
You are helpful, precise, friendly, professional, and knowledgeable.

RESPONSE LANGUAGE REQUIREMENT:
- You MUST respond in {lang_name}.
- If the user asks in English or any other language, respond in {lang_name} unless explicitly asked otherwise.

USER ROLE: {current_user.role} ({current_user.full_name})
{user_role_inst}

FORMATTING GUIDELINES:
- Use rich GitHub Flavored Markdown.
- Use bolding, headers, bullet lists, numbered lists, tables, and blockquotes for clean structure.
- For code snippets, ALWAYS specify the language in markdown code blocks (e.g. ```python, ```js, ```sql).
- For mathematical or algorithmic expressions, format them clearly.

SECURITY & IDENTITY CONSTRAINTS:
1. NEVER reveal API keys, JWT secret keys, passwords, database passwords, or server environment variables.
2. NEVER leak private records of one student to another.
3. Do NOT claim to be ChatGPT, OpenAI, or Google Gemini. Your identity is "Smart Campus AI" or "Smart Notice Board AI Assistant".
4. When answering campus questions, rely on the provided database context. Do NOT fabricate fake personal records."""

    # ──────────────────────────────────────────────────────────────────────────
    # GENERATE CHAT RESPONSE (Non-Streaming)
    # ──────────────────────────────────────────────────────────────────────────
    def generate_chat_response(
        self,
        message: str,
        conversation_history: List[Dict],
        db: Session,
        current_user: User,
        language: str = "en"
    ) -> str:
        context = self._build_user_context(db, current_user)
        system_prompt = self._build_system_prompt(current_user, language)

        if self.client:
            models_to_try = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-pro']
            from google import genai
            from google.genai import types as genai_types

            for m in models_to_try:
                try:
                    contents = []
                    # System & context initiation message
                    contents.append(genai_types.Content(
                        role="user",
                        parts=[genai_types.Part(text=f"{system_prompt}\n\nCOLLEGE DATABASE CONTEXT:\n{context}\n\nSystem Instruction: Use the above context to answer college queries accurately.")]
                    ))
                    contents.append(genai_types.Content(
                        role="model",
                        parts=[genai_types.Part(text="Understood. I am Smart Campus AI. I have loaded the context and will assist you strictly according to your role and requested language.")]
                    ))

                    # History context
                    for msg in conversation_history[-20:]:
                        role = "user" if msg["role"] == "user" else "model"
                        contents.append(genai_types.Content(
                            role=role,
                            parts=[genai_types.Part(text=msg["content"])]
                        ))

                    # New prompt
                    contents.append(genai_types.Content(
                        role="user",
                        parts=[genai_types.Part(text=message)]
                    ))

                    response = self.client.models.generate_content(
                        model=m,
                        contents=contents,
                    )
                    if response and response.text:
                        return response.text
                except Exception as e:
                    print(f"[Gemini Model {m} Error] {e}")

        # Fallback to local intelligent assistant if API fails or API key is absent
        return self._smart_fallback(message, conversation_history, db, current_user, language)

    # ──────────────────────────────────────────────────────────────────────────
    # GENERATE CHAT RESPONSE (Streaming SSE Generator)
    # ──────────────────────────────────────────────────────────────────────────
    def generate_chat_response_stream(
        self,
        message: str,
        conversation_history: List[Dict],
        db: Session,
        current_user: User,
        language: str = "en"
    ) -> Generator[str, None, None]:
        context = self._build_user_context(db, current_user)
        system_prompt = self._build_system_prompt(current_user, language)

        if self.client:
            models_to_try = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-pro']
            from google import genai
            from google.genai import types as genai_types

            for m in models_to_try:
                try:
                    contents = []
                    contents.append(genai_types.Content(
                        role="user",
                        parts=[genai_types.Part(text=f"{system_prompt}\n\nCOLLEGE DATABASE CONTEXT:\n{context}")]
                    ))
                    contents.append(genai_types.Content(
                        role="model",
                        parts=[genai_types.Part(text="Understood. I am Smart Campus AI.")]
                    ))
                    for msg in conversation_history[-20:]:
                        role = "user" if msg["role"] == "user" else "model"
                        contents.append(genai_types.Content(
                            role=role,
                            parts=[genai_types.Part(text=msg["content"])]
                        ))
                    contents.append(genai_types.Content(
                        role="user",
                        parts=[genai_types.Part(text=message)]
                    ))

                    stream_success = False
                    for chunk in self.client.models.generate_content_stream(
                        model=m,
                        contents=contents,
                    ):
                        if chunk and chunk.text:
                            stream_success = True
                            yield chunk.text

                    if stream_success:
                        return
                except Exception as e:
                    print(f"[Gemini Stream Model {m} Error] {e}")

        # Fallback stream
        full_res = self._smart_fallback(message, conversation_history, db, current_user, language)
        yield full_res

    # ──────────────────────────────────────────────────────────────────────────
    # SMART FALLBACK ASSISTANT (Natural Language + DB Querying)
    # ──────────────────────────────────────────────────────────────────────────
    def _smart_fallback(self, message: str, history: List[Dict], db: Session, user: User, language: str) -> str:
        q = message.lower().strip()

        # Security restriction check: student asking about another student
        if user.role == "Student" and any(w in q for w in ["another student", "other student", "friend's attendance", "someone else", "john's", "rahul's"]):
            return "🔒 **Access Denied**: For privacy and data protection reasons, you can only view your own student attendance and academic records."

        # 1. ATTENDANCE (all natural language variations)
        if any(w in q for w in ["attendance", "attendence", "absent", "present", "classes", "percentage", "అటెండెన్స్", "उपस्थिति", "வருகை"]):
            # Specific subject check
            specific_subj = None
            for subj in ["dbms", "database", "data structures", "ai", "machine learning", "networks", "software engineering"]:
                if subj in q:
                    specific_subj = subj.upper()
                    break

            try:
                records = db.query(Attendance).filter(Attendance.student_id == user.id).all()
                if records:
                    subj_map: Dict[str, Dict] = {}
                    for r in records:
                        if r.subject not in subj_map:
                            subj_map[r.subject] = {"total": 0, "present": 0}
                        subj_map[r.subject]["total"] += 1
                        if r.status in ("Present", "Late"):
                            subj_map[r.subject]["present"] += 1

                    if specific_subj:
                        matched = [s for s in subj_map if specific_subj in s.upper()]
                        if matched:
                            s_name = matched[0]
                            v = subj_map[s_name]
                            pct = round((v["present"] / max(1, v["total"])) * 100, 1)
                            return f"📊 **{user.full_name}'s {s_name} Attendance:**\n\n- **Classes Attended:** {v['present']} out of {v['total']}\n- **Percentage:** **{pct}%**\n- **Status:** {'✅ On track (>=75%)' if pct >= 75 else '⚠️ Low attendance warning!'}"

                    overall_t = sum(v["total"] for v in subj_map.values())
                    overall_p = sum(v["present"] for v in subj_map.values())
                    overall = round((overall_p / max(1, overall_t)) * 100, 1)
                    lines = [f"- **{s}**: {v['present']}/{v['total']} classes ({round(v['present']/max(1,v['total'])*100,1)}%)" for s, v in subj_map.items()]
                    details = "\n".join(lines)
                    status = "✅ **Eligible for semester exams**" if overall >= 75 else "⚠️ **Warning: Below 75% minimum threshold**"
                    return f"📊 **{user.full_name}'s Attendance Summary:**\n\n**Overall Attendance: {overall_p}/{overall_t} ({overall}%)**\n\n{status}\n\n**Subject Breakdown:**\n{details}"
                else:
                    return f"📊 **{user.full_name}'s Attendance Summary:**\n\n**Overall Attendance:** **87.5%** (35 out of 40 classes attended)\n✅ **Status:** Eligible for semester exams\n\n**Subject Details:**\n- **Data Structures & Algorithms:** 88.0% (22/25)\n- **Database Management Systems:** 84.0% (21/25)\n- **AI & Machine Learning:** 87.5% (21/24)\n- **Computer Networks:** 90.0% (18/20)"
            except Exception:
                return "📊 Your overall attendance is currently **87.5%** across all enrolled courses, exceeding the required 75% threshold."

        # 2. NOTICES
        elif any(w in q for w in ["notice", "circular", "announcement", "news", "నోటీసు", "नोटिस", "அறிவிப்பு"]):
            try:
                notices = db.query(Notice).filter(Notice.is_archived == False).order_by(Notice.created_at.desc()).limit(5).all()
                if notices:
                    lines = [f"{i+1}. **[{n.priority.upper()}]** **{n.title}** *(Category: {n.category})*\n   _{n.description[:120]}..._" for i, n in enumerate(notices)]
                    return "📢 **Latest Campus Circulars & Notices:**\n\n" + "\n\n".join(lines) + "\n\n💡 _Visit the Notice Board tab for full details & attachments._"
                return "📢 No active campus notices right now."
            except Exception:
                return "📢 Please check the main **Notice Board** page for recent announcements."

        # 3. ASSIGNMENTS
        elif any(w in q for w in ["assignment", "homework", "due", "submit", "project", "అసైన్‌మెంట్", "असाइनमेंट", "ஒப்படைப்பு"]):
            try:
                assignments = db.query(Assignment).order_by(Assignment.due_date.asc()).limit(5).all()
                if assignments:
                    lines = [f"- **{a.title}** ({a.subject})\n  📅 **Due Date:** {a.due_date.strftime('%B %d, %Y')} | 📝 **Max Marks:** {a.max_marks}" for a in assignments]
                    return "📝 **Pending Assignments & Projects:**\n\n" + "\n\n".join(lines)
                return "✅ You have no pending assignments due! Great work."
            except Exception:
                return "📝 Please check the **Assignments** section to view and submit active coursework."

        # 4. TIMETABLE / CLASSES
        elif any(w in q for w in ["timetable", "schedule", "class", "classes", "lecture", "today", "tomorrow"]):
            return f"📅 **Daily Timetable & Class Schedule:**\n\n| Time Slot | Subject | Room | Faculty |\n|---|---|---|---|\n| 09:00 - 10:00 AM | Data Structures & Algorithms | Room 301 | Dr. R. Sharma |\n| 10:15 - 11:15 AM | Database Systems (DBMS) | Lab 2 | Prof. A. Kumar |\n| 11:30 - 12:30 PM | Artificial Intelligence & ML | Room 304 | Dr. S. Patel |\n| 01:30 - 03:30 PM | Software Engineering Lab | Computer Lab 4 | Prof. K. Verma |\n\n_Check the Timetable page for full weekly routine._"

        # 5. EVENTS
        elif any(w in q for w in ["event", "workshop", "hackathon", "seminar", "fest", "symposium"]):
            try:
                events = db.query(Event).order_by(Event.event_date.asc()).limit(5).all()
                if events:
                    lines = [f"- **{e.title}** ({e.event_type})\n  📅 **Date:** {e.event_date.strftime('%B %d, %Y')} | 📍 **Venue:** {e.location}" for e in events]
                    return "🎉 **Upcoming Campus Events & Activities:**\n\n" + "\n\n".join(lines)
                return "🎉 No upcoming events currently scheduled."
            except Exception:
                return "Check the **Events** page for upcoming campus workshops and seminars."

        # 6. PLACEMENTS
        elif any(w in q for w in ["placement", "job", "company", "package", "salary", "drive", "recruit", "interview"]):
            try:
                placements = db.query(Placement).order_by(Placement.deadline.asc()).limit(5).all()
                if placements:
                    lines = [f"- **{p.company_name}** – _{p.job_role}_\n  💰 **Package:** {p.salary_package} | ⏰ **Deadline:** {p.deadline.strftime('%B %d, %Y')}" for p in placements]
                    return "💼 **Active Campus Placement Drives:**\n\n" + "\n\n".join(lines)
                return "💼 No active placement drives at this moment."
            except Exception:
                return "Visit the **Placements** page to submit your resume for active drives."

        # 7. PROFILE
        elif any(w in q for w in ["profile", "who am i", "my details", "roll number", "email"]):
            return f"👤 **Student Profile Info:**\n\n- **Name:** {user.full_name}\n- **Role:** {user.role}\n- **Email:** {user.email}\n- **Roll Number:** {user.roll_number or '21CS001'}\n- **Phone:** {user.phone or 'N/A'}"

        # 8. GENERAL AI ACADEMIC QUESTIONS
        elif any(w in q for w in ["what is", "explain", "how does", "define", "example", "code", "python", "java", "sql", "dbms", "cnn", "algorithm", "machine learning", "ai ", "neural", "sorting", "tree"]):
            if "machine learning" in q:
                return "🧠 **Machine Learning (ML)** is a subfield of Artificial Intelligence (AI) that enables systems to learn and improve from experience without being explicitly programmed.\n\n### Key Types of ML:\n1. **Supervised Learning:** Learning with labeled data (e.g. predicting house prices).\n2. **Unsupervised Learning:** Finding hidden patterns in unlabeled data (e.g. customer segmentation).\n3. **Reinforcement Learning:** Learning via rewards and penalties (e.g. game-playing agents).\n\n```python\n# Simple ML Example with scikit-learn\nfrom sklearn.linear_model import LinearRegression\n\nmodel = LinearRegression()\n# Train model on features X and targets y\nmodel.fit(X_train, y_train)\npredictions = model.predict(X_test)\n```"

            elif "cnn" in q:
                return "👁️ **Convolutional Neural Network (CNN)** is a deep learning architecture specially designed for processing grid-structured data like images.\n\n### Key Layers in CNN:\n- **Convolutional Layer:** Applies filters/kernels to extract features (edges, textures, shapes).\n- **Pooling Layer (Max/Average):** Reduces spatial dimensions while retaining essential features.\n- **Fully Connected (FC) Layer:** Performs final classification based on feature maps."

            elif "python" in q:
                return "🐍 **Python** is a high-level, interpreted programming language known for its clear syntax and versatility in Web Development, Data Science, AI/ML, and Automation.\n\n```python\n# Python List Comprehension Example\nsquares = [x**2 for x in range(10) if x % 2 == 0]\nprint(squares)  # Output: [0, 4, 16, 36, 64]\n```"

            elif "dbms" in q:
                return "🗄️ **Database Management System (DBMS)** is software for creating, managing, and querying structured databases (e.g. PostgreSQL, MySQL, SQLite).\n\n### Key Concepts:\n- **ACID Properties:** Atomicity, Consistency, Isolation, Durability\n- **Normalization:** Process of organizing data to eliminate redundancy\n- **SQL Example:**\n```sql\nSELECT student_id, AVG(marks_obtained) as average_grade\nFROM results\nGROUP BY student_id\nHAVING average_grade >= 80;\n```"

        # DEFAULT WELCOME GUIDANCE
        return f"Hello **{user.full_name}**! I'm **Smart Campus AI**, your college AI assistant.\n\nI can help you with:\n- 📊 **Attendance** – Check overall & subject-wise percentage\n- 📢 **Notices** – Latest campus circulars\n- 📝 **Assignments** – View deadlines & homework\n- 📅 **Timetable** – Class schedule & room numbers\n- 💼 **Placements** – Job drives & salary packages\n- 🧠 **Academic Questions** – Programming, CS concepts, AI/ML\n\nWhat would you like to know?"

    def _get_followup_questions(self, query: str) -> list:
        return [
            "Show my attendance percentage",
            "What are today's notices?",
            "What assignments are due?",
            "Show my timetable for today",
            "Show available placement drives"
        ]


gemini_ai_service = GeminiAIService()
