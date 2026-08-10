@echo off
echo ===================================================
echo 📱 Smart Notice Board - Automated Android APK Builder
echo ===================================================
echo.

if not exist node_modules (
    echo [1/3] Installing dependencies...
    call npm install
) else (
    echo [1/3] Dependencies verified.
)

echo.
echo [2/3] Checking EAS CLI...
call npx eas-cli --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing EAS CLI globally...
    call npm install -g eas-cli
)

echo.
echo [3/3] Initiating EAS Android APK Build...
echo Target: Standalone APK (Preview Profile)
call npx eas-cli build --platform android --profile preview

echo.
echo ===================================================
echo ✅ Build Command Dispatched!
echo Download your generated APK from the Expo Dashboard URL shown above.
echo ===================================================
pause
