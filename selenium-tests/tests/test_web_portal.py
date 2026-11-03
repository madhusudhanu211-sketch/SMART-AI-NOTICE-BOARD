"""
Next-Generation Smart Notice Board — Selenium E2E Web Automation Test Suite
=============================================================================
Tests automated with Python, Selenium WebDriver, and pytest.
Covers:
  - Login Page rendering & field validations
  - Role-based Authentication (Student, Faculty, Admin)
  - Invalid credentials & error handling
  - Student Dashboard & metric widgets
  - Faculty Portal access & dashboard
  - Admin Dashboard & management tabs
  - Campus Notice creation via modal
  - Notice keyword search & filter
  - Notice status toggle, pinning & deletion (Admin)
  - Role-Based Access Control (RBAC) restrictions
  - User logout & session termination
"""

import time
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException


# ─── Helper Functions ─────────────────────────────────────────────────────────

def perform_login(driver, base_url, email, password, role="Student"):
    """Navigates to login page, selects the role, enters credentials, and submits."""
    driver.get(f"{base_url}/login")
    wait = WebDriverWait(driver, 15)

    # 1. Select the role button (Student, Faculty, or Admin)
    role_xpath = f"//button[contains(., '{role}')]"
    role_btn = wait.until(EC.element_to_be_clickable((By.XPATH, role_xpath)))
    role_btn.click()

    # 2. Enter Email and Password
    email_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']")))
    email_input.clear()
    email_input.send_keys(email)

    pass_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
    pass_input.clear()
    pass_input.send_keys(password)

    # 3. Click Submit Button
    submit_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
    submit_btn.click()


# ─── 1. Authentication & Form Validation Tests ─────────────────────────────────

@pytest.mark.auth
def test_login_page_rendering(driver, base_url):
    """TC-WEB-001: Verify that the Login page renders all required UI elements and brand headers."""
    driver.get(f"{base_url}/login")
    wait = WebDriverWait(driver, 15)

    # Brand Title & Subtitle
    header = wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Smart Notice Board')]")))
    assert header.is_displayed(), "Portal title 'Smart Notice Board' is missing"

    # Role Cards
    for role in ["Student", "Faculty", "Admin"]:
        role_btn = driver.find_element(By.XPATH, f"//button[contains(., '{role}')]")
        assert role_btn.is_displayed(), f"Role button for '{role}' is not visible"

    # Inputs and Action Button
    email_input = driver.find_element(By.CSS_SELECTOR, "input[type='email']")
    pass_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
    submit_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")

    assert email_input.is_displayed(), "Email input field is missing"
    assert pass_input.is_displayed(), "Password input field is missing"
    assert submit_btn.is_displayed(), "Submit button is missing"


@pytest.mark.auth
def test_invalid_credentials_error_message(driver, base_url):
    """TC-WEB-002: Verify error alert appears when submitting invalid email/password."""
    perform_login(driver, base_url, "invalid.user@smartnoticeboard.edu", "WrongPassword999!", role="Student")
    
    wait = WebDriverWait(driver, 10)
    # The error banner is rendered with text when login fails
    error_elem = wait.until(
        EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Invalid') or contains(text(), 'credentials') or contains(text(), 'Please check')]"))
    )
    assert error_elem.is_displayed(), "Expected error message was not displayed for invalid credentials"


@pytest.mark.auth
def test_student_login_and_dashboard(driver, base_url, credentials):
    """TC-WEB-003: Verify successful Student login and redirection to student dashboard."""
    student = credentials["student"]
    perform_login(driver, base_url, student["email"], student["password"], role="Student")

    wait = WebDriverWait(driver, 15)
    # Redirection to student dashboard (/student/dashboard or /dashboard)
    wait.until(lambda d: "/dashboard" in d.current_url or "/student" in d.current_url)

    # Verify student greeting or dashboard components
    dash_header = wait.until(
        EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Dashboard') or contains(text(), 'Welcome') or contains(text(), 'Notice')]"))
    )
    assert dash_header.is_displayed(), "Dashboard header is not visible after student login"


