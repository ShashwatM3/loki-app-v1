# ✅ YOUR ACTION ITEMS - Complete These to Run the App

## 🎯 Your Mission
Complete these steps to get the LOKI mobile app running. Once done, the app will be fully functional for your pitch night.

---

## 📋 STEP-BY-STEP INSTRUCTIONS

### STEP 1: Configure Environment (2 minutes)
1. Open `loki-app/.env` file
2. Ensure all these variables have values (copy from `loki-web-app/.env.local`):
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN` 
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`
   - `FIREBASE_MEASUREMENT_ID`
   - `GOOGLE_MAPS_API_KEY`
   - `API_BASE_URL`

**✅ DONE WHEN**: .env file has all values filled in

---

### STEP 2: Firebase Console Setup (5 minutes)
1. Go to https://console.firebase.google.com/
2. Select project: `loki-bc0bb`
3. Go to **Authentication** → **Sign-in method**
4. Enable **Google** sign-in
5. Add your email to authorized domains

**✅ DONE WHEN**: Google Sign-In is enabled in Firebase Console

---

### STEP 3: Download Firebase Config Files (3 minutes)
1. In Firebase Console, go to **Project Settings** → **Your Apps**
2. For **Android**: 
   - Click "Add app" → Android
   - Package name: `com.loki.app`
   - Download `google-services.json`
   - Place it in `loki-app/android/app/`
3. For **iOS** (if you have Mac/iOS):
   - Click "Add app" → iOS
   - Bundle ID: `com.loki.app`
   - Download `GoogleService-Info.plist`
   - Place it in `loki-app/ios/`

**✅ DONE WHEN**: Firebase config files are in the correct directories

---

### STEP 4: Generate Native Files (2 minutes)
1. Open terminal in `loki-app` directory
2. Run: `npx expo prebuild --platform android`
3. (Optional for iOS) Run: `npx expo prebuild --platform ios`

**✅ DONE WHEN**: android/ and ios/ directories exist

---

### STEP 5: Install Dependencies (2 minutes)
1. In terminal, run: `npm install`
2. Wait for installation to complete

**✅ DONE WHEN**: Installation finishes without errors

---

### STEP 6: Start the App (1 minute)
1. Run: `npx expo start --clear`
2. Wait for Metro bundler to start
3. Choose your platform:
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Or scan QR code with Expo Go app for physical device

**✅ DONE WHEN**: Expo server is running and you can see the app

---

### STEP 7: Test the App (5 minutes)
1. **Test Authentication**: Click "Sign in with Google" and complete sign-in
2. **Test Browse**: Navigate to Browse tab, verify places load
3. **Test Search**: Use the search bar to find places
4. **Test Collections**: Go to Collections tab, create a new collection
5. **Test Profile**: Go to Profile tab, verify your info shows

**✅ DONE WHEN**: All core features work without errors

---

## 🎉 SUCCESS!

When you complete all 7 steps, your LOKI mobile app will be:
- ✅ Fully functional
- ✅ Ready for your pitch night demo
- ✅ Synced with your web application
- ✅ Running on your chosen platform

---

## ⚠️ IF SOMETHING GOES WRONG

### Problem: "android/ directory doesn't exist"
**Solution**: Run `npx expo prebuild --platform android` first

### Problem: "Google Sign-In fails"
**Solution**: 
- Check that google-services.json is in android/app/
- Verify Google Sign-In is enabled in Firebase Console
- Ensure package name matches Firebase config

### Problem: "Places not loading"
**Solution**:
- Check .env file has correct Firebase project ID
- Verify Firestore rules in Firebase Console
- Check network connectivity

### Problem: "App won't build"
**Solution**:
- Run `npm install` again
- Try `npx expo start --clear`
- Check for errors in terminal

---

## 📱 FOR YOUR PITCH NIGHT

**Minimum Viable Demo (after completing steps 1-7):**
- ✅ Google Sign-In authentication
- ✅ Place browsing and search
- ✅ Collection creation and management
- ✅ User profile display
- ✅ Real-time data sync with web app

**What to Skip if Time-Pressed:**
- Google Maps integration (use the placeholder map view)
- Physical device testing (simulator is fine for demo)
- Advanced features (AI chatbot, collaboration)

---

## 🎯 REMEMBER

1. **All development is DONE** - you just need to configure external services
2. **Zero backend changes required** - uses your existing Firebase
3. **Same accounts work everywhere** - web and mobile share data
4. **Follow the steps in order** - each step depends on the previous ones
5. **Test after each step** - catch issues early

---

**Total Time**: ~20 minutes
**Difficulty**: Easy (copy-paste steps)
**Result**: Fully functional mobile app ready for your pitch night!

**Good luck! 🚀**