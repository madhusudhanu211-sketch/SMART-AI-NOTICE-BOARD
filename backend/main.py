import os
import sys

# Ensure backend root is in Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.db.session import SessionLocal
from app.db.init_db import init_db

# Import Routers
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.departments import router as dept_router
from app.api.notices import router as notices_router
from app.api.timetable import router as timetable_router
from app.api.attendance import router as attendance_router
from app.api.assignments import router as assignments_router
from app.api.results import router as results_router
from app.api.events import router as events_router
from app.api.placements import router as placements_router
from app.api.documents import router as documents_router
from app.api.feedback import router as feedback_router
from app.api.profile import router as profile_router
from app.api.chat import router as chat_router
from app.api.ai_bot import router as ai_router
from app.api.voice import router as voice_router
from app.api.alerts import router as alerts_router
from app.api.analytics import router as analytics_router
from app.api.reports import router as reports_router
from app.api.files import router as files_router
from app.api.health import router as health_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Next-Generation Smart Notice Board API with Voice Recognition & AI Integration",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware setup for local network access (Android APK & Web Portal)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded static files — always from backend/uploads/ regardless of CWD
upload_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(upload_dir, exist_ok=True)
app.mount("/static/uploads", StaticFiles(directory=upload_dir), name="uploads")


@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        init_db(db)
        print("[OK] Database initialized and seed records verified.")
    except Exception as e:
        print(f"[WARNING] Database initialization warning: {e}")
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "version": "1.0.0",
        "health": "/health",
        "docs": "/docs"
    }

# Register Health check at root /health
app.include_router(health_router)

# Register API Routers under /api and /api/v1
routers = [
    auth_router, users_router, dept_router, notices_router, timetable_router,
    attendance_router, assignments_router, results_router, events_router,
    placements_router, documents_router, feedback_router, profile_router,
    chat_router, ai_router, voice_router, alerts_router, analytics_router,
    reports_router, files_router
]

for prefix in ["/api", "/api/v1"]:
    for r in routers:
        app.include_router(r, prefix=prefix)

