"""
load-tests/locustfile.py
====================================================
Smart Notice Board — Baseline/Load Test
====================================================

Configuration:
  - 100 virtual users
  - 1 minute continuous run
  - Simulates realistic Student / Faculty / Admin traffic

Run (headless, auto-generates reports):
  python load-tests/run_load_test.py

Run (interactive web UI):
  locust -f load-tests/locustfile.py --host http://localhost:8000

Endpoints exercised:
  - Health check
  - Login (Student, Faculty, Admin)
  - Notices  (list, detail)
  - Timetable
  - Attendance (student view)
  - Assignments
  - Events
  - Placements
  - Results
  - AI Chat
  - Voice Commands
  - Departments
  - Analytics Dashboard
  - User Profile
"""

import random
import json
from locust import HttpUser, task, between, events
from locust.runners import MasterRunner

import os

# ─── Configurable Credentials from Environment or Defaults ───────────────────
STUDENT_CREDS = {
    "email": os.getenv("STUDENT_EMAIL", "student@smartnoticeboard.edu"),
    "password": os.getenv("STUDENT_PASSWORD", "Password123!")
}
FACULTY_CREDS = {
    "email": os.getenv("FACULTY_EMAIL", "faculty@smartnoticeboard.edu"),
    "password": os.getenv("FACULTY_PASSWORD", "Password123!")
}
ADMIN_CREDS = {
    "email": os.getenv("ADMIN_EMAIL", "admin@smartnoticeboard.edu"),
    "password": os.getenv("ADMIN_PASSWORD", "Password123!")
}

# Fallback credentials
STUDENT_CREDS2 = {"email": "student@campus.edu", "password": "password123"}
FACULTY_CREDS2 = {"email": "faculty@campus.edu", "password": "password123"}
ADMIN_CREDS2   = {"email": "admin@campus.edu",   "password": "password123"}

# ─── Sample payloads for read-heavy requests ──────────────────────────────────
VOICE_COMMANDS = [
    "show notices",
    "open timetable",
    "check attendance",
    "what assignments are due",
    "show upcoming events",
    "open placements",
]

AI_QUERIES = [
    "What are the latest notices?",
    "Show my attendance percentage",
    "When is the next event?",
    "What assignments are pending?",
    "Tell me about placement drives",
    "What is the timetable for Monday?",
]

# ─── Base User class with shared auth logic ───────────────────────────────────
class SmartNoticeBoardUser(HttpUser):
    """Base class — all virtual users extend this."""
    abstract = True
    wait_time = between(0.5, 2.0)   # Realistic think-time between requests
    token = None

    def login(self, credentials_list):
        """Try credentials in order, return token on first success."""
        for creds in credentials_list:
            with self.client.post(
                "/api/auth/login",
                json={**creds, "role": creds.get("role", "Student")},
                catch_response=True,
                name="POST /api/auth/login"
            ) as resp:
                if resp.status_code == 200:
                    data = resp.json()
                    self.token = data.get("access_token")
                    resp.success()
                    return self.token
                else:
                    resp.failure(f"Login failed: {resp.status_code}")
        return None

    def auth_headers(self):
        if self.token:
            return {"Authorization": f"Bearer {self.token}"}
        return {}

    # ── Common public endpoints (no auth needed) ───────────────────────────
    @task(5)
    def get_notices(self):
        self.client.get("/api/notices", name="GET /api/notices")

    @task(3)
    def get_notices_category(self):
        cat = random.choice(["Academic", "Examination", "Events", "Placements", "Emergency"])
        self.client.get(f"/api/notices?category={cat}", name="GET /api/notices?category=X")

    @task(2)
    def get_notice_detail(self):
        notice_id = random.randint(1, 5)
        self.client.get(f"/api/notices/{notice_id}", name="GET /api/notices/{id}")

    @task(3)
    def get_timetable(self):
        self.client.get("/api/timetable", name="GET /api/timetable")

    @task(2)
    def get_events(self):
        self.client.get("/api/events", name="GET /api/events")

    @task(2)
    def get_placements(self):
        self.client.get("/api/placements", name="GET /api/placements")

    @task(2)
    def get_departments(self):
        self.client.get("/api/departments/", name="GET /api/departments")

    @task(1)
    def health_check(self):
        self.client.get("/health", name="GET /health")

    @task(1)
    def get_assignments(self):
        self.client.get("/api/assignments", name="GET /api/assignments")

    # ── Voice assistant (no auth required in current implementation) ───────
    @task(2)
    def voice_command(self):
        cmd = random.choice(VOICE_COMMANDS)
        self.client.post(
            "/api/voice/process",
            json={"command": cmd},
            name="POST /api/voice/process"
        )


