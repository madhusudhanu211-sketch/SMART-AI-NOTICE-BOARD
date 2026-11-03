# Next-Generation Smart Notice Board with Voice Recognition and Chatbot Integration

An end-to-end, production-ready mobile application designed as a Final Year Project for academic institutions. Built using React Native (Expo SDK 52), FastAPI (Python 3.11+), SQLite / PostgreSQL, and Google Gemini AI.

---

## 🌟 Key Features

* 📢 **Interactive Smart Notice Board:** Categorized circulars, exam schedules, events, emergency alerts, attachment downloads (PDF/Images), and QR code sharing.
* 🤖 **AI Campus Assistant (Gemini AI):** Instant AI query resolution for student policies, schedules, notices, and smart notice summarization.
* 🎙️ **Voice Recognition & Control:** Hands-free voice assistant supporting voice commands for search, navigation, and speech synthesis feedback.
* 🔒 **Role-Based Access Control (RBAC):** Distinct dashboards for **Students**, **Faculty**, and **Administrators** secured with JWT authentication & BCrypt password hashing.
* 📅 **Academic Management:** Access to Class Timetables, Attendance tracking, Assignments submission, Placement drives, and Event registrations.
* 🌓 **Dynamic Theme & Localization:** Dark/Light mode glassmorphism UI and multi-language support (English, Spanish, Hindi, French).

---

## 🏗️ System Architecture

```
                                +-----------------------------+
                                |  React Native / Expo App    |
                                |  (Standalone Android APK)   |
                                +--------------+--------------+
                                               |
                                        REST API / HTTP
                                               |
                                +--------------v--------------+
                                |      FastAPI Backend        |
                                |      (Python 3.11+)         |
                                +-------+-------------+-------+
                                        |             |
                         +--------------v---+     +---v----------------+
                         |  PostgreSQL / DB |     |  Google Gemini AI  |
                         +------------------+     +--------------------+
```

---

## 🚀 Quick Start Guide

### 1. Backend Setup (FastAPI & Database)

```bash
cd backend

# Create & activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate

# Install backend dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
> The database (`smart_notice_board.db`) is automatically initialized and seeded with demo accounts on first launch!

#### Pre-seeded Demo Logins:
* **Admin:** `admin@smartnoticeboard.edu` / `Password123!`
* **Faculty:** `faculty@smartnoticeboard.edu` / `Password123!`
* **Student:** `student@smartnoticeboard.edu` / `Password123!`

---

### 2. Frontend Setup (React Native & Expo)

```bash
# Navigate to short junction path (prevents Windows MAX_PATH issues)
cd C:\snb

# Install node dependencies
npm install

# Port forward ADB for USB-connected Android devices:
adb reverse tcp:8000 tcp:8000
adb reverse tcp:8081 tcp:8081

# Launch Metro Bundler
npx expo start --clear
```

---

### 3. Build Standalone Android APK

```bash
cd C:\snb\android
gradlew.bat assembleDebug
```
The output APK is compiled at: `android\app\build\outputs\apk\debug\app-debug.apk`.

---

## 🛡️ Security & Compliance
* **JWT Tokens:** Transmitted via Authorization header and stored in `expo-secure-store`.
* **CORS & Middleware:** Configured for local development and production deployments.
* **SQL Injection & XSS Protection:** Managed via SQLAlchemy ORM parameter binding and Pydantic request validation.

---

## 🧪 Automated Testing & CI/CD Pipeline

The project integrates three comprehensive, production-grade automated testing suites orchestrated via **GitHub Actions**:

```
                                  GitHub Actions CI/CD
                     ┌──────────────────────┼──────────────────────┐
                     ▼                      ▼                      ▼
         Selenium Web Automation    Appium Mobile Automation   Locust API Load Tests
           (React Web Portal)        (React Native Android)     (FastAPI REST Endpoints)
                     │                      │                      │
                     ▼                      ▼                      ▼
           Headless Chrome E2E         Android Emulator        100, 300, 500 Virtual Users
           HTML & Excel Artifacts     HTML, Logs & Screenshots  HTML, CSV & Excel Reports
```

### 1. Selenium Web Automation Testing
Automates role-based logins, campus notice publishing, keyword search, notice pinning/deletion, and RBAC restrictions using Python and pytest against the React web application.

* **Workflow File:** [`.github/workflows/selenium-tests.yml`](file:///.github/workflows/selenium-tests.yml)
* **Test Suite:** [`selenium-tests/tests/test_web_portal.py`](file:///selenium-tests/tests/test_web_portal.py)
* **Configuration:** [`selenium-tests/pytest.ini`](file:///selenium-tests/pytest.ini) & [`selenium-tests/conftest.py`](file:///selenium-tests/conftest.py)

#### Run Locally:
```bash
# 1. Start the Backend API (Terminal 1)
cd backend
python -m uvicorn app.main:app --port 8000

# 2. Start the React Web Portal (Terminal 2)
cd web
npm run dev

