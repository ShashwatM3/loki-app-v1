# 🎯 LOKI React Native App - Complete Setup Guide

A fully-functional React Native version of the LOKI web application with Google Sign-In, place discovery, collection management, and real-time Firebase sync.

**This is a pure Expo Go app - no native building required!**

---

## 📱 Features

- ✅ **Google Sign-In Authentication** - Secure login with Firebase
- ✅ **Place Discovery** - Browse, search, and filter Dubai places
- ✅ **Collection Management** - Create and manage place collections
- ✅ **User Profile** - View statistics and account settings
- ✅ **Real-Time Sync** - Same data works on web and mobile
- ✅ **Zero Backend Changes** - Uses your existing Firebase infrastructure
- ✅ **Expo Go Compatible** - Works with Expo Go app, no native build needed

---

## 🚀 Quick Start (10 Minutes)

Follow these 5 steps EXACTLY in order to get the app running on your phone with Expo Go.

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

### STEP 2: Configure Environment Variables (2 minutes)

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

### STEP 3: Enable Google Sign-In in Firebase (3 minutes)

**Go to Firebase Console:**
1. Open your web browser
2. Go to https://console.firebase.google.com/
3. Click on your project: `loki-bc0bb`

**Enable Google Sign-In:**
1. Click "Authentication" in the left sidebar
2. Click "Sign-in method" tab
3. Click on the **Google** card
4. Click the toggle switch to turn it **ON**
5. Click **Save**

**✅ DONE WHEN**: Google Sign-In shows as "Enabled" in the Authentication page.

---

### STEP 4: Start the App (2 minutes)

**In your terminal (still in loki-app-v1 folder), type:**

```bash
npx expo start --clear
```

**Wait for the Expo server to start** (you'll see a QR code appear).

**✅ DONE WHEN**: You see a QR code in your terminal.

---

### STEP 5: Run on Your Phone with Expo Go (1 minute)

**Use your phone (this is the easiest way):**

1. **Install Expo Go**:
   - iPhone: Download "Expo Go" from App Store
   - Android: Download "Expo Go" from Google Play Store

2. **Scan the QR Code**:
   - Open Expo Go on your phone
   - Tap "Scan QR code"
   - Scan the QR code shown in your terminal
   - The app will open on your phone

**✅ DONE WHEN**: You see the LOKI app running on your phone.

---

### STEP 6: Test the App (2 minutes)

**Test these features one by one:**

1. **Test Sign-In**:
   - Click the "Sign in with Google" button
   - Complete the Google sign-in process (opens in browser)
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

Your LOKI mobile app is now running on your phone with Expo Go! No native building required.

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

### Problem: "Google Sign-In fails or doesn't open"
**Solution**:
1. Make sure Google Sign-In is enabled in Firebase Console
2. Check that `.env` file has correct Firebase configuration
3. Make sure you have internet connection
4. Try signing out and signing in again

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
3. Make sure Expo Go is up to date

### Problem: "App crashes on phone"
**Solution**:
1. Shake your phone to open Expo Go menu
2. Tap "Reload" to reload the app
3. Check the terminal for error messages
4. Make sure all environment variables are set correctly

---

## 📱 What Each Folder Contains

```
loki-app-v1/
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

**Minimum Setup Time**: 10 minutes

**What You Can Demo**:
- ✅ Google Sign-In authentication (browser-based)
- ✅ Browse and search places
- ✅ Create collections
- ✅ View profile and statistics
- ✅ Real-time data sync with web app

**Demo Tips**:
- Use your phone with Expo Go (looks professional)
- Have your WiFi ready
- Test the app before your presentation
- Focus on the core features (Maps is a placeholder)
- Google Sign-In will open in a browser window - this is normal

---

## 📞 Still Stuck?

1. **Re-read the steps** - Make sure you did them in order
2. **Check the terminal** - Look for error messages
3. **Check your phone** - Make sure Expo Go can connect to your computer
4. **Try restarting** - Close terminal, open new one, try again
5. **Check Firebase Console** - Make sure all settings are correct

---

## 🎯 Success Checklist

Before your pitch night, verify:

- [ ] You can sign in with Google (opens in browser)
- [ ] Places load in Browse screen
- [ ] Search works
- [ ] You can create collections
- [ ] Profile shows your info
- [ ] App runs smoothly on your phone via Expo Go
- [ ] No error messages in terminal

**If all checked, you're ready! 🚀**

---

## 📝 Important Notes

- **This is a pure Expo Go app** - no android/ or ios/ folders needed
- **Google Sign-In uses browser popup** - this is normal for Expo Go
- **No native configuration files needed** - just the .env file
- **Works on both iOS and Android** via Expo Go
- **Real-time Firebase sync** works out of the box

---

**Total Setup Time**: 10 minutes
**Difficulty**: Very Easy (follow steps exactly)
**Result**: Fully functional LOKI mobile app running on your phone