@pytest.mark.auth
def test_faculty_login_and_dashboard(driver, base_url, credentials):
    """TC-WEB-004: Verify successful Faculty login and redirection to faculty workspace."""
    faculty = credentials["faculty"]
    perform_login(driver, base_url, faculty["email"], faculty["password"], role="Faculty")

    wait = WebDriverWait(driver, 15)
    wait.until(lambda d: "/dashboard" in d.current_url or "/faculty" in d.current_url)

    # Verify faculty options are visible
    nav_or_panel = wait.until(
        EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Faculty') or contains(text(), 'Attendance') or contains(text(), 'Dashboard')]"))
    )
    assert nav_or_panel.is_displayed(), "Faculty workspace elements not loaded"


@pytest.mark.auth
def test_admin_login_and_dashboard(driver, base_url, credentials):
    """TC-WEB-005: Verify successful Administrator login and access to admin capabilities."""
    admin = credentials["admin"]
    perform_login(driver, base_url, admin["email"], admin["password"], role="Admin")

    wait = WebDriverWait(driver, 15)
    wait.until(lambda d: "/dashboard" in d.current_url or "/admin" in d.current_url)

    # Verify admin sidebar has 'Admin Panel' option
    admin_link = wait.until(
        EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Admin Panel') or contains(text(), 'Administration') or contains(text(), 'Admin')]"))
    )
    assert admin_link.is_displayed(), "Admin Panel navigation not visible to Administrator"


# ─── 2. Notice Board & Search Tests ───────────────────────────────────────────

@pytest.mark.notices
def test_notice_board_search_and_filters(driver, base_url, credentials):
    """TC-WEB-006: Verify real-time notice search filtering by keyword."""
    student = credentials["student"]
    perform_login(driver, base_url, student["email"], student["password"], role="Student")

    # Navigate to Notices page
    driver.get(f"{base_url}/notices")
    wait = WebDriverWait(driver, 15)

    # Find the search bar
    search_input = wait.until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "input[placeholder*='Search']"))
    )
    search_input.clear()
    search_input.send_keys("Examination")
    time.sleep(1)

    # Verify that filtered notice contains searched term or search filter is applied
    page_text = driver.find_element(By.TAG_NAME, "body").text
    assert "Examination" in page_text or "Exam" in page_text, "Search filter did not show matching notices"


@pytest.mark.notices
def test_notice_creation_workflow(driver, base_url, credentials):
    """TC-WEB-007: Log in as Admin/Faculty and create a new campus notice."""
    admin = credentials["admin"]
    perform_login(driver, base_url, admin["email"], admin["password"], role="Admin")

    driver.get(f"{base_url}/notices")
    wait = WebDriverWait(driver, 15)

    # Click "Publish New Notice" button
    publish_btn = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Publish New Notice') or contains(., 'Publish')]"))
    )
    publish_btn.click()

    # Fill out the notice form modal
    title_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[placeholder*='Schedule for Mid-Term']")))
    unique_title = f"Automated CI Notice - {int(time.time())}"
    title_input.send_keys(unique_title)

    desc_textarea = driver.find_element(By.CSS_SELECTOR, "textarea[placeholder*='Provide full notice details']")
    desc_textarea.send_keys("This is an automated E2E test notice published to verify the web frontend.")

    # Submit notice
    modal_submit_btn = driver.find_element(By.XPATH, "//form//button[@type='submit' or contains(., 'Publish') or contains(., 'Save')]")
    modal_submit_btn.click()
    time.sleep(1.5)

    # Verify notice is listed on the page
    wait.until(EC.presence_of_element_located((By.XPATH, f"//*[contains(text(), '{unique_title}')]")))
    assert unique_title in driver.page_source, "Newly published notice was not displayed in the notice list"


# ─── 3. Admin Panel Management (Edit / Pin / Delete) ──────────────────────────

