import os
import sys
import pytest
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service

# Ensure reports and screenshots directories exist
REPORTS_DIR = Path(__file__).parent / "reports"
SCREENSHOTS_DIR = REPORTS_DIR / "screenshots"
SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)

@pytest.fixture(scope="session")
def base_url():
    """Base URL for Web Frontend (defaults to http://localhost:5173)."""
    return os.getenv("WEB_BASE_URL", "http://localhost:5173").rstrip("/")

@pytest.fixture(scope="session")
def api_url():
    """Base URL for FastAPI Backend (defaults to http://localhost:8000)."""
    return os.getenv("BACKEND_URL", "http://localhost:8000").rstrip("/")

@pytest.fixture(scope="session")
def credentials():
    """Test user credentials for each role."""
    return {
        "admin": {
            "email": os.getenv("ADMIN_EMAIL", "admin@smartnoticeboard.edu"),
            "password": os.getenv("ADMIN_PASSWORD", "Password123!"),
            "role": "Admin",
        },
        "faculty": {
            "email": os.getenv("FACULTY_EMAIL", "faculty@smartnoticeboard.edu"),
            "password": os.getenv("FACULTY_PASSWORD", "Password123!"),
            "role": "Faculty",
        },
        "student": {
            "email": os.getenv("STUDENT_EMAIL", "student@smartnoticeboard.edu"),
            "password": os.getenv("STUDENT_PASSWORD", "Password123!"),
            "role": "Student",
        },
    }

@pytest.fixture(scope="function")
def driver(request):
    """Initializes a headless Chrome WebDriver instance with standard CI/CD flags."""
    chrome_options = Options()
    
    # Headless mode for CI/CD runners (GitHub Actions & Linux)
    headless = os.getenv("SELENIUM_HEADLESS", "true").lower() in ("true", "1", "yes")
    if headless:
        chrome_options.add_argument("--headless=new")
    
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--ignore-certificate-errors")
    chrome_options.add_argument("--allow-insecure-localhost")

    # Initialize Chrome WebDriver using Selenium 4 built-in Selenium Manager
    try:
        driver_instance = webdriver.Chrome(options=chrome_options)
    except Exception as e:
        # Fallback to webdriver_manager if system chrome driver has path issues
        try:
            from webdriver_manager.chrome import ChromeDriverManager
            driver_instance = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
        except Exception as fallback_error:
            raise RuntimeError(f"Failed to start Chrome WebDriver: {e} | Fallback error: {fallback_error}")

    driver_instance.implicitly_wait(10)
    driver_instance.set_page_load_timeout(30)

    yield driver_instance

    # Capture failure screenshot
    if hasattr(request.node, "rep_call") and request.node.rep_call.failed:
        test_name = request.node.name
        screenshot_path = SCREENSHOTS_DIR / f"{test_name}_failure.png"
        try:
            driver_instance.save_screenshot(str(screenshot_path))
            print(f"\n[SCREENSHOT] Saved failure screenshot to: {screenshot_path}")
        except Exception as ss_err:
            print(f"\n[WARNING] Could not take screenshot: {ss_err}")

    try:
        driver_instance.quit()
    except Exception:
        pass

@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """Stores test outcome on item for failure screenshot capture in teardown."""
    outcome = yield
    rep = outcome.get_result()
    setattr(item, "rep_" + rep.when, rep)

def pytest_html_report_title(report):
    """Custom title for the generated HTML test report."""
    report.title = "Next-Generation Smart Notice Board — Selenium Web E2E Test Report"

