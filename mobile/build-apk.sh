#!/bin/bash
echo "==================================================="
echo "📱 Smart Notice Board - Automated Android APK Builder"
echo "==================================================="
echo ""

if [ ! -d "node_modules" ]; then
    echo "[1/3] Installing dependencies..."
    npm install
else
    echo "[1/3] Dependencies verified."
fi

echo ""
echo "[2/3] Checking EAS CLI..."
if ! command -v eas &> /dev/null
then
    echo "Installing EAS CLI..."
    npm install -g eas-cli
fi

echo ""
echo "[3/3] Initiating EAS Android APK Build..."
echo "Target: Standalone APK (Preview Profile)"
npx eas-cli build --platform android --profile preview

echo ""
echo "==================================================="
echo "✅ Build Command Dispatched!"
echo "Download your generated APK from the Expo Dashboard URL shown above."
echo "==================================================="