# ═══════════════════════════════════════════════════════════════════════════════
# STUDENT USER  (~65% of traffic)
# ═══════════════════════════════════════════════════════════════════════════════
class StudentUser(SmartNoticeBoardUser):
    """
    Simulates a Student user.
    Reads own attendance, results, notices, profile.
    Uses AI chatbot.
    Weight = 65 (65% of virtual users are students).
    """
    weight = 65

    def on_start(self):
        self.login([STUDENT_CREDS, STUDENT_CREDS2])

    # ── Authenticated student tasks ────────────────────────────────────────
    @task(4)
    def view_my_attendance(self):
        with self.client.get(
            "/api/attendance",
            headers=self.auth_headers(),
            catch_response=True,
            name="GET /api/attendance (Student)"
        ) as resp:
            if resp.status_code == 200:
                resp.success()
            elif resp.status_code == 401:
                resp.failure("Unauthorized — token may have expired")
            else:
                resp.success()   # Accept other statuses for load test

    @task(3)
    def view_attendance_summary(self):
        self.client.get(
            "/api/attendance/summary",
            headers=self.auth_headers(),
            name="GET /api/attendance/summary"
        )

    @task(3)
    def view_results(self):
        self.client.get(
            "/api/results",
            headers=self.auth_headers(),
            name="GET /api/results"
        )

    @task(2)
    def view_profile(self):
        self.client.get(
            "/api/auth/me",
            headers=self.auth_headers(),
            name="GET /api/auth/me"
        )

    @task(2)
    def ai_chat(self):
        query = random.choice(AI_QUERIES)
        self.client.post(
            "/api/ai/chat",
            json={"query": query},
            headers=self.auth_headers(),
            name="POST /api/ai/chat"
        )

    @task(1)
    def view_notifications(self):
        self.client.get(
            "/api/alerts/",
            headers=self.auth_headers(),
            name="GET /api/alerts/ (notifications)"
        )

    @task(1)
    def view_analytics(self):
        self.client.get(
            "/api/analytics/summary",
            headers=self.auth_headers(),
            name="GET /api/analytics/summary"
        )

    @task(1)
    def search_notices(self):
        search_terms = ["exam", "placement", "hackathon", "scholarship", "maintenance"]
        term = random.choice(search_terms)
        self.client.get(
            f"/api/notices?search={term}",
            name="GET /api/notices?search=X"
        )


# ═══════════════════════════════════════════════════════════════════════════════
# FACULTY USER  (~25% of traffic)
# ═══════════════════════════════════════════════════════════════════════════════
class FacultyUser(SmartNoticeBoardUser):
    """
    Simulates a Faculty user.
    Views enrolled students roster, views attendance records.
    Weight = 25 (25% of virtual users).
    """
    weight = 25

    def on_start(self):
        self.login([FACULTY_CREDS, FACULTY_CREDS2])

    @task(5)
    def view_enrolled_students(self):
        self.client.get(
            "/api/attendance/students",
            headers=self.auth_headers(),
            name="GET /api/attendance/students"
        )

    @task(4)
    def view_attendance_records(self):
        self.client.get(
            "/api/attendance",
            headers=self.auth_headers(),
            name="GET /api/attendance (Faculty)"
        )

    @task(3)
    def view_class_attendance(self):
        self.client.get(
            "/api/attendance/class/CS-3",
            headers=self.auth_headers(),
            name="GET /api/attendance/class/{id}"
        )

    @task(2)
    def view_profile(self):
        self.client.get(
            "/api/auth/me",
            headers=self.auth_headers(),
            name="GET /api/auth/me"
        )

    @task(2)
    def view_analytics(self):
        self.client.get(
            "/api/analytics/summary",
            headers=self.auth_headers(),
            name="GET /api/analytics/summary"
        )

    @task(1)
    def view_notifications(self):
        self.client.get(
            "/api/alerts/",
            headers=self.auth_headers(),
            name="GET /api/alerts/ (notifications)"
        )


# ═══════════════════════════════════════════════════════════════════════════════
# ADMIN USER  (~10% of traffic)
# ═══════════════════════════════════════════════════════════════════════════════
class AdminUser(SmartNoticeBoardUser):
    """
    Simulates an Admin user.
    Accesses analytics dashboard, user list, report exports.
    Weight = 10 (10% of virtual users).
    """
    weight = 10

    def on_start(self):
        self.login([ADMIN_CREDS, ADMIN_CREDS2])

    @task(5)
    def view_dashboard(self):
        self.client.get(
            "/api/analytics/summary",
            headers=self.auth_headers(),
            name="GET /api/analytics/summary (Admin)"
        )

    @task(4)
    def list_all_users(self):
        self.client.get(
            "/api/users/",
            headers=self.auth_headers(),
            name="GET /api/users/ (Admin)"
        )

    @task(3)
    def view_all_notices(self):
        self.client.get(
            "/api/notices",
            headers=self.auth_headers(),
            name="GET /api/notices (Admin)"
        )

    @task(2)
    def export_notices_excel(self):
        self.client.get(
            "/api/reports/notices/excel",
            headers=self.auth_headers(),
            name="GET /api/reports/notices/excel"
        )

    @task(2)
    def export_attendance_excel(self):
        self.client.get(
            "/api/reports/attendance/excel",
            headers=self.auth_headers(),
            name="GET /api/reports/attendance/excel"
        )

    @task(1)
    def view_departments(self):
        self.client.get(
            "/api/departments/",
            headers=self.auth_headers(),
            name="GET /api/departments/ (Admin)"
        )