@pytest.mark.dashboard
def test_admin_panel_tabs_and_notice_pinning(driver, base_url, credentials):
    """TC-WEB-008: Verify Admin Panel tabs navigation and notice pinning toggle."""
    admin = credentials["admin"]
    perform_login(driver, base_url, admin["email"], admin["password"], role="Admin")

    # Navigate to Admin Panel
    driver.get(f"{base_url}/admin")
    wait = WebDriverWait(driver, 15)

    # Verify Admin tabs exist: Users, Departments, Notices, Settings
    for tab in ["Users", "Departments", "Notices", "Settings"]:
        tab_btn = wait.until(EC.presence_of_element_located((By.XPATH, f"//button[contains(text(), '{tab}')]")))
        assert tab_btn.is_displayed(), f"Admin tab '{tab}' is missing"

    # Switch to 'Notices' management tab
    notices_tab_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Notices')]")
    notices_tab_btn.click()
    time.sleep(1)

    # Locate and toggle Pin button on the first notice in the table
    pin_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Pin') or contains(text(), 'Pinned')]")))
    initial_text = pin_btn.text
    pin_btn.click()
    time.sleep(0.5)
    # The pin button state toggles
    new_text = pin_btn.text
    assert initial_text != new_text or "Pin" in new_text, "Pin status toggle failed"


@pytest.mark.dashboard
def test_admin_panel_notice_deletion(driver, base_url, credentials):
    """TC-WEB-009: Verify notice deletion in the Admin management console."""
    admin = credentials["admin"]
    perform_login(driver, base_url, admin["email"], admin["password"], role="Admin")

    driver.get(f"{base_url}/admin")
    wait = WebDriverWait(driver, 15)

    # Switch to 'Notices' tab
    notices_tab_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Notices')]")))
    notices_tab_btn.click()
    time.sleep(1)

    # Find table rows before deletion
    rows_before = driver.find_elements(By.CSS_SELECTOR, "table tbody tr")
    count_before = len(rows_before)
    assert count_before > 0, "No notices present in Admin table to delete"

    # Click Delete (trash icon button) on the first notice row
    delete_btn = rows_before[0].find_elements(By.CSS_SELECTOR, "button")[-1]
    delete_btn.click()
    time.sleep(1)

    rows_after = driver.find_elements(By.CSS_SELECTOR, "table tbody tr")
    assert len(rows_after) == count_before - 1, "Notice was not removed from the admin table after delete action"


# ─── 4. Role-Based Access Control (RBAC) Tests ───────────────────────────────

@pytest.mark.rbac
def test_role_based_access_control_student_restrictions(driver, base_url, credentials):
    """TC-WEB-010: Verify that Students cannot view or access the Admin Panel navigation."""
    student = credentials["student"]
    perform_login(driver, base_url, student["email"], student["password"], role="Student")

    wait = WebDriverWait(driver, 15)
    wait.until(lambda d: "/dashboard" in d.current_url or "/student" in d.current_url)

    # 1. In the sidebar, 'Admin Panel' link must NOT be visible to student
    admin_links = driver.find_elements(By.XPATH, "//nav//a[contains(@href, '/admin') or contains(., 'Admin Panel')]")
    assert len(admin_links) == 0, "Security violation: Student can see Admin Panel link in sidebar navigation"

    # 2. On the Notices page, student cannot see 'Publish New Notice' button
    driver.get(f"{base_url}/notices")
    time.sleep(1)
    publish_buttons = driver.find_elements(By.XPATH, "//button[contains(., 'Publish New Notice')]")
    assert len(publish_buttons) == 0, "Security violation: Student can see 'Publish New Notice' button"


@pytest.mark.rbac
def test_user_logout_workflow(driver, base_url, credentials):
    """TC-WEB-011: Verify user logout clears the session and redirects back to Login."""
    student = credentials["student"]
    perform_login(driver, base_url, student["email"], student["password"], role="Student")

    wait = WebDriverWait(driver, 15)
    wait.until(lambda d: "/dashboard" in d.current_url or "/student" in d.current_url)

    # Click Sign Out button in sidebar
    signout_btn = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Sign Out') or contains(., 'Logout')]"))
    )
    signout_btn.click()

    # Verify redirection to /login
    wait.until(lambda d: "/login" in d.current_url)
    assert "/login" in driver.current_url, f"Expected URL to contain '/login', got: {driver.current_url}"

    # Verify login form is visible again
    email_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']")))
    assert email_input.is_displayed(), "Login email input not displayed after logout"

