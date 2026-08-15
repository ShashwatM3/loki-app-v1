# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

## CRITICAL: this project MUST stay on Expo SDK 54

The App Store / Play Store versions of Expo Go **stop at SDK 54** — Expo has not shipped
SDK 55/56/57 Expo Go to the stores (https://expo.dev/changelog/expo-go-and-app-store-may-2026).
Any newer SDK makes every store install of Expo Go show
"Project is incompatible with this version of Expo Go", and updating Expo Go CANNOT fix it.
Do not upgrade the SDK unless the user switches to a development build or sideloads
Expo Go from https://expo.dev/go (Android only).

## Project facts (verified 2026-08-14)

- Expo SDK 54, React Native 0.81, React 19.1, firebase 12, React Navigation v7.
- Runs in Expo Go only — no `android/`/`ios/` folders, no prebuild. They are gitignored; never generate them.
- Env vars MUST be prefixed `EXPO_PUBLIC_` to reach app code.
- Backend is the deployed website `https://lokidxb.com` (`/api/create-account`, `/api/gpt`, `/api/encrypt`, `/api/decrypt`). `loki-bc0bb.web.app` is DEAD — do not use it.
- Auth is email/password (`signInWithPopup` does not exist on React Native; Google needs a dev build). Email/password is enabled on the `loki-bc0bb` Firebase project. Demo login: demo@lokidxb.com / LokiDemo2026!
- Firestore user docs are keyed by email and shared with the website.
- Icons come from `@expo/vector-icons` (needs `expo-font` installed), not react-native-vector-icons.
- Watchman is BROKEN on this machine (macOS privacy permissions block it from ~/Desktop;
  its crawl hangs ~55 min then fails with "Interrupted system call"). metro.config.js sets
  `resolver.useWatchman = false` — keep it that way.

## Verification

```bash
npx tsc --noEmit     # must be clean
npx expo-doctor      # must be 18/18
npx expo start       # then confirm both platform bundles compile:
# curl 'http://localhost:8081/index.ts.bundle?platform=ios&dev=true'
# curl 'http://localhost:8081/index.ts.bundle?platform=android&dev=true'
# and the manifest must report sdkVersion 54.0.0:
# curl -H 'expo-platform: android' http://localhost:8081 | jq '.extra.expoClient.sdkVersion'
```
