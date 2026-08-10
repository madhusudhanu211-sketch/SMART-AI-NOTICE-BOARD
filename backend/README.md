# ⚡ Smart Notice Board - FastAPI Backend Server

An independent, production-grade FastAPI REST API backend for the **Smart Notice Board** system supporting authentication, notice board management, timetable, attendance, assignments, events, placements, results, documents, feedback, voice controls, and AI chatbot integration.

---

## 📁 Architecture & Directory Structure

```
backend/
├── main.py                  # FastAPI application entry point
├── .env                     # Environment settings (PostgreSQL/SQLite, JWT secret)
├── requirements.txt         # Dependencies
├── README.md                # Documentation
└── app/
    ├── core/                # Config & JWT Security
    ├── db/                  # SQLAlchemy Session & DB Seeder
    ├── models/              # SQLAlchemy Database Models
    ├── schemas/             # Pydantic Request/Response Schemas
    ├── services/            # AI, Voice, Notification Services
    └── api/                 # Endpoint Routers
```

---

## 🚀 Quick Start Guide

### 1. Start FastAPI Backend

```powershell
cd /d "C:\Users\pille\OneDrive\Desktop\notice board\backend"

# Create & activate Python virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Launch Uvicorn server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 🌐 API Endpoints

* **Health Check:** `GET /health` → `{"status": "ok"}`
* **Interactive Docs (Swagger):** `http://localhost:8000/docs`
* **Redoc Docs:** `http://localhost:8000/redoc`

### Registered Routes (`/api`):
* **Auth:** `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
* **Notices:** `GET /api/notices`, `POST /api/notices`, `GET /api/notices/{id}`, `PUT /api/notices/{id}`, `DELETE /api/notices/{id}`
* **Timetable:** `GET /api/timetable`
* **Attendance:** `GET /api/attendance`, `POST /api/attendance`
* **Assignments:** `GET /api/assignments`, `POST /api/assignments`
* **Results:** `GET /api/results`
* **Events:** `GET /api/events`, `POST /api/events`
* **Placements:** `GET /api/placements`, `POST /api/placements`
* **Documents:** `GET /api/documents`, `POST /api/documents`
* **Feedback:** `POST /api/feedback`
* **Profile:** `GET /api/profile`, `PUT /api/profile`
* **AI Chatbot:** `POST /api/chat`
* **Voice Assistant:** `POST /api/voice`
