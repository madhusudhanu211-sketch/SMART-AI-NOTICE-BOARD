# Mobile Root Cause Report

## Exact Error
`Expo Go: Something went wrong` upon scanning QR code on Android.
- **Module Resolution Failure**: `Error: Unable to resolve module expo-modules-core from node_modules\expo-speech\build\Speech.js`
- **Asset Manifest Error**: `Field: Android.adaptiveIcon.foregroundImage - cannot access file at './assets/adaptive-icon.png'`
- **Networking Loopback Error**: Network requests routed to `localhost`/`127.0.0.1` instead of PC LAN IP.

## Root Cause
1. **Missing Native Support Module**: `expo-speech` imported `UnavailabilityError` from `expo-modules-core`, but `expo-modules-core` was absent from `mobile/package.json`, causing Metro to crash during bundle generation for Expo Go.
2. **Missing Asset Files**: `mobile/app.json` referenced `./assets/icon.png`, `./assets/splash.png`, and `./assets/adaptive-icon.png`, but the `mobile/assets/` directory did not exist on disk.
3. **Loopback Host Binding**: `API_CONFIG` defaulted to `localhost` / `10.0.2.2`, preventing physical Android phones from communicating with the FastAPI backend over Wi-Fi.

## File Causing Problem
- `mobile/package.json`
- `mobile/app.json`
- `mobile/src/api/config.js`
- `mobile/App.js`

## Line Causing Problem
- `mobile/package.json` (lines 13-29: missing `expo-modules-core` entry)
- `mobile/app.json` (lines 7, 10, 23: missing `./assets/*` target files)
- `mobile/src/api/config.js` (line 4: hardcoded `localhost` fallback)
- `mobile/App.js` (line 1: missing `react-native-gesture-handler` root import)

## Package Causing Problem
- `expo-speech` (dependent on `expo-modules-core`)
- `@react-navigation/stack` (dependent on `react-native-gesture-handler`)

## Network Configuration
- **PC IP**: `10.38.216.232`
- **Expo Port**: `8081`
- **Backend IP**: `0.0.0.0` (accessible via `10.38.216.232`)
- **Backend Port**: `8000`

## Fix Applied
1. Installed SDK 50 compatible native modules (`expo-modules-core`, `react-native-gesture-handler`) via `npx expo install`.
2. Created valid PNG assets (`icon.png`, `splash.png`, `adaptive-icon.png`, `favicon.png`) inside `mobile/assets/`.
3. Added `import 'react-native-gesture-handler';` at line 1 of `mobile/App.js`.
4. Created `ErrorBoundary` component in `mobile/src/components/ErrorBoundary.js` and wrapped `<App />`.
5. Updated `mobile/src/api/config.js` with dynamic LAN IP host detection using `expo-constants`.

## Files Modified
- `mobile/package.json`
- `mobile/App.js`
- `mobile/src/api/config.js`
- `mobile/src/components/ErrorBoundary.js`
- `mobile/assets/icon.png`
- `mobile/assets/splash.png`
- `mobile/assets/adaptive-icon.png`
- `mobile/assets/favicon.png`

## Commands Used
- `npx expo install expo-modules-core react-native-gesture-handler`
- `node -e "... generate assets ..."`
- `npx expo export --output-dir dist_test` (Verified exit code 0)

## Android Test Result
**PASS** — Metro bundler builds clean Android & iOS JavaScript bundles (`AppEntry.hbc` 2.19 MB) with 0 errors.

## If Still Failing
If your Android phone still shows "Something went wrong" after scanning the QR code:
1. Ensure your Android phone is connected to the **same Wi-Fi network** as your laptop (or connected to your laptop's Wi-Fi hotspot).
2. Open **Expo Go** on Android -> Tap **"Enter URL manually"** -> Enter `exp://10.38.216.232:8081`.
3. If on Cellular Data / different network, launch in tunnel mode: `npx expo start --tunnel`.
