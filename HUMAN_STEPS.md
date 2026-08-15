# HUMAN_STEPS.md — the things only YOU can do

Everything in the codebase is done, type-checked, and both the iOS and Android bundles compile.
What a computer **cannot** do is hold your phone, tap buttons, and grant permissions. This file
walks you through every one of those steps like you've never done it before. Follow it top to
bottom and you will have verified the entire app end to end.

> **TL;DR:** `cd loki-app && npx expo start`, scan the QR with Expo Go, log in with
> `demo@lokidxb.com` / `LokiDemo2026!`, tap through the checklist in Part 3.

---

## Part 0 — What you need before starting

1. **Your Mac** (the one this folder is on).
2. **Your phone** with the **Expo Go** app installed from the App Store (iPhone) or Play Store
   (Android). The normal store version is exactly right — this project is pinned to SDK 54 on
   purpose because that is the newest version the store builds of Expo Go support. **Do not**
   update/downgrade anything.
3. Your phone and your Mac must be on the **same Wi-Fi network**. (If they can't be, see
   Part 5, step 2 — tunnel mode.)
4. An internet connection (the map tiles, place photos, fonts-in-map-popups, and all APIs come
   from the internet).

---

## Part 1 — Start the app (2 commands)

1. Open the **Terminal** app on your Mac.
2. Type this and press Enter:
   ```bash
   cd /Users/gobus/Desktop/main/LOKI-EVERYTHING/loki-app
   ```
3. Type this and press Enter:
   ```bash
   npx expo start
   ```
4. Wait until you see a big **QR code** in the terminal (about 5–20 seconds).
   - If it instead says `Port 8081 is being used by another process` and asks a question it
     can't answer, run this and go back to step 3:
     ```bash
     lsof -ti :8081 | xargs kill -9
     ```
5. **iPhone:** open the normal Camera app, point it at the QR code, tap the yellow "Open in
   Expo Go" banner.
   **Android:** open the Expo Go app, tap **"Scan QR code"**, point it at the QR code.
