# 🎯 LOKI React Native App - Complete Setup Guide

A fully-functional React Native version of the LOKI web application with Google Sign-In, place discovery, collection management, and real-time Firebase sync.

---

## 📱 Features

- ✅ **Google Sign-In Authentication** - Secure login with Firebase
- ✅ **Place Discovery** - Browse, search, and filter Dubai places
- ✅ **Collection Management** - Create and manage place collections
- ✅ **User Profile** - View statistics and account settings
- ✅ **Real-Time Sync** - Same data works on web and mobile
- ✅ **Zero Backend Changes** - Uses your existing Firebase infrastructure

---

## 🚀 Quick Start (18 Minutes)

Follow these 7 steps to get the app running on your device:

### STEP 1: Clone and Install (2 minutes)
```bash
git clone https://github.com/ShashwatM3/loki-app-v1.git
cd loki-app-v1
npm install
```

### STEP 2: Configure Environment Variables (3 minutes)
1. Copy the Firebase configuration from your web app's `.env.local` file
2. Create/update the `.env` file in the project root with these values:

```env
# Firebase Configuration
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_auth_domain_here
FIREBASE_PROJECT_ID=your_project_id_here
FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
FIREBASE_APP_ID=your_app_id_here
FIREBASE_MEASUREMENT_ID=your_measurement_id_here

# Google Maps
GOOGLE_MAPS_API_KEY=your_maps_api_key_here

# API Configuration
API_BASE_URL=https://loki-bc0bb.web.app/api
```

**✅ DONE WHEN**: `.env` file exists with all Firebase values filled in

### STEP 3: Firebase Console Setup (3 minutes)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (should be `loki-bc0bb`)
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Google** and enable it
5. Click **Save**

**✅ DONE WHEN**: Google Sign-In is enabled in Firebase Authentication

### STEP 4: Download Firebase Config Files (3 minutes)
1. In Firebase Console, go to **Project Settings** → **Your Apps**
2. **For Android:**
   - Click "Add app" → Android
   - Package name: `com.loki.app`
   - Download `google-services.json`
   - Place it in `android/app/` directory
3. **For iOS (if developing for iOS):**
   - Click "Add app" → iOS
   - Bundle ID: `com.loki.app`
   - Download `GoogleService-Info.plist`
   - Place it in `ios/` directory

**✅ DONE WHEN**: Firebase config files are in the correct directories

### STEP 5: Generate Native Files (2 minutes)
```bash
# For Android (generates android directory)
npx expo prebuild --platform android

# For iOS (generates ios directory) - Mac only
npx expo prebuild --platform ios
```

**✅ DONE WHEN**: android/ and ios/ directories exist

### STEP 6: Start the App (2 minutes)
```bash
npx expo start --clear
```
Then choose your platform:
- Press `a` for Android emulator
- Press `i` for iOS simulator (Mac only)
- Or scan QR code with Expo Go app for physical device

**✅ DONE WHEN**: Expo server is running and you can see the app

### STEP 7: Test Core Features (3 minutes)
1. **Test Authentication**: Click "Sign in with Google" and complete the sign-in flow
2. **Test Browse**: Navigate to Browse tab, verify places load from Firestore
3. **Test Search**: Use the search bar to find places
4. **Test Collections**: Go to Collections tab, create a new collection
5. **Test Profile**: Go to Profile tab, verify your information displays

**✅ DONE WHEN**: All core features work without errors

---

## 🔧 Prerequisites

Before starting, ensure you have:
- **Node.js** installed (v18 or higher)
- **Expo Go** app on your phone (from App Store/Google Play)
- **Firebase Project** access (the same one used for the web app)
- **Google Cloud Project** with Maps API enabled
- **Code Editor** (VS Code recommended)

---

## 📋 Detailed Setup Instructions

### Environment Configuration

The `.env` file must contain these variables:

```env
FIREBASE_API_KEY=AIzaSyCzGEGORei6VZcrKKt7rA5cp9ecmdaNaNE
FIREBASE_AUTH_DOMAIN=loki-bc0bb.firebaseapp.com
FIREBASE_PROJECT_ID=loki-bc0bb
FIREBASE_STORAGE_BUCKET=loki-bc0bb.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=927182099419
FIREBASE_APP_ID=1:927182099419:web:60940b9ddec86f6f014dfe
FIREBASE_MEASUREMENT_ID=G-0NSEHMZ3FG
GOOGLE_MAPS_API_KEY=AIzaSyArXZOIIatAqK8ZlYobyec7ep4sMK2b0Fg
API_BASE_URL=https://loki-bc0bb.web.app/api
```

### Firebase Configuration

#### Enable Google Sign-In:
1. Firebase Console → Authentication → Sign-in method → Google → Enable
2. Click **Save**

#### Download Config Files:
- **Android**: Firebase Console → Project Settings → Your Apps → Android → Download `google-services.json` → Place in `android/app/`
- **iOS**: Firebase Console → Project Settings → Your Apps → iOS → Download `GoogleService-Info.plist` → Place in `ios/`

#### Get SHA-1 Fingerprint (Android Only):
```bash
cd android
./gradlew signingReport
```
Copy the SHA-1 fingerprint and add it to Firebase Console → Project Settings → Your Apps → Android

