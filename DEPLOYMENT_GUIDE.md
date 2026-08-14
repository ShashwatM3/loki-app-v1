# 🚀 LOKI React Native App - Complete Setup Guide

Follow these exact steps in order to get the LOKI mobile app fully functional. Once you complete all steps, the app will be ready to use through Expo Go on your phone.

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:
- [ ] Node.js installed (v18 or higher)
- [ ] Expo Go app installed on your phone (from App Store/Google Play)
- [ ] A Firebase project (the same one used for the web app)
- [ ] Google Cloud project with Google Maps API enabled
- [ ] Code editor (VS Code recommended)

---

## 🔧 STEP 1: Environment Configuration

### 1.1 Verify Environment Variables
Open `loki-app/.env` file and ensure all variables are set:

```env
# Firebase Configuration
FIREBASE_API_KEY=AIzaSyCzGEGORei6VZcrKKt7rA5cp9ecmdaNaNE
FIREBASE_AUTH_DOMAIN=loki-bc0bb.firebaseapp.com
FIREBASE_PROJECT_ID=loki-bc0bb
FIREBASE_STORAGE_BUCKET=loki-bc0bb.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=927182099419
FIREBASE_APP_ID=1:927182099419:web:60940b9ddec86f6f014dfe
FIREBASE_MEASUREMENT_ID=G-0NSEHMZ3FG

# Google Maps
GOOGLE_MAPS_API_KEY=AIzaSyArXZOIIatAqK8ZlYobyec7ep4sMK2b0Fg

# API Configuration
API_BASE_URL=https://loki-bc0bb.web.app/api
```

**✅ ACTION ITEM**: If any values are missing, copy them from `loki-web-app/.env.local`

---

## 🔥 STEP 2: Firebase Console Setup

### 2.1 Enable Google Sign-In
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `loki-bc0bb`
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Google** and enable it
5. Add your development email to the authorized domains

### 2.2 Get SHA-1 Fingerprint (Android only)
1. Open terminal in `loki-app` directory
2. Run: `cd android && ./gradlew signingReport`
3. Copy the SHA-1 fingerprint
4. Go to Firebase Console → Project Settings → Your Apps → Android
5. Add the SHA-1 fingerprint to your app configuration

### 2.3 Download Firebase Configuration Files

**For Android:**
1. Firebase Console → Project Settings → Your Apps → Android
2. Download `google-services.json`
3. Place it in `loki-app/android/app/`

**For iOS:**
1. Firebase Console → Project Settings → Your Apps → iOS
2. Download `GoogleService-Info.plist`
3. Place it in `loki-app/ios/`

**✅ ACTION ITEM**: 
- Download and place `google-services.json` in `android/app/`
- Download and place `GoogleService-Info.plist` in `ios/` (if developing for iOS)

---

## 🗺️ STEP 3: Google Maps Configuration

### 3.1 Enable Maps SDK
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Library**
4. Search for "Maps SDK for Android" and enable it
5. Search for "Maps SDK for iOS" and enable it (if developing for iOS)

### 3.2 Configure API Key
1. Go to **APIs & Services** → **Credentials**
2. Find your Google Maps API key
3. Click on it and add the following restrictions:
   - **Application restrictions**: IP addresses (leave empty for development)
   - **API restrictions**: Select "Maps SDK for Android" and "Maps SDK for iOS"

**✅ ACTION ITEM**: Ensure your Google Maps API key has proper restrictions set

---

## 📱 STEP 4: Update App Configuration

### 4.1 Update app.json for Google Sign-In
Open `loki-app/app.json` and update the iOS configuration:

```json
"ios": {
  "supportsTablet": true,
  "bundleIdentifier": "com.loki.app",
  "config": {
    "googleSignIn": {
      "reservedClientId": "YOUR_REVERSED_CLIENT_ID_HERE"
    }
  }
}
```

**To get your Reversed Client ID:**
1. Firebase Console → Project Settings → Your Apps → iOS
2. Copy the "iOS Bundle ID" and reverse it (e.g., `com.loki.app` → `app.loki.com`)
3. Replace `YOUR_REVERSED_CLIENT_ID_HERE` with this value

### 4.2 Update Android Configuration
The Android configuration in `app.json` is already set up correctly:
```json
"android": {
  "package": "com.loki.app",
  "permissions": [
    "INTERNET",
    "ACCESS_FINE_LOCATION",
    "ACCESS_COARSE_LOCATION"
  ]
}
```

**✅ ACTION ITEM**: Update the `reservedClientId` in app.json with your actual reversed client ID

---

## 🔐 STEP 5: Google Sign-In Setup (Android)

### 5.1 Configure Google Sign-In in Firebase
1. Firebase Console → Project Settings → Your Apps → Android
2. Ensure "Google Sign-In" is enabled
3. Add your SHA-1 fingerprint (from Step 2.2)

### 5.2 Generate Native Files
The android/ and ios/ directories will be generated when you first build:

```bash
# For Android (generates android directory)
npx expo prebuild --platform android

# For iOS (generates ios directory)  
npx expo prebuild --platform ios
```

**After prebuild, add Google Play Services:**
Open `loki-app/android/app/build.gradle` and add:

```gradle
dependencies {
    // ... existing dependencies
    implementation 'com.google.android.gms:play-services-auth:20.7.0'
}
```

**✅ ACTION ITEM**: 
- Run prebuild for your target platform(s)
- Add the Google Play Services Auth dependency
- Sync the Gradle project

---

## 🏃 STEP 6: Install Dependencies and Build

### 6.1 Install All Dependencies
```bash
cd loki-app
npm install
```

### 6.2 Clear Cache and Rebuild
```bash
npx expo start --clear
```

**✅ ACTION ITEM**: Run the installation and cache clear commands

---

## 🚀 STEP 7: Run the App

### 7.1 Start Expo Development Server
```bash
cd loki-app
npx expo start
```

### 7.2 Choose Your Platform
- **For Android**: Press `a` to run on Android emulator
- **For iOS**: Press `i` to run on iOS simulator  
- **For Physical Device**: Scan the QR code with Expo Go app

**✅ ACTION ITEM**: Start the Expo server and choose your target platform

---

## 🧪 STEP 8: Test Core Functionality

### 8.1 Test Authentication Flow
1. Open the app on your device/simulator
2. Click "Sign in with Google"
3. Complete Google Sign-In process
4. Verify you're logged in and can see your user data

### 8.2 Test Browse Screen
1. Navigate to the Browse tab
2. Verify places are loading from Firestore
3. Test search functionality
4. Test category filtering

### 8.3 Test Collections
1. Navigate to Collections tab
2. Create a new collection
3. Verify it appears in your collections list
4. Add places to the collection (if functionality exists)

### 8.4 Test Profile
1. Navigate to Profile tab
2. Verify your user information is displayed
3. Test sign-out functionality

**✅ ACTION ITEM**: Test each core feature and verify it works as expected

---

## 🎯 STEP 9: Final Configuration Checks

### 9.1 Verify Firebase Connection
- Check that you can sign in with Google
- Verify that places are loading from Firestore
- Ensure user data is being saved correctly

### 9.2 Verify Network Requests
- Check that API calls are working (if any)
- Ensure there are no CORS or network errors

### 9.3 Check for Runtime Errors
- Monitor the Expo terminal for any errors
- Check your device/simulator console for warnings
- Fix any critical issues that appear

**✅ ACTION ITEM**: Verify all connections are working and there are no critical errors

---

## 📦 STEP 10: Prepare for Distribution (Optional)

### For Testing with Expo Go:
- The app is now ready to test with Expo Go
- Share the QR code with testers
- They can scan it with Expo Go to test the app

### For Building Standalone Apps:
1. **EAS Build**: `eas build --platform android` or `eas build --platform ios`
2. **Classic Build**: `npx expo build:android` or `npx expo build:ios`

**✅ ACTION ITEM**: (Optional) If you want to build standalone apps, follow the Expo build documentation

---

## 🔍 Troubleshooting Common Issues

### Issue: "Google Sign-In failed"
**Solution**: 
- Verify SHA-1 fingerprint is added to Firebase Console
- Check that Google Sign-In is enabled in Firebase Authentication
- Ensure your app's package name/bundle ID matches Firebase config

### Issue: "Places not loading"
**Solution**:
- Check Firebase Firestore rules
- Verify your Firebase project ID is correct
- Check network connectivity

### Issue: "Maps not showing"
**Solution**:
- Verify Google Maps API key is valid
- Check that Maps SDK is enabled in Google Cloud Console
- Ensure API key restrictions are properly set

### Issue: "Build errors"
**Solution**:
- Run `npm install` to ensure all dependencies are installed
- Clear cache with `npx expo start --clear`
- Check for TypeScript errors with `npx tsc --noEmit`

---

## ✅ Final Verification Checklist

Before considering the app ready, ensure:

- [ ] Environment variables are properly set in `.env`
- [ ] Firebase configuration files are in place (`google-services.json`, `GoogleService-Info.plist`)
- [ ] Google Sign-In is enabled in Firebase Console
- [ ] SHA-1 fingerprint is added to Firebase Android config
- [ ] Google Maps API key is properly configured
- [ ] App runs without compilation errors
- [ ] Google Sign-In works on your device
- [ ] Places load from Firestore
- [ ] Collections can be created and managed
- [ ] Profile information displays correctly
- [ ] No critical runtime errors

---

## 🎉 Success Criteria

The app is **READY FOR USE** when:

1. ✅ You can sign in with Google
2. ✅ Places load and display correctly
3. ✅ You can search and filter places
4. ✅ You can create and manage collections
5. ✅ Profile information displays correctly
6. ✅ The app runs smoothly on your target platform
7. ✅ No critical errors in the console

Once all these criteria are met, your LOKI mobile app is fully functional and ready for your pitch night demo!

---

## 📞 Need Help?

If you encounter issues:
1. Check the Expo terminal for error messages
2. Verify Firebase Console configuration
3. Check Google Cloud Console API enablement
4. Review Firebase and Google Cloud documentation
5. Ensure all steps in this guide were completed in order

---

**Estimated Time to Complete**: 30-45 minutes
**Difficulty Level**: Beginner-friendly (copy-paste steps)
**Result**: Fully functional LOKI mobile app ready for Expo Go