6. The first load takes ~30–60 seconds (it's compiling 3,500 modules). You'll see a progress
   bar in the terminal. When it finishes you should see the **Loki landing page**: a big serif
   italic "Loki", a violet glow at the bottom, six little draggable Instagram-style photo
   cards, and the small Loki creature peeking from a random screen edge every few seconds.

✅ If you see that, the app runs. ❌ If you see a red error screen, shake the phone → tap
"Reload". If it persists, see Part 5.

---

## Part 2 — Sign in (once)

1. On the landing page tap **"Sign in"** (top-right) — or tap **"Get started"**, which sends
   you to the same place when you're signed out.
2. You'll see the Authentication page: flowing rainbow gradient across the top, "loki." logo,
   and a card that says **"Welcome back"**.
3. Type:
   - Email: `demo@lokidxb.com`
   - Password: `LokiDemo2026!`
4. Tap **"Login"**. You should land on **Browse** with "Good morning/afternoon/evening" and
   the demo account's name.
5. This session **persists** — even after you force-quit the app or restart the phone, you
   stay signed in.

> Want your own account? Tap **"Sign up"** on that card instead. One catch you should know:
> if an email already has a **Google** account on the website, Firebase will refuse to create
> a *password* account with the same email ("email already in use"). Use a different email,
> or keep using the demo account.

---

## Part 3 — Tap-through checklist (verify every page)

Do these in order. Each line tells you exactly where to tap and what you must see.

### 3.1 Landing (both variants)
- [ ] At the very top-center of the landing page there's a small pill with **Original |
      Editorial**. Tap **Editorial** → you should get the black editorial page: auto-rotating
      3D photo carousel, "We *find and share* Dubai's best spots" headline with green italic
      words, "150k+ views / 200+ places / 300+ users" stats, a light **Features** section with
      4 colored cards containing real app screenshots, the green **"Group chat approved"**
      section, and a giant "loki." footer. Scroll all the way down.
- [ ] Tap **Original** to switch back.
- [ ] Drag one of the six photo cards around with your finger — it should follow your finger
      and glide with momentum when you let go.

### 3.2 Browse tab
- [ ] Bottom of the screen: a floating **pill** with 4 icons (house, pin, library, person).
      That's the dashboard nav — identical to the website's mobile nav.
- [ ] Tap the **magnifying glass** (top right) → a rounded search bar slides in. Type e.g.
      "beach" → you get a list of matching places with "View" buttons. Clear the text.
- [ ] Tap the **"What are you looking for tonight?"** box → the **Ask Loki** chat opens.
      Tap one of the suggested prompt chips (e.g. "Chill spots to work with coffee"). Wait a
      few seconds → Loki answers with text plus **recommendation cards** and a **mini dark
      map** with numbered pink pins. Tap a card → full place details slide up. Close with the
      X, then close the chat with the X in its header.
      *(First time: the phone will ask for **location permission** — tap Allow so distances
      and the map center work.)*
- [ ] **Explore** section: tap a category tile (e.g. "⚽ Sports") → sub-filter pills appear
      ("Watch sports", "Padel", …) plus a "🍸 21+ only" pill and a result list. Tap "All
      categories" to go back.
- [ ] **"Can't choose? Loki has some suggestions"**: horizontal albums with a colored aura and
      emoji tile. Tap **"See all"** on one → the album page with a 2-column poster grid + its
      own search icon. Tap **"Back to albums"**.
- [ ] Tap any place photo anywhere → the **place details** page slides in from the right:
      big photo, pink category badge, **Directions** (opens Google Maps), **Add to
      Collection**, Website (when the place has one), and **THE VIBE** box.
- [ ] In place details, tap **"Add to Collection"** → a black bottom drawer lists your
      collections with gradient squares. Tap one (check appears), tap **"New"** to create
      another, then tap the rainbow **"Add"** — you should get a toast **"Added to
      collection"**.
- [ ] Scroll to the bottom of Browse: **Quick Access** (Map / Collections / Quiz) and
      **Today's picks for you** horizontal cards.

### 3.3 Maps tab
- [ ] Tap the **pin icon** in the bottom pill. First time you get the interstitial: **"You are
      now entering maps"**. Tap **"Let's go"**.
- [ ] A blurred **"Loading map…"** overlay shows for a couple of seconds, then fades into the
      exact same **dark Carto map** as the website, with place **photo chips** popping in one
      by one as their images load, and (if you allowed location in Dubai) a red radar ping at
      your position.
- [ ] Top-left: "loki. · N spots" pill and the **"go to any area"** search. Type "Marina" →
      pick a result → the map flies there and a toast confirms.
- [ ] Top-right: tap the **eye** → all markers hide (map only). Tap again → they return. Tap
      the **shuffle** → the map flies to a random hotspot ("Exploring Dubai Marina" toast).
- [ ] Tap **"Filter"** → a bottom drawer with category groups, "Narrow it down" pills, Budget
      💵 buttons, and the pink/amber **popups / 21+** toggles. Pick "🌿 Outdoor" and close —
      the marker set shrinks. Re-open and set back to **All**.
- [ ] Tap any **photo marker** → the full place details drawer opens (85% height). Swipe it
      down/close → underneath there's the small **popup card** anchored to the marker with
      **Directions**, an expand button, and a globe button. Tap its ✕ to dismiss.
- [ ] Bottom: the **Explore sheet** peeks up ~210px with an animated rainbow top border. Drag
      its handle upward → it expands to nearly full screen with search, category tiles,
      "Happening now" (if any live popups) and horizontal place rows. Tap a place → the sheet
      collapses and the map flies to it. Drag the handle down to re-collapse.

### 3.4 Collections tab
- [ ] Tap the **library icon**. You get the black Collections page: serif italic
      **"Collections"** header and big 280px-tall gradient cards with 4 mini thumbnails.
- [ ] Tap **+** (top right) → "create a new collection" dialog → type a name → **create
      collection**. Toast: "Collection created!".
- [ ] Tap a collection card → the **full-screen detail view**: photo collage banner, animated
      color glow bleeding from under it, lowercase serif title, **"In this plan"** member
      chips, **Invite** (add a collaborator by email), and a **live map preview** ("N PLACES ·
      M SHARING LOCATION").
- [ ] Tap **"Open map"** → full-screen collection map with named photo pins and your avatar
      dot (allow location if asked — that's the live location sharing the website has). Tap a
      pin → mini card → **"Show more details"** → full details. Close with the ✕.
- [ ] **Swipe to decide**: with 2+ places in the collection, swipe cards right (Yes) / left
      (Nope) or use the ✓ / ✕ buttons. After your last card: **"We have a winner! 🎉"** with
      falling confetti, a leaderboard with green progress bars, "Votes in x/y" with member
      avatars, and a **Re-vote** button that resets your votes.
- [ ] Tap the **share icon** (top of the detail view) → full-screen **"Link ready"** page with
      the violet glow, the link auto-copied, **Share link** (opens the native share sheet) and
      **Copy to clipboard**. Send that link to another phone/laptop — it opens the same
      collection on **lokidxb.com** (and if opened on a phone with this app installed, deep
      links into the app's shared-collection page).
- [ ] Back in the detail view, scroll to the bottom → red **"Delete collection"** →
      confirmation dialog. (Delete the test collection you made. "Favorites" can't be deleted,
      same as the website.)

### 3.5 Shared collection page (the /collection/<token> page)
- [ ] From the "Link ready" screen, copy a share link. Then open it on the phone: the easiest
      manual way is to paste the token into this URL scheme in Safari/Chrome on the phone:
      `loki://collection/<the-long-token-part-of-the-link>` — or simply tap the
      `https://lokidxb.com/collection/...` link you shared to a chat app on the same phone.
- [ ] First open asks **"Who's here?"** — type a name, pick an emoji animal, **Continue**.
- [ ] You should see: the collection map, **"The lineup"** grid with Info-expandable cards,
      **"Start swiping to pick a spot"** deck, and the **Leaderboard**. After ~3 seconds a
      pill nudges you to start swiping. If you opened an *edit* link you also get **"Add
      places"** (chips + budget + distance + swipe-right-to-add).

### 3.6 Profile tab
- [ ] Tap the **person icon**: violet glow with light rays, avatar with glowing ring, your
      name/email fading in, and the list groups (Account / Legal / Loki).
- [ ] Under **Legal** tap **Privacy Policy** → the complete policy (all 12 sections). Go back
      (swipe from the left edge). Tap **Terms & Conditions** → the Cookie Policy page with the
      cookie table and browser links.
- [ ] Under **Loki** tap each of: **About Loki**, **How it works**, **Community Ambassadors**,
      **Your Plans**, **Vibe picker** (select a vibe → **Apply** → Browse opens pre-filtered),
      **Upload an image** (pick a photo → **Upload** → progress bar → "Upload successful!" —
      this really uploads to Firebase Storage), and **Maintenance preview** (animated wavy
      canvas + glass card + "Team access" form).
- [ ] Back on Profile, tap **Sign out** → you're returned to Authentication, and Collections/
      Profile icons disappear from the bottom pill (guests only get Browse + Maps, same as the
      website).

### 3.7 Onboarding quiz
- [ ] Sign back in, go to Browse → **Quick Access → Quiz**. Walk the 7 steps: two intro
      screens → draggable interest photo cards ("Personalize") → distance & budget rows →
      spot-theme chips (pick up to 5) → **"Building your map"** progress → **"You're all
      set"** → **Start exploring** lands you on Browse.

If every box above checks out, the entire app works end to end. 🎉

---

## Part 4 — Things that are genuinely impossible for me (and optional for you)

1. **Google Sign-In.** Expo Go physically cannot run native Google Sign-In, and Firebase's
   web popup (`signInWithPopup`) does not exist on React Native — that's why the app uses
   email/password (which talks to the *same* Firebase users as the website). If you ever want
   the Google button in the app you must switch from Expo Go to a **development build**:
   `npx expo run:ios` (needs Xcode + an Apple developer setup) and add
   `@react-native-google-signin/google-signin`. Not needed for anything else to work.
2. **App Store / Play Store publishing.** Requires your Apple/Google developer accounts.
   Nothing in this task depends on it — Expo Go is the runtime.
3. **Phone permissions.** When iOS/Android ask for **Location** (maps, chat distances,
   live location sharing) and **Photos** (the Trial upload page), only you can tap "Allow".
   Everything else still works if you decline — those specific features just stay quiet.

That's the whole list. There are no API keys to create, no Firebase console changes, no config
files to edit — all of that was already in place and is reused from the website.

---

## Part 5 — If something looks wrong tomorrow

| Symptom | Fix |
|---|---|
| "Project is incompatible with this version of Expo Go" | Should never happen — the project is pinned to SDK 54, which the store Expo Go supports. If you see it, you (or someone) ran an SDK upgrade — `git checkout package.json package-lock.json && npm install`. |
| Terminal stuck on "Waiting on http://localhost:8081" | `Ctrl+C`, then `npx expo start --clear`. |
| Port 8081 in use | `lsof -ti :8081 \| xargs kill -9` then `npx expo start`. |
| Phone can't find the server | Same Wi-Fi? If your network blocks device-to-device traffic run `npx expo start --tunnel` and scan the new QR. |
| Red error screen on the phone | Shake the phone → "Reload". If it persists: stop the server, `npx expo start --clear`, reopen. |
| Map stays on "Loading map…" forever | The map loads its style/tiles from the internet (basemaps.cartocdn.com + unpkg.com). Check the phone actually has internet; then close/reopen the Maps tab. |
| Weird stale visuals after I pulled changes | `npx expo start --clear` (clears Metro's cache). |
| Type errors after editing | `npx tsc --noEmit` in `loki-app` shows exactly where. |
