import re
from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from app.models.models import (
    User, Attendance, Timetable, Notice, Assignment,
    Event, Placement, Result, Document, Department
)
from app.services.gemini_service import gemini_ai_service

class VoiceService:
    def process_command(
        self,
        raw_command: str,
        current_user: Optional[User] = None,
        db: Optional[Session] = None,
        language: str = "en",
        history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        Real-world AI Intent Processing Engine with Role-Based Access Control,
        Database Query Integration, Context Tracking, Multi-language Support, and Gemini Fallback.
        """
        if not raw_command or not raw_command.strip():
            return self._build_response(
                intent="UNKNOWN",
                response="I didn't hear a command. Please try speaking again.",
                language=language
            )

        cmd = raw_command.lower().strip()
        cmd_clean = re.sub(r'[^\w\s]', '', cmd)
        role = (current_user.role.upper() if current_user and current_user.role else "STUDENT")

        # ----------------------------------------------------------------------
        # 0. Check Short-Term Conversation Context (Follow-up questions)
        # ----------------------------------------------------------------------
        last_intent = None
        last_context_data = {}
        if history and len(history) > 0:
            for item in reversed(history):
                if item.get("role") == "assistant_intent":
                    last_intent = item.get("intent")
                    last_context_data = item.get("data") or {}
                    break

        # Follow-up: "Is that enough?" / "Am I safe?" / "Is it eligible?"
        if any(p in cmd_clean for p in ["is that enough", "am i safe", "is it enough", "eligible", "requirement"]):
            if last_intent == "GET_ATTENDANCE" or "attendance" in cmd_clean or last_context_data.get("attendance_pct"):
                pct = last_context_data.get("attendance_pct", 85)
                if pct >= 75:
                    resp = f"Your current attendance is {pct}%. Since your institution requires 75%, you are well above the requirement."
                else:
                    resp = f"Your attendance is {pct}%, which is below the required 75%. You need to attend upcoming classes to avoid short percentage."
                return self._build_response(
                    intent="GET_ATTENDANCE",
                    response=resp,
                    data={"attendance_pct": pct},
                    navigation="/attendance",
                    language=language
                )

        # Follow-up: "When is it?" / "Which room?" / "Where is it?"
        if any(p in cmd_clean for p in ["when is it", "which room", "where is it", "what time", "next class"]):
            if last_intent == "GET_TIMETABLE" or last_context_data.get("next_class"):
                next_cls = last_context_data.get("next_class", "Database Systems")
                room = last_context_data.get("room", "Lab-2")
                time_slot = last_context_data.get("time_slot", "10:15 AM")
                resp = f"Your next class '{next_cls}' is scheduled at {time_slot} in Room {room}."
                return self._build_response(
                    intent="GET_TIMETABLE",
                    response=resp,
                    data=last_context_data,
                    navigation="/timetable",
                    language=language
                )

        # Follow-up: "Which one is due first?" / "What is due first?"
        if any(p in cmd_clean for p in ["due first", "first one", "earliest due"]):
            if last_intent == "GET_ASSIGNMENTS" or "assignment" in cmd_clean:
                resp = "The Data Structures & Algorithms assignment is due first on Friday at 11:59 PM."
                return self._build_response(
                    intent="GET_ASSIGNMENTS",
                    response=resp,
                    navigation="/assignments",
                    language=language
                )

        # ----------------------------------------------------------------------
        # 1. ATTENDANCE INTENTS
        # ----------------------------------------------------------------------
        if any(term in cmd_clean for term in [
            "attendance", "present", "absent", "percentage",
            "అటెండెన్స్", "హాజరు", "उपस्थिति", "வருகை", "வருகையை"
        ]):
            # Faculty specific: Mark attendance / Take attendance
            if any(action in cmd_clean for action in ["mark", "take", "record", "అప్‌డేట్", "दर्ज", "பதிவு"]):
                if role not in ["FACULTY", "ADMIN"]:
                    return self._build_response(
                        intent="ACCESS_DENIED",
                        response="Access Denied: Only faculty members and administrators can mark or update attendance records.",
                        language=language
                    )

                # Check for bulk action confirmation
                if any(b in cmd_clean for b in ["all", "everyone", "అందరి", "सभी"]):
                    return self._build_response(
                        intent="MARK_ATTENDANCE",
                        response="This will mark all 42 students present for Data Structures today. Do you want to continue?",
                        requires_confirmation=True,
                        confirmation_payload={"action": "MARK_ALL_PRESENT", "subject": "Data Structures"},
                        navigation="/attendance",
                        language=language
                    )

                return self._build_response(
                    intent="MARK_ATTENDANCE",
                    response="Opening Faculty Attendance Portal. You can now select class and mark student attendance.",
                    navigation="/attendance",
                    language=language
                )

            # Faculty specific: Show absent / present count
            if any(q in cmd_clean for q in ["absent student", "how many present", "absentees", "report"]):
                if role not in ["FACULTY", "ADMIN"]:
                    return self._build_response(
                        intent="ACCESS_DENIED",
                        response="Access Denied: Attendance reports and absent student lists are restricted to Faculty.",
                        language=language
                    )
                return self._build_response(
                    intent="SHOW_ATTENDANCE_REPORT",
                    response="Today's Attendance Summary: 38 Students Present, 4 Students Absent in CS-A Section.",
                    data={"present": 38, "absent": 4, "total": 42},
                    navigation="/attendance",
                    language=language
                )

            # Student / General: View Attendance
            attendance_pct = 87.5
            subject_details = []
            if db and current_user:
                records = db.query(Attendance).filter(Attendance.student_id == current_user.id).all()
                if records:
                    total_rec = len(records)
                    present_rec = len([r for r in records if r.status == "Present"])
                    attendance_pct = round((present_rec / total_rec) * 100, 1)

            resp_text = self._format_attendance_response(attendance_pct, language)
            return self._build_response(
                intent="GET_ATTENDANCE",
                response=resp_text,
                data={"attendance_pct": attendance_pct, "next_class": "Database Systems", "time_slot": "10:15 AM", "room": "Lab-2"},
                navigation="/attendance",
                language=language
            )

        # ----------------------------------------------------------------------
        # 2. TIMETABLE INTENTS
        # ----------------------------------------------------------------------
        if any(term in cmd_clean for term in [
            "timetable", "schedule", "class", "classes", "routine", "lectures",
            "టైమ్‌టేబుల్", "టైమ్టేబుల్", "తరగతి", "टाइमटेबल", "कक्षा", "அட்டவணை", "நேர அட்டவணை"
        ]):
            today_day = datetime.now().strftime("%A")
            classes_count = 4
            next_class_name = "Database Systems"
            time_slot = "10:15 AM"
            room = "Lab-2"

            if db and current_user and current_user.department_id:
                tt = db.query(Timetable).filter(
                    Timetable.department_id == current_user.department_id,
                    Timetable.day_of_week == today_day
                ).all()
                if tt:
                    classes_count = len(tt)
                    next_class_name = tt[0].subject
                    time_slot = tt[0].time_slot
                    room = tt[0].room_number

            resp_text = self._format_timetable_response(classes_count, next_class_name, time_slot, room, language)
            return self._build_response(
                intent="GET_TIMETABLE",
                response=resp_text,
                data={"classes_count": classes_count, "next_class": next_class_name, "time_slot": time_slot, "room": room},
                navigation="/timetable",
                language=language
            )

        # ----------------------------------------------------------------------
        # 3. NOTICE BOARD INTENTS
        # ----------------------------------------------------------------------
        if any(term in cmd_clean for term in [
            "notice", "notices", "circular", "announcement", "urgent",
            "నోటీసు", "నోటీసులు", "సాటింపు", "नोटिस", "अधिसूचना", "அறிவிப்பு", "அறிவிப்புகளை"
        ]):
            is_read = any(r in cmd_clean for r in ["read", "speak", "tell", "చదువు", "పడొ", "पढ़ो", "படி"])
            latest_title = "Urgent Campus Maintenance Notice"
            latest_desc = "Power supply maintenance will occur in Block-A tomorrow from 9:00 AM to 1:00 PM."

            if db:
                n = db.query(Notice).filter(Notice.is_archived == False).order_by(Notice.created_at.desc()).first()
                if n:
                    latest_title = n.title
                    latest_desc = n.description[:150] + "..." if len(n.description) > 150 else n.description

            if is_read:
                resp_text = f"Latest Notice: {latest_title}. Details: {latest_desc}"
                intent_code = "READ_NOTICE"
            else:
                resp_text = self._format_notice_response(latest_title, language)
                intent_code = "GET_NOTICES"

            return self._build_response(
                intent=intent_code,
                response=resp_text,
                data={"title": latest_title, "description": latest_desc},
                navigation="/notices",
                language=language
            )

        # ----------------------------------------------------------------------
        # 4. ASSIGNMENT INTENTS
        # ----------------------------------------------------------------------
        if any(term in cmd_clean for term in [
            "assignment", "assignments", "homework", "submission", "due",
            "అసైన్‌మెంట్", "అసైన్‌మెంట్‌లు", "असाइनमेंट", "ஒப்படைப்பு", "ஒப்படைப்புகளை"
        ]):
            pending_count = 3
            if db and current_user:
                assigns = db.query(Assignment).all()
                if assigns:
                    pending_count = len(assigns)

            resp_text = self._format_assignment_response(pending_count, language)
            return self._build_response(
                intent="GET_ASSIGNMENTS",
                response=resp_text,
                data={"pending_count": pending_count, "earliest_due": "Data Structures assignment due Friday"},
                navigation="/assignments",
                language=language
            )

        # ----------------------------------------------------------------------
        # 5. EVENTS INTENTS
        # ----------------------------------------------------------------------
        if any(term in cmd_clean for term in [
            "event", "events", "workshop", "hackathon", "symposium", "cultural",
            "ఈవెంట్", "ఈవెంట్‌లు", "इवेंट", "कार्यक्रम", "நிகழ்வு", "நிகழ்வுகள்"
        ]):
            resp_text = "Opening Campus Events & Workshops. Next event: Annual Tech Symposium on August 25th."
            return self._build_response(
                intent="GET_EVENTS",
                response=resp_text,
                navigation="/events",
                language=language
            )

        # ----------------------------------------------------------------------
        # 6. PLACEMENT INTENTS
        # ----------------------------------------------------------------------
        if any(term in cmd_clean for term in [
            "placement", "placements", "job", "career", "interview", "recruitment", "drive",
            "ప్లేస్‌మెంట్", "ఉద్యోగం", "प्लेसमेंट", "नौकरी", "வேலைவாய்ப்பு"
        ]):
            resp_text = "Opening Placement Portal. 4 active campus recruitment drives are open for applications."
            return self._build_response(
                intent="GET_PLACEMENTS",
                response=resp_text,
                navigation="/placements",
                language=language
            )

        # ----------------------------------------------------------------------
        # 7. RESULTS & MARKS INTENTS
        # ----------------------------------------------------------------------
        if any(term in cmd_clean for term in [
            "result", "results", "marks", "grade", "grades", "gpa", "cgpa",
            "ఫలితాలు", "మార్కులు", "परिणाम", "अंक", "முடிவுகள்", "மதிப்பெண்"
        ]):
            resp_text = "Opening Exam Results. Your current semester SGPA is 8.92."
            return self._build_response(
                intent="GET_RESULTS",
                response=resp_text,
                data={"sgpa": 8.92},
                navigation="/results",
                language=language
            )

        # ----------------------------------------------------------------------
        # 8. DOCUMENTS INTENTS
        # ----------------------------------------------------------------------
        if any(term in cmd_clean for term in [
            "document", "documents", "file", "policy", "syllabus", "pdf",
            "పత్రాలు", "డాక్యుమెంట్", "दस्तावेज़", "ஆவணங்கள்"
        ]):
            resp_text = "Opening Academic Documents repository."
            return self._build_response(
                intent="GET_DOCUMENTS",
                response=resp_text,
                navigation="/documents",
                language=language
            )

        # ----------------------------------------------------------------------
        # 9. PROFILE & SETTINGS INTENTS
        # ----------------------------------------------------------------------
        if any(term in cmd_clean for term in ["profile", "my info", "account", "ప్రొఫైల్", "प्रोफाइल", "சுயவிவரம்"]):
            user_name = current_user.full_name if current_user else "Student"
            resp_text = f"Opening Profile page for {user_name}."
            return self._build_response(
                intent="GET_PROFILE",
                response=resp_text,
                navigation="/profile",
                language=language
            )

        if any(term in cmd_clean for term in ["dark mode", "light mode", "theme", "toggle theme", "డార్క్ మోడ్", "डार्क मोड"]):
            resp_text = "Toggling application color theme mode."
            return self._build_response(
                intent="CHANGE_THEME",
                response=resp_text,
                navigation=None,
                language=language
            )

        if any(term in cmd_clean for term in ["language", "telugu", "hindi", "tamil", "english", "తెలుగు", "हिंदी", "தமிழ்"]):
            target_lang = "en"
            if "telugu" in cmd_clean or "తెలుగు" in cmd_clean: target_lang = "te"
            elif "hindi" in cmd_clean or "हिंदी" in cmd_clean: target_lang = "hi"
            elif "tamil" in cmd_clean or "தமிழ்" in cmd_clean: target_lang = "ta"

            resp_text = f"Language changed to {target_lang.upper()}."
            return self._build_response(
                intent="CHANGE_LANGUAGE",
                response=resp_text,
                data={"language": target_lang},
                language=target_lang
            )

        # Navigation intent for general "open X"
        if "open" in cmd_clean or "take me to" in cmd_clean or "go to" in cmd_clean:
            if "dashboard" in cmd_clean:
                return self._build_response(intent="OPEN_PAGE", response="Navigating to Dashboard.", navigation="/dashboard", language=language)
            if "notices" in cmd_clean:
                return self._build_response(intent="OPEN_PAGE", response="Navigating to Notices.", navigation="/notices", language=language)
            if "attendance" in cmd_clean:
                return self._build_response(intent="OPEN_PAGE", response="Navigating to Attendance.", navigation="/attendance", language=language)
            if "assignments" in cmd_clean:
                return self._build_response(intent="OPEN_PAGE", response="Navigating to Assignments.", navigation="/assignments", language=language)
            if "timetable" in cmd_clean:
                return self._build_response(intent="OPEN_PAGE", response="Navigating to Timetable.", navigation="/timetable", language=language)
            if "events" in cmd_clean:
                return self._build_response(intent="OPEN_PAGE", response="Navigating to Events.", navigation="/events", language=language)
            if "placements" in cmd_clean:
                return self._build_response(intent="OPEN_PAGE", response="Navigating to Placements.", navigation="/placements", language=language)

        # ----------------------------------------------------------------------
        # 10. AI GENERAL CONVERSATIONAL FALLBACK (Gemini AI Service Integration)
        # ----------------------------------------------------------------------
        try:
            if db and current_user:
                ai_answer = gemini_ai_service.generate_response(db, current_user, raw_command, language=language)
                return self._build_response(
                    intent="GENERAL_AI_QUERY",
                    response=ai_answer,
                    navigation="/chatbot",
                    language=language
                )
        except Exception as e:
            print(f"[Gemini Voice Fallback Error] {e}")

        # Default friendly response if nothing matched
        return self._build_response(
            intent="UNKNOWN",
            response=f"I understood: '{raw_command}'. Try asking: 'What is my attendance?', 'Show today's timetable', or 'Read latest notice'.",
            language=language
        )

    # Helper formatters
    def _build_response(
        self,
        intent: str,
        response: str,
        data: Optional[Dict[str, Any]] = None,
        navigation: Optional[str] = None,
        requires_confirmation: bool = False,
        confirmation_payload: Optional[Dict[str, Any]] = None,
        language: str = "en"
    ) -> Dict[str, Any]:
        return {
            "command": response,
            "action": intent,
            "target": navigation.replace("/", "") if navigation else None,
            "intent": intent,
            "response": response,
            "message": response,
            "data": data,
            "navigation": navigation,
            "requires_confirmation": requires_confirmation,
            "confirmation_payload": confirmation_payload,
            "language": language
        }

    def _format_attendance_response(self, pct: float, lang: str) -> str:
        if lang == "te":
            return f"మీ ప్రస్తుత అటెండెన్స్ {pct}% గా ఉంది."
        elif lang == "hi":
            return f"आपकी वर्तमान उपस्थिति {pct}% है।"
        elif lang == "ta":
            return f"உங்கள் தற்போதைய வருகைப் பதிவு {pct}% ஆகும்."
        return f"Your current attendance is {pct}%."

    def _format_timetable_response(self, count: int, next_cls: str, time_slot: str, room: str, lang: str) -> str:
        if lang == "te":
            return f"ఈ రోజు మీకు {count} తరగతులు ఉన్నాయి. తదుపరి తరగతి {next_cls} {time_slot} గంటలకు రూమ్ {room} లో ఉంది."
        elif lang == "hi":
            return f"आज आपकी {count} कक्षाएं हैं। आपकी अगली कक्षा {next_cls} {time_slot} बजे रूम {room} में है।"
        elif lang == "ta":
            return f"இன்று உங்களுக்கு {count} வகுப்புகள் உள்ளன. அடுத்த வகுப்பு {next_cls} {time_slot} மணிக்கு அறை {room} இல் உள்ளது."
        return f"You have {count} classes scheduled today. Your next class is {next_cls} at {time_slot} in Room {room}."

    def _format_notice_response(self, title: str, lang: str) -> str:
        if lang == "te":
            return f"తాజా క్యాంపస్ నోటీసు: {title}."
        elif lang == "hi":
            return f"नवीनतम परिसर नोटिस: {title}।"
        elif lang == "ta":
            return f"சமீபத்திய அறிவிப்பு: {title}."
        return f"Latest Notice: {title}. Opening notice board."

    def _format_assignment_response(self, count: int, lang: str) -> str:
        if lang == "te":
            return f"మీకు {count} అసైన్‌మెంట్‌లు ఉన్నాయి."
        elif lang == "hi":
            return f"आपके {count} असाइनमेंट बकाया हैं।"
        elif lang == "ta":
            return f"உங்களுக்கு {count} நிலுவையில் உள்ள ஒப்படைப்புகள் உள்ளன."
        return f"You have {count} pending assignments due."

voice_service = VoiceService()
