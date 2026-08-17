import os
import sys

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models.models import User
from app.services.voice_service import voice_service

def run_tests():
    db = SessionLocal()
    try:
        # Fetch test users
        student = db.query(User).filter(User.role == "Student").first()
        faculty = db.query(User).filter(User.role == "Faculty").first()

        if not student:
            print("Creating dummy student user...")
            student = User(full_name="Demo Student", email="student_test@example.com", hashed_password="pw", role="Student")
            db.add(student)
            db.commit()

        if not faculty:
            print("Creating dummy faculty user...")
            faculty = User(full_name="Demo Faculty", email="faculty_test@example.com", hashed_password="pw", role="Faculty")
            db.add(faculty)
            db.commit()

        print("==========================================")
        print("TEST 1: Student Natural Language Attendance Queries")
        print("==========================================")
        queries = [
            "Show my attendance",
            "What is my attendance percentage?",
            "Check my attendance",
            "How much attendance do I have?",
            "Tell me my attendance percentage"
        ]
        for q in queries:
            res = voice_service.process_command(q, current_user=student, db=db)
            print(f"Query: '{q}' -> Intent: {res['intent']} | Response: {res['response']}")
            assert res['intent'] == "GET_ATTENDANCE"

        print("\n==========================================")
        print("TEST 2: Multilingual Attendance Intents (Telugu, Hindi, Tamil)")
        print("==========================================")
        multi_queries = [
            ("నా అటెండెన్స్ చూపించు", "te"),
            ("मेरी अटेंडेंस दिखाओ", "hi"),
            ("என் வருகைப் பதிவைக் காட்டு", "ta")
        ]
        for q, lang in multi_queries:
            res = voice_service.process_command(q, current_user=student, db=db, language=lang)
            print(f"[{lang.upper()}] '{q}' -> Intent: {res['intent']} | Response: {res['response']}")
            assert res['intent'] == "GET_ATTENDANCE"

        print("\n==========================================")
        print("TEST 3: Timetable, Notices, Assignments, Events")
        print("==========================================")
        t_res = voice_service.process_command("What classes do I have today?", current_user=student, db=db)
        print(f"Timetable -> Intent: {t_res['intent']} | Response: {t_res['response']}")
        assert t_res['intent'] == "GET_TIMETABLE"

        n_res = voice_service.process_command("Read my latest notices", current_user=student, db=db)
        print(f"Read Notice -> Intent: {n_res['intent']} | Response: {n_res['response']}")
        assert n_res['intent'] == "READ_NOTICE"

        a_res = voice_service.process_command("Show my pending assignments", current_user=student, db=db)
        print(f"Assignments -> Intent: {a_res['intent']} | Response: {a_res['response']}")
        assert a_res['intent'] == "GET_ASSIGNMENTS"

        print("\n==========================================")
        print("TEST 4: Short-Term Conversation Context")
        print("==========================================")
        history = [
            {"role": "user", "content": "What is my attendance?"},
            {"role": "assistant_intent", "intent": "GET_ATTENDANCE", "data": {"attendance_pct": 87.5}}
        ]
        ctx_res = voice_service.process_command("Is that enough?", current_user=student, db=db, history=history)
        print(f"Follow-up -> Intent: {ctx_res['intent']} | Response: {ctx_res['response']}")
        assert "75%" in ctx_res['response'] or "87.5" in ctx_res['response']

        print("\n==========================================")
        print("TEST 5: Role-Based Authorization Security")
        print("==========================================")
        # Student trying to mark attendance -> MUST BE DENIED
        denied_res = voice_service.process_command("Mark all students present", current_user=student, db=db)
        print(f"Student Mark Attendance -> Intent: {denied_res['intent']} | Response: {denied_res['response']}")
        assert denied_res['intent'] == "ACCESS_DENIED"

        # Faculty trying to mark attendance -> Allowed with confirmation
        fac_res = voice_service.process_command("Mark all students present", current_user=faculty, db=db)
        print(f"Faculty Mark Attendance -> Intent: {fac_res['intent']} | Confirmation Required: {fac_res['requires_confirmation']}")
        assert fac_res['intent'] == "MARK_ATTENDANCE"
        assert fac_res['requires_confirmation'] == True

        print("\n==========================================")
        print("TEST 6: General AI Gemini Fallback Query")
        print("==========================================")
        gen_res = voice_service.process_command("Explain binary search", current_user=student, db=db)
        print(f"General AI Query -> Intent: {gen_res['intent']} | Response snippet: {gen_res['response'][:80]}...")
        assert gen_res['intent'] == "GENERAL_AI_QUERY"

        print("\n✅ ALL VOICE ASSISTANT TESTS PASSED PERFECTLY!")

    finally:
        db.close()

if __name__ == "__main__":
    run_tests()
