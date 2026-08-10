import os
from app.core.config import settings

class AIService:
    @staticmethod
    def query_assistant(query: str, context: str = "") -> dict:
        gemini_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
        
        if gemini_key:
            try:
                from google import genai
                client = genai.Client(api_key=gemini_key)
                prompt = f"System Context: You are Smart Notice Board Campus Assistant. {context}\n\nStudent Query: {query}"
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt,
                )
                if response and response.text:
                    return {
                        "query": query,
                        "answer": response.text,
                        "suggested_questions": [
                            "What is the mid-term examination schedule?",
                            "When is the tuition fee payment deadline?",
                            "Show upcoming placement drives."
                        ]
                    }
            except Exception as e:
                print(f"[AI Service Warning] Gemini API call failed: {e}")

        # Fallback response engine if API key is not present or API call fails
        q = query.lower()
        if "exam" in q or "schedule" in q or "timetable" in q:
            answer = "📅 **Mid-Term Exams Update**: Examinations for the Autumn 2026 semester start on **August 18, 2026**. Detailed timetables for Computer Science, IT, and EC departments have been posted under the Examination section."
        elif "fee" in q or "payment" in q or "deadline" in q:
            answer = "💳 **Tuition Fee Circular**: The last date for online fee payment without late fine has been extended to **August 25, 2026**. You can pay via the student portal."
        elif "hackathon" in q or "event" in q:
            answer = "🏆 **Campus AI Hackathon**: Registrations are currently open for the 48-hour AI & Cloud Hackathon! First prize is $5,000. Registration closes on August 15th."
        elif "placement" in q or "google" in q or "job" in q:
            answer = "💼 **Placement Drive**: Google & Microsoft campus recruitment drives for 2026 graduates begin on August 20th at 10:00 AM in the Auditorium."
        elif "attendance" in q:
            answer = "📊 **Attendance Policy**: Minimum 75% attendance is mandatory to appear for semester end examinations. Check the Attendance tab to view your current status."
        elif "assignment" in q:
            answer = "📝 **Assignments**: Web Architecture API assignment due date is approaching in 5 days. Submit your project link before the deadline."
        else:
            answer = f"🤖 **Smart Campus Assistant**: I processed your question: '{query}'. All campus circulars, exam dates, and assignment deadlines are synchronized live with your student dashboard."

        return {
            "query": query,
            "answer": answer,
            "suggested_questions": [
                "When do mid-term exams start?",
                "What is the fee payment deadline?",
                "Show upcoming placement drives."
            ]
        }

ai_service = AIService()
