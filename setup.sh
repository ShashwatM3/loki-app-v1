#!/bin/bash

echo "🚀 LOKI React Native App - Automated Setup"
echo "=========================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please create .env file with your Firebase configuration"
    exit 1
fi

echo "✅ .env file found"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Clear Metro cache
echo "🧹 Clearing Metro cache..."
npx expo start --clear

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Download Firebase config files (google-services.json, GoogleService-Info.plist)"
echo "2. Place them in android/app/ and ios/ respectively"
echo "3. Run: npx expo prebuild --platform android (or ios)"
echo "4. Run: npx expo start"
echo "5. Scan QR code with Expo Go app"