import re

class VoiceService:
    @staticmethod
    def process_command(raw_command: str) -> dict:
        if not raw_command:
            return {
                "command": "",
                "action": "UNKNOWN",
                "target": None,
                "message": "I didn't hear a command. Please try speaking again."
            }

        cmd = raw_command.lower().strip()
        cmd_clean = re.sub(r'[^\w\s]', '', cmd)

        # 1. Navigation / Display Notices
        if any(term in cmd_clean for term in ["notice", "notices", "circular", "announcement"]):
            if "latest" in cmd_clean or "read" in cmd_clean or "first" in cmd_clean:
                return {
                    "command": raw_command,
                    "action": "READ",
                    "target": "Notices",
                    "message": "Opening and reading the latest campus notice."
                }
            return {
                "command": raw_command,
                "action": "NAVIGATE",
                "target": "Notices",
                "message": "Navigating to Notice Board."
            }

        # 2. Timetable
        if any(term in cmd_clean for term in ["timetable", "schedule", "class", "routine"]):
            return {
                "command": raw_command,
                "action": "NAVIGATE",
                "target": "Timetable",
                "message": "Opening class timetable schedule."
            }

        # 3. Attendance
        if any(term in cmd_clean for term in ["attendance", "present", "absent"]):
            return {
                "command": raw_command,
                "action": "NAVIGATE",
                "target": "Attendance",
                "message": "Opening your attendance records."
            }

        # 4. Assignments
        if any(term in cmd_clean for term in ["assignment", "assignments", "homework", "submission"]):
            return {
                "command": raw_command,
                "action": "NAVIGATE",
                "target": "Assignments",
                "message": "Opening assignments screen."
            }

        # 5. Results / Marks
        if any(term in cmd_clean for term in ["result", "results", "marks", "grade", "grades", "gpa"]):
            return {
                "command": raw_command,
                "action": "NAVIGATE",
                "target": "Results",
                "message": "Opening examination results."
            }

        # 6. Events
        if any(term in cmd_clean for term in ["event", "events", "workshop", "hackathon", "drive"]):
            return {
                "command": raw_command,
                "action": "NAVIGATE",
                "target": "Events",
                "message": "Opening campus events & workshops."
            }

        # 7. Placements
        if any(term in cmd_clean for term in ["placement", "placements", "job", "career", "interview", "recruitment"]):
            return {
                "command": raw_command,
                "action": "NAVIGATE",
                "target": "Placements",
                "message": "Opening placement opportunities."
            }

        # 8. Documents
        if any(term in cmd_clean for term in ["document", "documents", "file", "policy", "syllabus", "pdf"]):
            return {
                "command": raw_command,
                "action": "NAVIGATE",
                "target": "Documents",
                "message": "Opening academic documents."
            }

        # 9. AI Chat Assistant
        if any(term in cmd_clean for term in ["ask ai", "ai chat", "bot", "assistant", "question", "gemini"]):
            return {
                "command": raw_command,
                "action": "NAVIGATE",
                "target": "AIChat",
                "message": "Opening AI Assistant Chatbot."
            }

        # 10. Theme Toggle
        if any(term in cmd_clean for term in ["dark mode", "light mode", "theme", "toggle theme"]):
            return {
                "command": raw_command,
                "action": "THEME",
                "target": "Toggle",
                "message": "Toggling application theme."
            }

        # 11. Feedback
        if any(term in cmd_clean for term in ["feedback", "contact", "support"]):
            return {
                "command": raw_command,
                "action": "NAVIGATE",
                "target": "Feedback",
                "message": "Opening feedback form."
            }

        # Fallback response for unhandled commands
        return {
            "command": raw_command,
            "action": "UNKNOWN",
            "target": None,
            "message": f"Command '{raw_command}' processed. Try saying 'Open Notices', 'Show Timetable', or 'Ask AI'."
        }

voice_service = VoiceService()
