import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings, BACKEND_ROOT

# Resolve absolute SQLite path if using SQLite
def _resolve_db_url(url: str) -> str:
    """Convert sqlite relative path to absolute path anchored at backend root."""
    if url.startswith("sqlite:///./"):
        db_filename = url.replace("sqlite:///./", "")
        abs_path = BACKEND_ROOT / db_filename
        return f"sqlite:///{abs_path}"
    return url

resolved_db_url = _resolve_db_url(settings.DATABASE_URL)

connect_args = {}
if resolved_db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    resolved_db_url,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

