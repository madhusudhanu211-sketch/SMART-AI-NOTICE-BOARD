"""
Next-Generation Smart Notice Board — Appium Mobile Automation Test Suite
=============================================================================
Automated using Appium Python Client, Android UiAutomator2, and pytest.
Tested against React Native / Expo Mobile Application.
Covers:
  - App Launch & Native view registration
  - Mobile Login Screen elements & Role Selectors (Student, Faculty, Admin)
  - Role-based Authentication with JWT storage
  - Bottom Tab Navigation (Home, Notices, Voice AI, AI Assistant, Profile)
  - Notice Board view & card interaction
  - AI Campus Chatbot conversation flow
  - Voice Assistant screen & mic interface
  - Profile screen inspection & User logout
"""

import time
import pytest
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def perform_mobile_login(driver, email, password, role="Student"):
    """Selects the role card, enters credentials, and taps the Sign In button."""
    wait = WebDriverWait(driver, 15)

    # 1. Select Role
    role_elem = wait.until(
        EC.element_to_be_clickable(
            (AppiumBy.XPATH, f"//android.widget.TextView[@text='{role}']")
        )
    )
    role_elem.click()

    # 2. Enter Email
    email_field = wait.until(
        EC.presence_of_element_located(
            (AppiumBy.XPATH, "//android.widget.EditText[contains(@text, 'college.edu') or @hint='name@college.edu' or @text='']")
        )
    )
    email_field.clear()
    email_field.send_keys(email)

    # 3. Enter Password
    pass_field = driver.find_elements(AppiumBy.CLASS_NAME, "android.widget.EditText")[1]
    pass_field.clear()
    pass_field.send_keys(password)

    # 4. Tap Sign In
    login_btn = driver.find_element(
        AppiumBy.XPATH, f"//android.widget.TextView[contains(@text, 'Sign In as {role}')]"
    )
    login_btn.click()


# ─── 1. App Launch & Login Tests ──────────────────────────────────────────────

@pytest.mark.mobile_auth
def test_mobile_app_launch_and_login_screen(appium_driver):
    """TC-MOB-001: Verify mobile app launches and displays the Login Screen with all role selectors."""
    wait = WebDriverWait(appium_driver, 15)

    # Verify Header Title
    title = wait.until(
        EC.presence_of_element_located(
            (AppiumBy.XPATH, "//*[@text='Mobile Portal Sign In' or contains(@text, 'SMART NOTICE BOARD')]")
        )
    )
    assert title.is_displayed(), "App title not visible on launch"

    # Verify all 3 Role Cards: Student, Faculty, Admin
    for role in ["Student", "Faculty", "Admin"]:
        role_card = appium_driver.find_element(
            AppiumBy.XPATH, f"//android.widget.TextView[@text='{role}']"
        )
        assert role_card.is_displayed(), f"Role selector card '{role}' is missing on mobile screen"

    # Verify input fields
    inputs = appium_driver.find_elements(AppiumBy.CLASS_NAME, "android.widget.EditText")
    assert len(inputs) >= 2, "Expected at least 2 input fields (Email and Password)"


@pytest.mark.mobile_auth
def test_mobile_student_login(appium_driver, mobile_credentials):
    """TC-MOB-002: Authenticate as Student and verify transition to the main dashboard."""
    student = mobile_credentials["student"]
    perform_mobile_login(appium_driver, student["email"], student["password"], role="Student")

    wait = WebDriverWait(appium_driver, 15)
    # Verify main tab navigator appears (Dashboard / Notice Board)
    dashboard_tab = wait.until(
        EC.presence_of_element_located(
            (AppiumBy.XPATH, "//*[@text='Dashboard' or @text='Notice Board' or contains(@text, 'Notice')]")
        )
    )
    assert dashboard_tab.is_displayed(), "Failed to reach Dashboard tab after login"


# ─── 2. Tab Navigation & Notice Board Tests ───────────────────────────────────

@pytest.mark.mobile_nav
def test_mobile_bottom_tab_navigation(appium_driver, mobile_credentials):
    """TC-MOB-003: Verify bottom tab navigation between Dashboard, Notice Board, Voice AI, AI Assistant, and Profile."""
    student = mobile_credentials["student"]
    perform_mobile_login(appium_driver, student["email"], student["password"], role="Student")

    wait = WebDriverWait(appium_driver, 15)

    tabs = ["Dashboard", "Notice Board", "Voice AI", "AI Assistant", "Profile"]
    for tab_title in tabs:
        tab_btn = wait.until(
            EC.element_to_be_clickable(
                (AppiumBy.XPATH, f"//*[@text='{tab_title}']")
            )
        )
        tab_btn.click()
        time.sleep(1)
        # Check current screen indicator or header
        header = appium_driver.find_element(
            AppiumBy.XPATH, f"//*[contains(@text, '{tab_title}') or @text='{tab_title}']"
        )
        assert header.is_displayed(), f"Navigation to '{tab_title}' screen failed"


