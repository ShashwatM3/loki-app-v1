# ⚡ LOKI App - Quick Start (5 Critical Steps)

## 🚀 Get Running in 5 Minutes

### STEP 1: Copy Environment Variables (1 minute)
```bash
# Copy Firebase config from web app to mobile app
cd loki-app
# Ensure .env file has all the same values as loki-web-app/.env.local
```

### STEP 2: Get Firebase Config Files (2 minutes)
```bash
# Firebase Console → Project Settings → Your Apps → Android
# Download google-services.json and place in android/app/

# Firebase Console → Project Settings → Your Apps → iOS  
# Download GoogleService-Info.plist and place in ios/
```

### STEP 3: Enable Google Sign-In (1 minute)
```bash
# Firebase Console → Authentication → Sign-in method → Google
# Enable it and add your email to authorized domains
```

### STEP 4: Install and Run (1 minute)
```bash
cd loki-app
npm install
npx expo start --clear
```

### STEP 5: Test on Device (ongoing)
```bash
# Scan QR code with Expo Go app
# Test Google Sign-In
# Test Browse, Collections, Profile screens
```

---

## 🔑 Critical Files to Check

1. ✅ `.env` - All Firebase variables present
2. ✅ `android/app/google-services.json` - Firebase Android config
3. ✅ `ios/GoogleService-Info.plist` - Firebase iOS config  
4. ✅ `app.json` - Package names match Firebase config

---

## ⚠️ If Something Fails

### Google Sign-In doesn't work:
- Check SHA-1 fingerprint in Firebase Console
- Verify package name matches Firebase config
- Ensure Google Sign-In is enabled in Firebase Auth

### Places don't load:
- Check Firestore rules in Firebase Console
- Verify Firebase project ID is correct
- Check network connectivity

### App won't build:
- Run `npm install` again
- Try `npx expo start --clear`
- Check for TypeScript errors: `npx tsc --noEmit`

---

## 📱 For Your Pitch Night

**Minimum Viable Setup:**
1. Environment variables configured ✅
2. Firebase config files downloaded ✅
3. Google Sign-In enabled in Firebase ✅
4. App runs on simulator with Expo Go ✅

**You can demo:**
- Google Sign-In authentication
- Place browsing and search
- Collection creation and management
- User profile and statistics
- Real-time data sync with web app

---

**That's it!** Follow these 5 critical steps and your app will be running. The detailed DEPLOYMENT_GUIDE.md has more information if you need it.