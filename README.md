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