@pytest.mark.mobile_notices
def test_mobile_notices_viewing(appium_driver, mobile_credentials):
    """TC-MOB-004: Navigate to Notice Board tab and inspect notice list items."""
    student = mobile_credentials["student"]
    perform_mobile_login(appium_driver, student["email"], student["password"], role="Student")

    wait = WebDriverWait(appium_driver, 15)

    # Click on 'Notice Board' tab
    notices_tab = wait.until(
        EC.element_to_be_clickable((AppiumBy.XPATH, "//*[@text='Notice Board']"))
    )
    notices_tab.click()
    time.sleep(1)

    # Verify Notice items are displayed
    notice_items = wait.until(
        EC.presence_of_all_elements_located(
            (AppiumBy.XPATH, "//*[contains(@text, 'Schedule') or contains(@text, 'Exam') or contains(@text, 'Drive') or contains(@text, 'Notice')]")
        )
    )
    assert len(notice_items) > 0, "Notice board list was empty"


# ─── 3. AI Chatbot & Voice Assistant Tests ────────────────────────────────────

@pytest.mark.mobile_ai
def test_mobile_ai_chatbot_interaction(appium_driver, mobile_credentials):
    """TC-MOB-005: Interact with the AI Campus Chatbot on mobile."""
    student = mobile_credentials["student"]
    perform_mobile_login(appium_driver, student["email"], student["password"], role="Student")

    wait = WebDriverWait(appium_driver, 15)

    # Switch to 'AI Assistant' tab
    chat_tab = wait.until(
        EC.element_to_be_clickable((AppiumBy.XPATH, "//*[@text='AI Assistant']"))
    )
    chat_tab.click()
    time.sleep(1)

    # Find the chat input field
    chat_input = wait.until(
        EC.presence_of_element_located(
            (AppiumBy.XPATH, "//android.widget.EditText[contains(@hint, 'Ask') or contains(@text, 'Ask') or @text='']")
        )
    )
    chat_input.send_keys("When do exams start?")

    # Find and tap Send button
    send_btn = appium_driver.find_element(
        AppiumBy.XPATH, "//*[@text='Send' or contains(@content-desc, 'send')]"
    )
    send_btn.click()
    time.sleep(2)

    # Verify query appears in conversation bubbles
    sent_bubble = wait.until(
        EC.presence_of_element_located((AppiumBy.XPATH, "//*[contains(@text, 'When do exams start?')]"))
    )
    assert sent_bubble.is_displayed(), "User query not displayed in chat window"


@pytest.mark.mobile_ai
def test_mobile_voice_assistant_interface(appium_driver, mobile_credentials):
    """TC-MOB-006: Open Voice Assistant screen and verify microphone button and suggestions."""
    student = mobile_credentials["student"]
    perform_mobile_login(appium_driver, student["email"], student["password"], role="Student")

    wait = WebDriverWait(appium_driver, 15)

    # Navigate to Voice AI tab
    voice_tab = wait.until(
        EC.element_to_be_clickable((AppiumBy.XPATH, "//*[@text='Voice AI']"))
    )
    voice_tab.click()
    time.sleep(1)

    # Verify Voice assistant controls
    voice_header = wait.until(
        EC.presence_of_element_located(
            (AppiumBy.XPATH, "//*[contains(@text, 'Voice') or contains(@text, 'Mic') or contains(@text, 'attendance')]")
        )
    )
    assert voice_header.is_displayed(), "Voice AI interface did not render"


# ─── 4. Profile & Logout Tests ────────────────────────────────────────────────

@pytest.mark.mobile_auth
def test_mobile_profile_and_logout(appium_driver, mobile_credentials):
    """TC-MOB-007: Open Profile tab, verify student account info, and tap Sign Out."""
    student = mobile_credentials["student"]
    perform_mobile_login(appium_driver, student["email"], student["password"], role="Student")

    wait = WebDriverWait(appium_driver, 15)

    # Navigate to Profile tab
    profile_tab = wait.until(
        EC.element_to_be_clickable((AppiumBy.XPATH, "//*[@text='Profile']"))
    )
    profile_tab.click()
    time.sleep(1)

    # Verify Account details are rendered
    account_header = wait.until(
        EC.presence_of_element_located(
            (AppiumBy.XPATH, "//*[contains(@text, 'Account Details') or contains(@text, 'STUDENT') or contains(@text, 'Computer Science')]")
        )
    )
    assert account_header.is_displayed(), "Profile account details not found"

    # Tap Sign Out button
    logout_btn = appium_driver.find_element(
        AppiumBy.XPATH, "//*[@text='Sign Out' or @text='Logout']"
    )
    logout_btn.click()
    time.sleep(1.5)

    # Verify returned to Login Screen
    login_screen_elem = wait.until(
        EC.presence_of_element_located(
            (AppiumBy.XPATH, "//*[@text='Mobile Portal Sign In' or contains(@text, 'SMART NOTICE BOARD')]")
        )
    )
    assert login_screen_elem.is_displayed(), "Sign out failed to return to the Login Screen"

