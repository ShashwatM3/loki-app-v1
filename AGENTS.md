# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## Project facts (verified 2026-08-14)

- Expo SDK 57, React Native 0.86, React 19, firebase 12 (SDK 57 requires firebase >= 12), React Navigation v7.
- Runs in Expo Go only — no `android/`/`ios/` folders, no prebuild. They are gitignored; never generate them.
- Env vars MUST be prefixed `EXPO_PUBLIC_` to reach app code.
- Backend is the deployed website `https://lokidxb.com` (`/api/create-account`, `/api/gpt`, `/api/encrypt`, `/api/decrypt`). `loki-bc0bb.web.app` is DEAD — do not use it.
- Auth is email/password (`signInWithPopup` does not exist on React Native; Google needs a dev build). Email/password is enabled on the `loki-bc0bb` Firebase project. Demo login: demo@lokidxb.com / LokiDemo2026!
- Firestore user docs are keyed by email and shared with the website.
- Icons come from `@expo/vector-icons` (needs `expo-font` installed), not react-native-vector-icons.
- macOS: watchman must be installed (`brew install watchman`) or Metro dies with EMFILE.

## Verification

```bash
npx tsc --noEmit     # must be clean
npx expo-doctor      # must be 21/21
npx expo start       # then confirm both platform bundles compile:
# curl 'http://localhost:8081/index.ts.bundle?platform=ios&dev=true'
# curl 'http://localhost:8081/index.ts.bundle?platform=android&dev=true'
```
