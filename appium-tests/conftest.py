import os
import sys
import pytest
from pathlib import Path

# Ensure reports, screenshots, and logs directories exist
REPORTS_DIR = Path(__file__).parent / "reports"
SCREENSHOTS_DIR = REPORTS_DIR / "screenshots"
LOGS_DIR = REPORTS_DIR / "logs"

SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)
LOGS_DIR.mkdir(parents=True, exist_ok=True)


@pytest.fixture(scope="session")
def appium_server_url():
    """URL of the running Appium server."""
    return os.getenv("APPIUM_SERVER_URL", "http://127.0.0.1:4723")


@pytest.fixture(scope="session")
def appium_capabilities():
    """Android UiAutomator2 capabilities for Expo / React Native testing."""
    caps = {
        "platformName": "Android",
        "automationName": "UiAutomator2",
        "deviceName": os.getenv("ANDROID_DEVICE_NAME", "Android Emulator"),
        "platformVersion": os.getenv("ANDROID_PLATFORM_VERSION", "11.0"),
        "autoGrantPermissions": True,
        "newCommandTimeout": 300,
        "noReset": False,
    }

    # App APK path or Package & Activity
    app_path = os.getenv("APP_PATH", "")
    if app_path and os.path.exists(app_path):
        caps["app"] = app_path
    else:
        # Default fallback to Expo Go or Standalone package
        caps["appPackage"] = os.getenv("APP_PACKAGE", "com.smartnoticeboard.app")
        caps["appActivity"] = os.getenv("APP_ACTIVITY", ".MainActivity")

    return caps


@pytest.fixture(scope="session")
def mobile_credentials():
    """Default login accounts for mobile tests."""
    return {
        "student": {
            "email": os.getenv("STUDENT_EMAIL", "student@smartnoticeboard.edu"),
            "password": os.getenv("STUDENT_PASSWORD", "Password123!"),
            "role": "Student",
        },
        "faculty": {
            "email": os.getenv("FACULTY_EMAIL", "faculty@smartnoticeboard.edu"),
            "password": os.getenv("FACULTY_PASSWORD", "Password123!"),
            "role": "Faculty",
        },
        "admin": {
            "email": os.getenv("ADMIN_EMAIL", "admin@smartnoticeboard.edu"),
            "password": os.getenv("ADMIN_PASSWORD", "Password123!"),
            "role": "Admin",
        },
    }


@pytest.fixture(scope="function")
def appium_driver(request, appium_server_url, appium_capabilities):
    """
    Initializes the Appium WebDriver for Android automation.
    If the Appium server is unreachable (e.g. running offline or local mock check),
    gracefully skips or reports clear connection status.
    """
    from appium import webdriver
    from appium.options.android import UiAutomator2Options

    options = UiAutomator2Options().load_capabilities(appium_capabilities)

    driver = None
    try:
        driver = webdriver.Remote(appium_server_url, options=options)
        driver.implicitly_wait(10)
    except Exception as e:
        pytest.skip(f"Appium server or Android emulator not available at {appium_server_url}: {e}")

    yield driver

    # Capture failure artifacts
    if driver is not None:
        test_name = request.node.name
        if hasattr(request.node, "rep_call") and request.node.rep_call.failed:
            # 1. Screenshot
            screenshot_path = SCREENSHOTS_DIR / f"{test_name}_failure.png"
            try:
                driver.save_screenshot(str(screenshot_path))
                print(f"\n[APPIUM SCREENSHOT] Saved: {screenshot_path}")
            except Exception as ss_err:
                print(f"\n[WARNING] Could not save Appium screenshot: {ss_err}")

            # 2. Device Logs
            log_path = LOGS_DIR / f"{test_name}_logcat.txt"
            try:
                logcat = driver.get_log("logcat")
                with open(log_path, "w", encoding="utf-8") as f:
                    for entry in logcat[-200:]:
                        f.write(f"{entry.get('timestamp')}: {entry.get('message')}\n")
                print(f"[APPIUM LOGCAT] Saved: {log_path}")
            except Exception as log_err:
                print(f"\n[WARNING] Could not capture logcat: {log_err}")

        try:
            driver.quit()
        except Exception:
            pass


@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """Stores test outcome for failure artifact capture."""
    outcome = yield
    rep = outcome.get_result()
    setattr(item, "rep_" + rep.when, rep)


def pytest_html_report_title(report):
    """Custom title for the Appium HTML report."""
    report.title = "Next-Generation Smart Notice Board — Appium Mobile E2E Test Report"

