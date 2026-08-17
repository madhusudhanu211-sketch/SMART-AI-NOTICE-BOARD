@echo off
title Smart Notice Board - Load Test (100 Users / 1 Minute)
color 0B

echo.
echo ============================================================
echo   Smart Notice Board -- Baseline Load Test
echo   100 Virtual Users ^| 1 Minute Duration
echo ============================================================
echo.
echo [INFO] Checking Python...
python --version
if errorlevel 1 (
    echo [ERROR] Python not found. Please install Python 3.8+
    pause
    exit /b 1
)

echo.
echo [INFO] Checking Locust...
python -m locust --version
if errorlevel 1 (
    echo [INFO] Installing Locust...
    pip install locust
)

echo.
echo [INFO] Starting backend health check and load test...
echo.
echo [IMPORTANT] Make sure the backend is running:
echo    cd backend
echo    uvicorn main:app --host 0.0.0.0 --port 8000
echo.
timeout /t 3 /nobreak >nul

python load-tests\run_load_test.py

echo.
echo ============================================================
echo   Load test complete! Check load-tests\reports\ for results
echo ============================================================
echo.
pause
