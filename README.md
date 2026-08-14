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

## 🚀 Quick Start (20 Minutes)

Follow these 7 steps EXACTLY in order to get the app running on your device.

---

### STEP 1: Clone and Install Dependencies (2 minutes)

**Open your terminal/command prompt and type these commands one by one:**

```bash
git clone https://github.com/ShashwatM3/loki-app-v1.git
```

```bash
cd loki-app-v1
```

```bash
npm install
```

**Wait for the installation to complete** (this may take 1-2 minutes). You'll see "added X packages" when it's done.

**✅ DONE WHEN**: You see "added X packages" in your terminal and no errors.

---

### STEP 2: Configure Environment Variables (3 minutes)

**Open the `.env` file in your project folder** (it's in the main loki-app-v1 folder).

**Copy these values** from your web app's `.env.local` file OR use the values below if they're the same:

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

**Save the file and close it.**

**✅ DONE WHEN**: The `.env` file exists in your project folder and has all the values filled in.

---

### STEP 3: Generate Native Files FIRST (3 minutes)

**IMPORTANT: Do this step BEFORE downloading Firebase config files!**

**In your terminal (make sure you're still in the loki-app-v1 folder), type:**

```bash
npx expo prebuild --platform android
```

**Wait for this to complete** (this creates the android/ folder). You'll see "Success" when it's done.

**If you want iOS support (Mac only), also type:**
```bash
npx expo prebuild --platform ios
```

**✅ DONE WHEN**: You now see an `android` folder in your project directory.

---

### STEP 4: Download Firebase Config Files (5 minutes)

**Go to Firebase Console:**
1. Open your web browser
2. Go to https://console.firebase.google.com/
3. Click on your project: `loki-bc0bb`

**Download the Android config file:**
1. Click the **gear icon** (Project Settings) in the top-left
2. Scroll down to "Your apps" section
3. Click on the **Android app** icon (looks like a robot)
4. **IF the app already exists**: Click on it, then scroll down and click "Download google-services.json"
5. **IF the app doesn't exist**:
   - Package name: Type `com.loki.app` (EXACTLY this)
   - Nickname: Type `Loki App` (or whatever you want)
   - Click "Register app"
   - Click "Download google-services.json"
6. **Save the downloaded file** to your computer

**Move the file to the correct location:**
1. Find the `google-services.json` file you just downloaded (probably in your Downloads folder)
2. **Move it to**: `loki-app-v1/android/app/`
   - This means: inside the `android` folder, then inside the `app` folder
   - The file should be right next to `build.gradle`

**✅ DONE WHEN**: The `google-services.json` file is inside `loki-app-v1/android/app/` folder.

**For iOS (Mac only, skip if you don't have a Mac):**
1. In Firebase Console, click the iOS app icon
2. Bundle ID: `com.loki.app`
3. Download `GoogleService-Info.plist`
4. Move it to `loki-app-v1/ios/` folder

---

### STEP 5: Enable Google Sign-In in Firebase (3 minutes)

**In Firebase Console (still open):**
1. Click "Authentication" in the left sidebar
2. Click "Sign-in method" tab
3. Click on the **Google** card
4. Click the toggle switch to turn it **ON**
5. Click **Save**

**✅ DONE WHEN**: Google Sign-In shows as "Enabled" in the Authentication page.

---

### STEP 6: Start the App (2 minutes)

**In your terminal (still in loki-app-v1 folder), type:**

```bash
npx expo start --clear
```

**Wait for the Expo server to start** (you'll see a QR code appear).

**Choose how to run the app:**

**Option A: Use your phone (easiest)**
1. Install "Expo Go" app from App Store (iPhone) or Google Play Store (Android)
2. Open Expo Go on your phone
3. Scan the QR code shown in your terminal with your phone camera
4. The app will open on your phone

**Option B: Use Android Emulator**
1. Press the letter `a` on your keyboard
2. Wait for the Android emulator to open

**Option C: Use iOS Simulator (Mac only)**
1. Press the letter `i` on your keyboard
2. Wait for the iOS simulator to open

**✅ DONE WHEN**: You see the LOKI app running on your device/simulator.

---

### STEP 7: Test the App (2 minutes)

**Test these features one by one:**

1. **Test Sign-In**:
   - Click the "Sign in with Google" button
   - Complete the Google sign-in process
   - You should see your profile loaded

2. **Test Browse**:
   - Click the "Browse" tab at the bottom
   - You should see places loading
   - Try the search bar at the top

3. **Test Collections**:
   - Click the "Collections" tab
   - Click the + button to create a collection
   - Give it a name and click "Create"

4. **Test Profile**:
   - Click the "Profile" tab
   - You should see your name, email, and stats

**✅ DONE WHEN**: All these features work without errors.

---

## 🎉 CONGRATULATIONS!

Your LOKI mobile app is now running! You can demo it at your pitch night.

---

## 🔧 Prerequisites (Check These BEFORE Starting)

Make sure you have these BEFORE you start:

- ✅ **Node.js** installed (v18 or higher)
  - Check by typing `node --version` in terminal
  - If not installed, download from https://nodejs.org/

- ✅ **npm** installed (comes with Node.js)
  - Check by typing `npm --version` in terminal

- ✅ **Expo Go** app on your phone
  - Download from App Store (iPhone) or Google Play Store (Android)

- ✅ **Firebase Console access**
  - You should have access to the `loki-bc0bb` Firebase project

- ✅ **Code Editor** (VS Code recommended, but any text editor works)

---

## 🔍 Troubleshooting (If Something Goes Wrong)

### Problem: "Can't find android/app directory"
**Solution**: You skipped STEP 3. Go back and run `npx expo prebuild --platform android` FIRST, then move the config file.

### Problem: "Google Sign-In fails"
**Solution**:
1. Make sure `google-services.json` is in `android/app/` folder (not just `android/`)
2. Make sure Google Sign-In is enabled in Firebase Console
3. Make sure package name is `com.loki.app` (case-sensitive)

### Problem: "Places not loading"
**Solution**:
1. Check that `.env` file has correct FIREBASE_PROJECT_ID
2. Check that you're connected to the internet
3. Check Firebase Console to make sure Firestore has data

### Problem: "npm install fails"
**Solution**:
1. Delete `node_modules` folder
2. Delete `package-lock.json` file
3. Run `npm install` again

### Problem: "Expo won't start"
**Solution**:
1. Try `npx expo start --clear` (clears cache)
2. If that fails, restart your terminal
3. Try `npx expo start` again

### Problem: "Can't scan QR code"
**Solution**:
1. Make sure your phone and computer are on the same WiFi network
2. Try using your phone's camera app instead of Expo Go
3. Or use Android emulator/iOS simulator instead

---

## 📱 What Each Folder Contains

```
loki-app-v1/
├── android/              # Android native code (created after prebuild)
├── ios/                  # iOS native code (created after prebuild, Mac only)
├── app/
│   ├── auth/            # Login screen
│   └── main/            # Main screens (Browse, Maps, Collections, Profile)
├── lib/                 # Firebase config, state management, utilities
├── services/            # API and authentication services
├── navigation/          # App navigation setup
├── constants/           # API endpoints
├── .env                 # Environment variables (you edit this)
├── package.json         # Dependencies
└── app.json            # Expo configuration
```

---

## 🎪 For Your Pitch Night Demo

**Minimum Setup Time**: 20 minutes

**What You Can Demo**:
- ✅ Google Sign-In authentication
- ✅ Browse and search places
- ✅ Create collections
- ✅ View profile and statistics
- ✅ Real-time data sync with web app

**Demo Tips**:
- Use your phone with Expo Go (looks more professional)
- Have your WiFi ready
- Test the app before your presentation
- Focus on the core features (don't worry about Maps placeholder)

---

## 📞 Still Stuck?

1. **Re-read the steps** - Make sure you did them in order
2. **Check the terminal** - Look for error messages
3. **Check the file locations** - Make sure files are in the exact folders specified
4. **Try restarting** - Close terminal, open new one, try again
5. **Check Firebase Console** - Make sure all settings are correct

---

## 🎯 Success Checklist

Before your pitch night, verify:

- [ ] You can sign in with Google
- [ ] Places load in Browse screen
- [ ] Search works
- [ ] You can create collections
- [ ] Profile shows your info
- [ ] App runs smoothly on your device
- [ ] No error messages in terminal

**If all checked, you're ready! 🚀**

---

**Total Setup Time**: 20 minutes
**Difficulty**: Very Easy (follow steps exactly)
**Result**: Fully functional LOKI mobile app