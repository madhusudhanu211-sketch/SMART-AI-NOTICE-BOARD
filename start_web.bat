@echo off
title Smart Notice Board - React Web Portal
echo ====================================================
echo Starting React Vite Web Portal...
echo ====================================================
echo.
cd /d "%~dp0web"
call npm.cmd run dev
pause
