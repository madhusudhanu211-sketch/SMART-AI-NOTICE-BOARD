# Mobile Debug Report

## Detected Stack
- **Workflow**: Expo Managed Workflow (SDK 50.0.0)
- **Navigation**: `@react-navigation/native` with `@react-navigation/stack` and `@react-navigation/bottom-tabs`
- **Frontend Core**: React Native 0.73.6, React 18.2.0, Axios 1.7.9
- **Backend Stack**: FastAPI, Uvicorn (Port 8000), SQLite (`smart_notice_board.db`), Gemini AI API

## Expo Version
- `expo`: `~50.0.14`
- `sdkVersion`: `50.0.0`

## React Native Version
- `react-native`: `0.73.6`

## Android Compatibility
- **Status**: Compatible with Expo Go (SDK 50)
- **Android Permissions Configured in app.json**: `CAMERA`, `RECORD_AUDIO`, `INTERNET`, `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`
- **Package Name**: `com.smartnoticeboard.app`

## QR Connection Problem
- **Root Cause 1**: `expo-modules-core` was missing from `mobile/package.json`, causing Metro to throw an unhandled `Unable to resolve module expo-modules-core` error when Expo Go attempts to load the bundle.
- **Root Cause 2**: `mobile/app.json` referenced `./assets/icon.png`, `./assets/splash.png`, and `./assets/adaptive-icon.png`, but the `mobile/assets/` directory was missing on disk, causing asset manifest validation failures during initial bundle loading.
- **Root Cause 3**: Multiple zombie Metro server instances were running on ports 8081 & 8082, causing port conflicts during Expo CLI startup.

## Network Problem
- Physical Android phones connect over LAN. Using `localhost` or `127.0.0.1` caused network requests to route to the phone's loopback interface instead of the host PC backend.

## API URL Problem
- **Old Configuration**: Static `localhost` or `10.0.2.2` fallback.
- **New Configuration**: Dynamic host IP detection using `Constants.expoConfig?.hostUri` or `Constants.manifest?.debuggerHost` from `expo-constants`.

## Dependency Problems
- Installed compatible native modules (`expo-modules-core`, `react-native-gesture-handler`) via `npx expo install`.
- Generated missing PNG assets in `mobile/assets/`.

## Navigation Problems
- Added `import 'react-native-gesture-handler';` at line 1 of `mobile/App.js` as required by `@react-navigation/stack`.

## Native Module Problems
- Verified `expo-speech`, `expo-av`, and `expo-status-bar` native bindings are supported by Expo Go SDK 50.

## Fixes Applied
1. Installed SDK 50 compatible native modules using `npx expo install`.
2. Created missing PNG assets (`icon.png`, `splash.png`, `adaptive-icon.png`, `favicon.png`) in `mobile/assets/`.
3. Updated `mobile/App.js` with required gesture-handler import.
4. Dynamically resolved host computer LAN IP in `mobile/src/api/config.js`.
5. Confirmed FastAPI backend CORS configuration (`allow_origins=["*"]`) and binding to `--host 0.0.0.0 --port 8000`.

## Remaining Problems
- None. Metro bundle verification (`npx expo export`) passed with 0 errors for both Android and iOS.
