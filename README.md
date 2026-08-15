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

The app is a **1:1 UI port of every user-facing page on lokidxb.com** — same colors (the exact
oklch palette converted to sRGB), same fonts (Geist + Outfit via Google Fonts), same layouts at the
web's mobile breakpoint.

| Page / feature | Status |
|---|---|
| **Landing** — original variant (serif hero, draggable Instagram-style spot cards, animated violet glow, Loki lottie peeker) + **editorial variant** (3D auto-scrolling carousel, metrics, features, reviews, giant footer) with the same Original/Editorial toggle pill | ✅ |
| **Authentication** — animated multi-color gradient header, glass card; email/password sign-in + sign-up, persistent sessions, returnTo redirects | ✅ |
| **Browse (dashboard/browse)** — greeting, collapsible search, Ask Loki section, Explore groups → sub-filters → spots, curated vibe albums with "See all" drill-down + album search, Quick Access, Today's picks, guest sign-in CTA | ✅ |
| **Ask Loki chat** — full-screen chat sheet, suggested prompts, typing dots, markdown answers, recommendation cards + MapLibre mini-map with numbered pins (real `/api/gpt`) | ✅ |
| **Maps (dashboard/maps)** — "You are now entering maps" interstitial, the **exact same MapLibre GL dark Carto basemap as the web** (in a WebView), image-chip place markers with pop-in animation, radar user-location marker, popup cards with Directions/expand/website, marker eye-toggle, shuffle-to-hotspot, filter drawer (groups → sub-categories, budget, popups, 21+), drag-up Explore sheet with animated gradient border, area search via `/api/geocode` | ✅ |
| **Place details** — hero image, rose category badge, Directions / Add to Collection / Website, THE VIBE box (vibe lines + gen-z blurb) | ✅ |
| **Collections** — serif header, gradient/preview cards, create dialog, full-screen detail view (banner collage, hue-derived animated glow, members chips, invite collaborators, map preview + full-screen live collection map with shared locations, **swipe-to-decide voting** with winner/confetti/leaderboard/re-vote, lineup list, delete) | ✅ |
| **Share collections** — full-screen "Link ready" flow (OnboardingGlow, auto-copy, native share sheet) via `/api/encrypt`; links open at `lokidxb.com/collection/<token>` | ✅ |
| **Shared collection (`/collection/<token>`)** — deep-linked (`loki://collection/<token>` or the https link): name+emoji avatar picker, who's-here crew, live map, expandable lineup, swipe deck with cross-device votes, leaderboard, add-places flow (chips/budget/distance + swipe-to-add), save-to-account flow | ✅ |
| **Profile** — animated violet glow + light rays, staggered fade-up, avatar ring, list groups, sign out (+ an extra "Loki" group linking to every ported marketing/legal page) | ✅ |
| **Onboarding quiz (`/onboarding`)** — 7-step flow: intro screens, draggable interest cards, distance & budget option rows, spot-theme chips (max 5), building-your-map progress, ready screen | ✅ |
| **Vibe picker (`/dashboard/landing-variation/vibes`)** — selectable vibe cards + Apply → filtered browse | ✅ |
| **Static pages** — About, How it works, Ambassadors, Your Plans, Trial (image upload to Firebase Storage), Maintenance (same simplex-noise wavy canvas + glass card + team-access form), Cookie Policy, Privacy Policy, Welcome redirect | ✅ |

**Intentionally not ported:** the internal `/admin` suite (web-only tooling) and the Hyperframes
video overlays (removed by request). Google OAuth needs a development build (see below) — email/password is the sign-in method in Expo Go.

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
├── App.tsx                       # Root: fonts (Geist/Outfit), gesture root, auth bootstrap, Toaster
├── index.ts                      # Expo entry point
├── app/
│   ├── landing/                  # LandingScreen (original variant + toggle) & EditorialLanding
│   ├── auth/AuthenticationScreen.tsx  # Gradient-flow header + glass card, email/password
│   ├── main/
│   │   ├── BrowseScreen.tsx      # dashboard/browse (landing-variation) full port
│   │   ├── MapsScreen.tsx        # dashboard/maps full port (WebView MapLibre)
│   │   ├── CollectionsScreen.tsx # dashboard/collections + share-link flow
│   │   └── ProfileScreen.tsx     # dashboard/profile (+ links to all static pages)
│   ├── onboarding/OnboardingScreen.tsx  # 7-step quiz flow
│   ├── collection/SharedCollectionScreen.tsx  # /collection/<token> (deep-linked)
│   ├── dashboard/                # PlansScreen, VibesScreen
│   └── static/                   # About, HowItWorks, Ambassadors, CookiePolicy,
│                                 # PrivacyPolicy, Trial, Maintenance, Welcome
├── components/
│   ├── ui/                       # Button/Input/Dialog/Drawer/Sheet/AlertDialog/Badge/Avatar,
│   │                             # AnimatedGradientText, glows (LightRays, Onboarding/Profile/
│   │                             # Landing/CollectionBanner glow, AuthGradientFlow), ConfettiBurst
│   ├── maps/                     # MapLibreMap (WebView bridge — Carto dark style, all marker
│   │                             # types + popup cards), CollectionMap, MapsAreaSearch,
│   │                             # MapsEntryInterstitial, maplibreHtml
│   ├── collections/              # CollectionDetailView, CollectionDecideSection,
│   │                             # CollectionSwipeDeck, CollectionMembers, CollaboratorManager
│   ├── browse/                   # CuratedAlbums, ExploreSection, VibePlacesGrid
│   ├── PlaceDetailsContent.tsx   # Place sheet content + CollectionSelectorDrawer
│   ├── LokiChatSheet.tsx         # Ask Loki chat (+ LokiMarkdown, LokiRecommendations)
│   ├── FullPageLoader.tsx        # Loki lottie loader
│   └── LokiPeeker.tsx            # Landing-page lottie peeker
├── navigation/AppNavigator.tsx   # Root stack (all pages) + floating-pill dashboard tabs,
│                                 # deep links (loki:// + https://lokidxb.com)
├── lib/
│   ├── theme.ts                  # Exact web palette (oklch→sRGB), fonts, radii, shadows
│   ├── firebase.ts               # Firebase init (RN persistence via AsyncStorage)
│   ├── store.ts                  # Zustand store (user, places, categories, subfilters)
│   ├── browseVibes.ts / categories.ts / exploreSubfilters.ts / priceRange.ts
│   ├── placeBlurb.ts / placePresentation.ts / isActiveLimitedTimePopup.ts
│   ├── collectionVoting.ts / collectionPersistence.ts / sharedCollections.ts
│   ├── firebaseActions.ts        # getDocument/updateDocument/uploadImage
│   ├── usePlaceImages.ts         # Image-readiness gate (places appear once photos load)
│   ├── crypto.ts                 # Share links via backend /api/encrypt + /api/decrypt
│   ├── dubaiSpots.ts / toast.ts / types.ts / utils.ts
├── hooks/useExploreGroups.ts     # Built-in + admin-added explore taxonomy
├── services/                     # authService, apiClient (lokidxb.com/api/*)
├── assets/web/                   # logo2.png, lokianimation.json, ambassador.png
├── assets/screenshots/           # Editorial-landing feature screenshots
├── constants/apiEndpoints.ts
├── types/firebase-auth-rn.d.ts
└── metro.config.js               # Disables watchman (broken by macOS permissions) — keep it
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
