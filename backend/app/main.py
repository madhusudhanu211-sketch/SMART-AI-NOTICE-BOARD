import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.db.session import SessionLocal
from app.db.init_db import init_db

# Import API Routers
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.departments import router as dept_router
from app.api.notices import router as notices_router
from app.api.assignments import router as assignments_router
from app.api.attendance import router as attendance_router
from app.api.timetable import router as timetable_router
from app.api.events import router as events_router
from app.api.placements import router as placements_router
from app.api.ai_bot import router as ai_router
from app.api.voice import router as voice_router
from app.api.alerts import router as alerts_router
from app.api.analytics import router as analytics_router
from app.api.reports import router as reports_router
from app.api.files import router as files_router
from app.api.feedback import router as feedback_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Next-Generation Smart Notice Board API with Voice Recognition and Gemini AI Integration",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration for web and Expo React Native mobile apps
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploads
upload_dir = os.path.join(os.getcwd(), "uploads")
os.makedirs(upload_dir, exist_ok=True)
app.mount("/static/uploads", StaticFiles(directory=upload_dir), name="uploads")

@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        init_db(db)
        print("[OK] Database initialized and production seed data populated successfully.")
    except Exception as e:
        print(f"[WARNING] Startup DB warning: {e}")
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "version": "1.0.0",
        "docs": "/docs"
    }

# Register API Routers under /api and /api/v1
routers = [
    auth_router, users_router, dept_router, notices_router, assignments_router,
    attendance_router, timetable_router, events_router, placements_router,
    ai_router, voice_router, alerts_router, analytics_router, reports_router,
    files_router, feedback_router
]

for prefix in ["/api", "/api/v1"]:
    for r in routers:
        app.include_router(r, prefix=prefix)