### Google Maps Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Library**
4. Enable "Maps SDK for Android" and "Maps SDK for iOS"
5. Go to **APIs & Services** → **Credentials**
6. Configure your Google Maps API key with proper API restrictions

### App Configuration

The app is already configured in `app.json`:
- **Package Name**: `com.loki.app` (Android)
- **Bundle Identifier**: `com.loki.app` (iOS)
- **Permissions**: Internet, location access
- **Plugins**: Expo Maps, Firebase

---

## 🏃 Running the App

### Development Mode:
```bash
npm install
npx expo start --clear
```

### With Physical Device:
1. Install Expo Go from App Store/Google Play
2. Run `npx expo start`
3. Scan QR code with Expo Go

### With Simulator/Emulator:
- Press `a` for Android emulator
- Press `i` for iOS simulator (Mac only)

---

## 🧪 Testing Checklist

After setup, verify these features work:

- [ ] Google Sign-In authentication completes successfully
- [ ] User profile loads with correct information
- [ ] Places load from Firestore in Browse screen
- [ ] Search functionality finds places correctly
- [ ] Category filtering works
- [ ] Collections can be created
- [ ] Collections display in Collections tab
- [ ] Profile information shows correctly
- [ ] Sign-out functionality works
- [ ] No critical errors in console

---

## 🔍 Troubleshooting

### Google Sign-In Issues:
- **Problem**: Sign-in fails
- **Solution**: Verify SHA-1 fingerprint is added to Firebase Console, check package name matches Firebase config

### Places Not Loading:
- **Problem**: No places appear in Browse screen
- **Solution**: Check Firestore rules in Firebase Console, verify Firebase project ID in `.env`

### Build Errors:
- **Problem**: App won't compile
- **Solution**: Run `npm install` again, try `npx expo start --clear`

### Network Issues:
- **Problem**: Can't connect to Firebase
- **Solution**: Check network connectivity, verify Firebase project ID is correct

### Native Build Issues:
- **Problem**: android/ or ios/ directories don't exist
- **Solution**: Run `npx expo prebuild --platform android` (or ios)

---

## 📱 App Structure

```
loki-app-v1/
├── app/
│   ├── auth/              # Authentication screens
│   │   └── LoginScreen.tsx
│   └── main/              # Main app screens
│       ├── BrowseScreen.tsx
│       ├── MapsScreen.tsx
│       ├── CollectionsScreen.tsx
│       └── ProfileScreen.tsx
├── components/            # Reusable UI components
├── lib/                   # Core libraries
│   ├── firebase.ts        # Firebase configuration
│   ├── store.ts           # State management (Zustand)
│   ├── types.ts           # TypeScript interfaces
│   └── utils.ts           # Utility functions
├── services/              # API and auth services
│   ├── apiClient.ts       # HTTP client
│   └── authService.ts     # Authentication service
├── navigation/            # App navigation
│   └── AppNavigator.tsx
├── constants/             # Configuration constants
│   └── apiEndpoints.ts
└── onboard/               # Architecture documentation
```

---

## 🎪 For Demo/Pitch Night

### Minimum Setup for Demo:
1. Configure `.env` file with Firebase credentials
2. Enable Google Sign-In in Firebase Console
3. Download Firebase config files
4. Run `npm install` and `npx expo start`
5. Test with Expo Go

### What You Can Demo:
- ✅ Google Sign-In authentication
- ✅ Place browsing with search and filtering
- ✅ Collection creation and management
- ✅ User profile with statistics
- ✅ Real-time data sync with web app
- ✅ Cross-platform functionality

### What to Skip if Time-Pressed:
- Google Maps integration (placeholder works for demo)
- Physical device testing (simulator is fine)
- Advanced features (AI chatbot, collaboration)

---

## 📊 Technical Details

### Tech Stack:
- **React Native** with Expo
- **TypeScript** for type safety
- **Firebase** (Auth, Firestore, Storage)
- **React Navigation** for navigation
- **Zustand** for state management
- **React Native Paper** for UI components
- **Axios** for HTTP requests

### Key Features:
- **Authentication**: Firebase Auth with Google provider
- **Database**: Firestore for real-time data
- **State Management**: Zustand store with user data, places, collections
- **Navigation**: Tab-based navigation with authentication flow
- **API Integration**: Direct Firebase + API client for external services

---

## 🚧 Future Enhancements

- Real Google Maps integration (currently placeholder)
- AI Chatbot ("Ask Loki") feature
- Real-time collaboration features
- Push notifications
- Offline support
- Advanced animations and transitions

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify Firebase Console configuration
3. Check Google Cloud Console API enablement
4. Review Expo documentation for platform-specific issues
5. Ensure all setup steps were completed in order

---

## 🎉 Success Criteria

The app is **fully functional** when:
1. ✅ You can sign in with Google
2. ✅ Places load from Firestore
3. ✅ Search and filtering work
4. ✅ Collections can be created and managed
5. ✅ Profile information displays correctly
6. ✅ App runs smoothly on your target platform
7. ✅ No critical errors in console

---

## 📄 License

This project is part of the LOKI application ecosystem.

---

**Total Setup Time**: 20 minutes
**Difficulty**: Beginner-friendly (copy-paste steps)
**Result**: Fully functional mobile app ready for use