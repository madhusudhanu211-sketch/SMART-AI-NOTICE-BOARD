# Expo Android Error Report

## Original Error
`Something went wrong. Sorry about that. You can go back to Expo home or try to reload the project. View error log`

## Actual Root Cause
1. **Zombie Metro Process & Port Hijacking**: Four orphaned background Node.js processes (PIDs 19984, 22800, 22628, 19800) were holding ports 8081, 8082, 8083, and 8084. When a new Expo instance started on port 8083 or 8084, Expo Go on Android attempted to request the bundle on standard port 8081. Port 8081 was occupied by a stale zombie process that returned empty/invalid bundle manifests, triggering the "Something went wrong" screen in Expo Go.
2. **Missing Native Module (`expo-modules-core`)**: `expo-speech` imported `UnavailabilityError` from `expo-modules-core`, which was missing from `mobile/package.json`, causing Metro bundle resolution to crash.
3. **Missing `./assets/` Directory**: `app.json` configured asset paths (`./assets/icon.png`, `./assets/splash.png`, `./assets/adaptive-icon.png`), but the `mobile/assets/` directory did not exist on disk, breaking Expo manifest validation.

## Error Message
`Port 8081 is being used by another process` / `Metro 404 / Stale Manifest on port 8081`

## File
- `Process Table` (PIDs 19984, 22800, 22628, 19800)
- `mobile/package.json`
- `mobile/app.json`
- `mobile/src/api/config.js`

## Line
- `mobile/package.json` (missing `expo-modules-core` entry)
- `mobile/app.json` (lines 7, 10, 23: missing `./assets/*` target files)
- `mobile/src/api/config.js` (line 4: hardcoded `localhost` fallback)

## Package
- `expo-modules-core` & `@react-navigation/stack`

## Fix Applied
1. Killed all zombie Metro bundler processes using `Stop-Process -Id 19984,22800,22628,19800 -Force`.
2. Installed SDK 50 compatible native packages (`expo-modules-core`, `react-native-gesture-handler`) via `npx expo install`.
3. Created `mobile/assets/` directory with `icon.png`, `splash.png`, `adaptive-icon.png`, `favicon.png`.
4. Added `import 'react-native-gesture-handler';` at line 1 of `mobile/App.js`.
5. Created `mobile/src/components/ErrorBoundary.js` and wrapped `App.js`.
6. Configured dynamic PC LAN IP (`10.38.216.232`) auto-detection in `mobile/src/api/config.js`.

## Dependencies Changed
- `expo-modules-core`
- `react-native-gesture-handler` (`~2.14.0`)

## Configuration Changed
- Created missing PNG assets in `mobile/assets/`.
- Updated `mobile/src/api/config.js` with `expo-constants` IP resolution.

## Network Configuration
- **PC IP**: `10.38.216.232`
- **Metro Port**: `8081` (Freed & Default)
- **Backend IP**: `0.0.0.0`
- **Backend Port**: `8000`

## Android Test
**PASS** — Port 8081 freed, bundle builds 100% cleanly for Android & iOS.

## Remaining Error
**None**.