# 3. Install test dependencies & run Selenium (Terminal 3)
pip install -r selenium-tests/requirements.txt
pytest selenium-tests/tests --html=selenium-tests/reports/selenium-test-report.html --self-contained-html
python selenium-tests/generate_report.py
```

---

### 2. Appium Mobile Automation Testing
Automates native Android flows including app launch, authentication, 5-tab bottom navigation, notice reading, AI chatbot messaging, voice UI controls, and profile logout.

* **Workflow File:** [`.github/workflows/appium-tests.yml`](file:///.github/workflows/appium-tests.yml)
* **Test Suite:** [`appium-tests/tests/test_mobile_app.py`](file:///appium-tests/tests/test_mobile_app.py)
* **Configuration:** [`appium-tests/pytest.ini`](file:///appium-tests/pytest.ini) & [`appium-tests/conftest.py`](file:///appium-tests/conftest.py)

#### Run Locally:
```bash
# 1. Install Appium 2 and UiAutomator2 driver
npm install -g appium
appium driver install uiautomator2

# 2. Start Appium Server (Terminal 1)
appium --port 4723

# 3. Start an Android Emulator / connect USB device with USB debugging enabled
adb devices

# 4. Run Mobile Pytest Suite (Terminal 2)
pip install -r appium-tests/requirements.txt
pytest appium-tests/tests --html=appium-tests/reports/appium-test-report.html --self-contained-html
python appium-tests/generate_report.py
```

---

### 3. Load & Performance Testing (Locust)
Exercises real FastAPI REST endpoints (Auth, Notices, AI Chatbot, Attendance, Timetable, Voice Assistant) across **100, 300, and 500 concurrent virtual users**.

* **Workflow File:** [`.github/workflows/load-tests.yml`](file:///.github/workflows/load-tests.yml)
* **Test Runner:** [`load-tests/run_load_test.py`](file:///load-tests/run_load_test.py)
* **User Tasks & Scenarios:** [`load-tests/locustfile.py`](file:///load-tests/locustfile.py)

#### Measured Performance Metrics:
* **Average Response Time (ms)** & **95th Percentile Latency (ms)**
* **Requests per Second (RPS)** & **Total Requests Executed**
* **Failure Percentage (%)** & Endpoint distribution breakdown

#### Run Locally:
```bash
# 1. Start the FastAPI backend
cd backend
python -m uvicorn app.main:app --port 8000

# 2. Run multi-stage load test (100, 300, and 500 users)
pip install -r load-tests/requirements.txt
python load-tests/run_load_test.py --stages --duration 30s

# Or run interactive Locust Web UI:
locust -f load-tests/locustfile.py --host http://localhost:8000
# Open http://localhost:8089 in your browser
```

---

### 4. GitHub Secrets Configuration
To enable all tests and secure credentials in GitHub Actions CI/CD, configure the following secrets in your repository (**Settings → Secrets and variables → Actions → Repository secrets**):

| Secret Name | Description | Default / Example Value |
| :--- | :--- | :--- |
| `JWT_SECRET_KEY` | Secret key used for signing JWT tokens | Production secret key |
| `ADMIN_EMAIL` | Administrator login email | `admin@smartnoticeboard.edu` |
| `ADMIN_PASSWORD` | Administrator password | `Password123!` |
| `FACULTY_EMAIL` | Faculty login email | `faculty@smartnoticeboard.edu` |
| `FACULTY_PASSWORD` | Faculty password | `Password123!` |
| `STUDENT_EMAIL` | Student login email | `student@smartnoticeboard.edu` |
| `STUDENT_PASSWORD` | Student password | `Password123!` |
| `GEMINI_API_KEY` | *(Optional)* Google Gemini AI API key | `AIzaSy...` |
| `DATABASE_URL` | *(Optional)* Remote DB URL (default: SQLite) | `postgresql://...` |

> [!NOTE]
> Workflows include safe fallback values matching default seed data, so CI jobs can run immediately on forks or public PRs even before custom secrets are added.

---

### 5. Accessing Reports & Artifacts in GitHub Actions
After any push, pull request, or manual run:
1. Navigate to the **Actions** tab on GitHub.
2. Select the relevant workflow (**Selenium Web Automation**, **Appium Mobile Automation**, or **Load and Performance Testing**).
3. Click on the latest workflow run.
4. Scroll down to the **Artifacts** section:
   - `Selenium-Web-Test-Reports`: Download HTML test report, Excel test case matrix, and failure screenshots.
   - `Appium-Test-Results-Build-XXX`: Download the full `Test Results/` folder containing `Excel/Automation_Test_Report.xlsx`, `HTML/execution-report.html`, `Screenshots/`, `Logs/`, and `Summary/summary.md`.
   - `Load-Testing-Performance-Reports`: Download Locust interactive HTML reports, CSV metrics, summary markdown, and Excel analysis.
5. Review the **Step Summary** directly inside the GitHub Actions run for an instant table overview of PASS/FAIL metrics and response times.

---

### 🌐 6. Live GitHub Pages Report Hosting
Every execution of the Appium E2E workflow automatically packages and deploys test results to **GitHub Pages**:

* **Live Report Dashboard URL:**  
  👉 **[https://madhusudhanu211-sketch.github.io/SMART-AI-NOTICE-BOARD/reports/latest/execution-report.html](https://madhusudhanu211-sketch.github.io/SMART-AI-NOTICE-BOARD/reports/latest/execution-report.html)**

#### Directory Structure on GitHub Pages:
```
reports/
├── latest/
│   ├── execution-report.html
│   ├── summary.md
│   ├── screenshots/
│   └── logs/
└── history/
    ├── build-001/
    ├── build-002/
    └── build-003/
```

#### One-Time Setup on GitHub:
1. Go to repository **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **Deploy from a branch**.
3. Under **Branch**, select **`gh-pages`** and folder **`/ (root)`**.
4. Click **Save**. All future builds will deploy automatically!

