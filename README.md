# Loki Mobile App

React Native (Expo) version of [lokidxb.com](https://lokidxb.com) — discover the best places in Dubai. Runs in **Expo Go** (no native build needed) against the **same Firebase project, backend APIs, and data** as the website.

---

## 🚀 Demo in 15 seconds

```bash
cd loki-app
npx expo start
```

1. Open **Expo Go** on your phone (the normal App Store / Play Store version — this project targets **SDK 54**, the exact version the store builds support)
2. Scan the QR code from the terminal (phone and Mac must be on the same Wi-Fi)
3. Sign in with the ready-made demo account:

   | | |
   |---|---|
   | **Email** | `demo@lokidxb.com` |
   | **Password** | `LokiDemo2026!` |

That's it. Everything below is already set up and verified working.

---

## What works (all verified end-to-end)

| Feature | Status |
|---|---|
| **Auth** — email/password sign-in + sign-up, persistent sessions (survives app restarts) | ✅ |
| **Browse** — time-of-day greeting, full-text search (name/category/tags/description/location), 8 curated vibes, explore groups, place cards from the live Firestore `places` collection | ✅ |
| **Place details** — image, rating, budget, hours, tags, description, Google Maps / website links, **save to collection** | ✅ |
| **Collections** — create, delete (Favorites protected), view places, real-time Firestore sync | ✅ |
| **Share collections** — generates a real encrypted link via the backend (`/api/encrypt`) that opens at `lokidxb.com/collection/<token>` | ✅ |
| **Ask Loki (AI)** — talks to the real `/api/gpt` backend, grounded in the actual places database, renders recommendation cards | ✅ |
| **Profile** — avatar/initials, saved-places + collections stats, sign out | ✅ |
| **Maps tab** — simplified pin view with place previews and location permission (not a full interactive map yet) | ⚠️ simplified |

**Not included (yet):** Google OAuth (requires a development build — see below), full interactive map, swipe-to-decide voting, Loki Wrapped.

---

## Setup from scratch (new machine)

```bash
git clone https://github.com/ShashwatM3/loki-app-v1.git loki-app
cd loki-app
npm install
npx expo start
```

Requirements:
- **Node 20+** (tested on Node 24)
- **Expo Go from the App Store / Play Store** — this project is pinned to **Expo SDK 54** on purpose: the store versions of Expo Go stop at SDK 54 (Expo has not shipped SDK 55+ Expo Go to the stores — see [Expo's changelog](https://expo.dev/changelog/expo-go-and-app-store-may-2026)). A newer SDK will show "Project is incompatible with this version of Expo Go" no matter how recent your Expo Go install is.
- Phone and computer on the **same Wi-Fi network**

No Firebase console changes, no `google-services.json`, no prebuild, no native folders. The `.env` file is committed with working values (they are the same public client keys the website ships to every browser).

---

## How it connects to the existing product

- **Firebase project**: `loki-bc0bb` (same as the website) — Firestore `users`, `places`, `sharedCollections`, `config` collections are shared, so anything saved in the app shows up on the website and vice versa.
- **Backend**: all API calls go to the deployed website — `https://lokidxb.com/api/create-account`, `/api/gpt`, `/api/encrypt`, `/api/decrypt`.
- **Accounts are keyed by email** in Firestore. An email/password account created in the app with the same email as a website Google account shares the same data. (Note: if an email is already registered via Google, Firebase won't allow creating a *password* login for it — use a different email or the demo account.)

### Why email/password instead of Google Sign-In?

Expo Go cannot run native Google Sign-In (`@react-native-google-signin` needs a custom native build), and the Firebase web popup flow (`signInWithPopup`) does not exist on React Native. Email/password is fully supported by the Firebase JS SDK on React Native and is already enabled on this Firebase project. To add Google OAuth later, create a development build (`npx expo run:ios` / `run:android`) and integrate `@react-native-google-signin/google-signin`.

---

## Configuration

`.env` (all values must be prefixed `EXPO_PUBLIC_` to reach app code in Expo):

```env
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=loki-bc0bb.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=loki-bc0bb
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=loki-bc0bb.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=...
EXPO_PUBLIC_API_BASE_URL=https://lokidxb.com
```

The code also has hardcoded fallbacks for every value, so the app works even without a `.env`.

---

## Project structure

```
loki-app/
├── App.tsx                     # Root: providers + auth state bootstrap
├── index.ts                    # Expo entry point
├── app/
│   ├── auth/LoginScreen.tsx    # Email/password sign-in + sign-up
│   ├── main/
│   │   ├── BrowseScreen.tsx    # Greeting, search, vibes, explore, place grid
│   │   ├── MapsScreen.tsx      # Simplified map with pins + place preview
│   │   ├── CollectionsScreen.tsx  # List / create / delete / share
│   │   ├── ProfileScreen.tsx   # User info, stats, sign out
│   │   └── AIChatbotScreen.tsx # Ask Loki chat (backed by /api/gpt)
│   ├── place/PlaceDetailScreen.tsx        # Details + save to collection
│   └── collection/CollectionDetailScreen.tsx  # Places in a collection + share
├── navigation/AppNavigator.tsx # Auth gate → tabs + detail stack
├── lib/
│   ├── firebase.ts             # Firebase init (RN persistence via AsyncStorage)
│   ├── store.ts                # Zustand store (user, places, categories)
│   ├── browseVibes.ts          # Curated vibe definitions (ported from web)
│   ├── categories.ts           # Explore groups/subfilters (ported from web)
│   ├── priceRange.ts           # Budget helpers (ported from web)
│   ├── crypto.ts               # Share links via backend /api/encrypt
│   ├── types.ts                # Shared TypeScript types
│   └── utils.ts                # Gradients, greetings, misc helpers
├── services/
│   ├── authService.ts          # Sign in/up/out + account creation flow
│   └── apiClient.ts            # Axios client for lokidxb.com/api/* (with auth header)
├── constants/apiEndpoints.ts   # Endpoint + Firestore collection names
├── types/firebase-auth-rn.d.ts # Type shim for firebase/auth's React Native build
└── metro.config.js             # Disables watchman (broken by macOS permissions) — keep it
```

## Verification (all currently passing)

```bash
npx tsc --noEmit        # type-checks clean
npx expo-doctor         # 18/18 checks pass
npx expo start          # bundles clean for iOS and Android
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `Project is incompatible with this version of Expo Go` | This project must stay on **SDK 54** — the store versions of Expo Go do not support SDK 55+. If you upgrade the SDK, you must sideload a matching Expo Go from [expo.dev/go](https://expo.dev/go) (Android only) |
| Metro hangs on "Waiting on http://localhost:8081" for minutes | Watchman is blocked by macOS privacy permissions for `~/Desktop`. This repo disables watchman in `metro.config.js` (`resolver.useWatchman = false`) — don't remove that line, or grant watchman Full Disk Access |
| `EMFILE: too many open files, watch` | Only happens on old Expo SDKs; SDK 54's Metro watcher handles this. `npx expo start --clear` if it persists |
| Port 8081 already in use | `lsof -ti :8081 \| xargs kill -9` |
| Stale/weird bundler state | `npx expo start --clear` |
| Phone can't connect | Make sure phone + Mac are on the same Wi-Fi; try `npx expo start --tunnel` |
| Sign-up says email already in use | That email has a Google account on the website — use another email or `demo@lokidxb.com` |
