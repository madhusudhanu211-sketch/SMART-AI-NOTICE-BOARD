@echo off
title Smart Notice Board - FastAPI Backend
echo ====================================================
echo Starting FastAPI Backend on 0.0.0.0:8000...
echo ====================================================
echo.
cd /d "%~dp0backend"
call python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
