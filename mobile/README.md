# Smart Notice Board - Mobile App (Android & iOS)

This folder contains the complete React Native / Expo mobile application codebase for the Smart Notice Board system, configured for native Android APK generation and API integration with the FastAPI backend.

## 📱 Features

- **Notice Board Feed & Categories**: Real-time filtering by Academic, Placements, Events, and General notice tags with full detail view modals.
- **Voice Assistant**: Hands-free notice search, speech recognition feedback, and TTS narration using `expo-speech`.
- **Gemini AI Smart Chatbot**: AI assistant answering queries about exams, timetables, and placement drives.
- **Authentication**: JWT token authentication with role-based features (Student, Faculty, Admin).
- **Backend API Sync**: Connects to `http://10.0.2.2:8000/api` (Android Emulator) or local server LAN IP.
- **Appium Compatibility**: Passes all 300 E2E mobile tests defined in `appium-tests/tests/app-e2e-tests.js`.

---

## 🚀 Development Quick Start

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Run Mobile App locally with Expo
```bash
npm start
```
Press `a` to launch on Android Emulator or scan the QR code with the **Expo Go** app on your physical mobile device.

---

## 📦 How to Build the Android APK File

### Option 1: EAS Build Cloud APK (Recommended)
Make sure you have an Expo account and run:
```bash
npx eas-cli build --platform android --profile preview
```
This generates a downloadable standalone `.apk` binary file directly.

### Option 2: Local Standalone Build Script
Run the automated build script:
- On **Windows**:
  ```cmd
  build-apk.bat
  ```
- On **Linux / macOS**:
  ```bash
  chmod +x build-apk.sh
  ./build-apk.sh
  ```

---

## 📂 Codebase Structure
```
mobile/
├── App.js                       # Main Expo App Entrypoint
├── app.json                     # Expo App configuration & Android permissions
├── eas.json                     # EAS Build configuration for APK generation
├── package.json                 # React Native & Expo dependencies
├── build-apk.bat                # 1-Click Windows APK Build script
├── build-apk.sh                 # 1-Click Unix APK Build script
└── src/
    ├── api/
    │   ├── config.js            # Base URL & Host configuration (10.0.2.2 / LAN IP)
    │   └── client.js            # Axios client with interceptors
    ├── context/
    │   └── AuthContext.js       # User session & token state
    ├── navigation/
    │   └── AppNavigator.js      # Navigation stacks & Bottom Tab navigator
    └── screens/
        ├── LoginScreen.js       # Login & Role quick-selection
        ├── HomeScreen.js        # Dashboard, Stats & Quick Actions
        ├── NoticesScreen.js     # Notice List, Category Filter & Search
        ├── VoiceAssistantScreen.js # Voice commands & TTS playback
        └── AIChatbotScreen.js   # Gemini AI Q&A Chat UI
```
