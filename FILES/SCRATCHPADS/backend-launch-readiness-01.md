# Backend launch readiness — loki-app (2026-09-02)

## What is fully wired and real

Every screen in the app talks to the same production backend as the website, and nothing is stubbed. Firestore (project loki-bc0bb) serves places, users/{email}, sharedCollections, config/categories and config/exploreSubfilters through direct SDK reads and writes, and Firebase Auth runs the real email/password session against the shared user pool. The app calls ten HTTP endpoints on the deployed site, and I verified each one exists in the web codebase: `/api/create-account`, `/api/gpt`, `/api/encrypt`, `/api/decrypt`, `/api/geocode`, `/api/maintenance-bypass`, and `/api/shared-collection/{vote, save, mutate, search-places, availability}`. The features ported this run also write real data: booking reminders write users.bookings via Firestore, the availability calendar writes through collectionPersistence on personal collections and through the availability endpoint on shared ones, and vote undo sends the same "undo" vote type the website itself sends.

---

## What is templated — deliberately, because the website is templated there too

Three surfaces are placeholders, and they are placeholders on the web as well, so the app copies them for parity rather than by omission. The Plans page renders hardcoded plan titles and dates with buttons that do nothing; Help & Support, Suggest a Venue, and both Legal rows on the profile have empty handlers; and the maintenance "Team access" form genuinely POSTs and succeeds, but the browser cookie it produces has no effect inside a native app. The rule to follow is that these should only gain behaviour when the website gives them behaviour, because inventing app-only behaviour is exactly the drift this run just removed.

---

## The launch blockers are packaging, not wiring

The backend is ready; what stands between you and the stores is build infrastructure. The app runs only in Expo Go today, and you cannot ship Expo Go to users — a store submission needs standalone binaries from EAS Build (`eas build --platform ios/android`), which also unlocks two things Expo Go structurally cannot do: native Google Sign-In (the website's only auth method, so web-registered users currently cannot log into the app) and `https://lokidxb.com` universal links, which need associated-domains entitlements to open the app instead of the browser. Also make sure the `EXPO_PUBLIC_*` Firebase env vars are provided to the EAS build environment, since the .env file is local-only.

---

## Two operational couplings worth knowing before launch

First, the app is hard-coupled to the live deployment: every API call targets lokidxb.com with no versioning, so a breaking API deploy on the website instantly breaks shipped app installs — treat the ten endpoints above as a frozen contract or add a version prefix before launch. Second, the app never checks MAINTENANCE_MODE; if you enable maintenance on the web, the site middleware returns 503 for all APIs and the app will surface raw failures rather than the maintenance screen it already contains. Minor rather than blocking: the map WebView fetches MapLibre JS from unpkg and tiles from Carto at runtime (same as the site, but the site also bundles its own copy), and the app ships no analytics or crash reporting while the web has PostHog and Vercel Analytics — decide whether launch needs Sentry/PostHog RN or nothing.
