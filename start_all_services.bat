@echo off
title Smart AI Notice Board - Service Launcher
echo ====================================================
echo Starting Smart AI Notice Board System...
echo ====================================================
echo.

echo 1. Launching FastAPI Backend (port 8000)...
start "FastAPI Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

ping -n 3 127.0.0.1 > nul

echo 2. Launching React Vite Web Portal (port 5173)...
start "React Web Portal" cmd /k "cd /d %~dp0web && npm.cmd run dev"

ping -n 4 127.0.0.1 > nul

echo 3. Opening Web Portal in your default browser...
start http://localhost:5173/voice

echo ====================================================
echo Services started! Keep the opened terminal windows open.
echo ====================================================

