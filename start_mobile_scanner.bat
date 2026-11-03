
@echo off
title Smart Notice Board - Mobile Expo Scanner
color 0b

echo ====================================================
echo     SMART NOTICE BOARD - EXPO QR SCANNER LAUNCHER
echo ====================================================
echo.
echo Select how you want to run Expo:
echo [1] Standard LAN Mode (Default - PC and Phone on same Wi-Fi)
echo [2] Tunnel Mode (Recommended if phone cannot connect or on mobile data)
echo [3] Clear Cache and Restart
echo.

set /p mode="Enter option (1, 2, or 3, default is 1): "

cd /d "%~dp0mobile"

if "%mode%"=="2" (
    echo.
    echo Starting in Tunnel mode (bypasses Wi-Fi and firewall restrictions)...
    call npx.cmd expo start --tunnel -c
) else if "%mode%"=="3" (
    echo.
    echo Clearing Metro bundler cache...
    call npx.cmd expo start -c
) else (
    echo.
    echo Starting in standard LAN mode...
    call npx.cmd expo start -c
)

pause
