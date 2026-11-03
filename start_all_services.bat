@echo off
title Smart AI Notice Board - Service Launcher
echo ====================================================
echo Starting Smart AI Notice Board System...
echo ====================================================
echo.

echo 1. Launching FastAPI Backend (port 8000)...
start "FastAPI Backend" cmd /k "%~dp0start_backend.bat"

timeout /t 3 /nobreak > nul

echo 2. Launching React Vite Web Portal (port 5173)...
start "React Web Portal" cmd /k "%~dp0start_web.bat"

timeout /t 3 /nobreak > nul

echo 3. Opening Voice Assistant in your default browser...
start http://localhost:5173/voice

echo ====================================================
echo Services started! Keep the opened terminal windows open.
echo ====================================================
