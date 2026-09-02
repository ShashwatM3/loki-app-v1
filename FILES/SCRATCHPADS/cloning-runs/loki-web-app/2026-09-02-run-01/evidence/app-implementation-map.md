# Evidence: loki-app code-derived implementation map (subagent 05f4499a, 2026-09-02)

Source: read-only exploration of /Users/gobus/Desktop/main/LOKI-EVERYTHING/loki-app at commit c34705f (+FILES untracked).
Purpose: records what the CLONE currently implements, for diffing against the target map.

Key facts (full report in conversation log):

- Navigator: root stack (Landing, Authentication, Dashboard tabs, Onboarding, Welcome, Vibes, Plans,
  About, HowItWorks, Ambassadors, CookiePolicy, PrivacyPolicy, Trial, Maintenance, SharedCollection)
  + Dashboard tabs (Browse/Maps/Collections/Profile) with FloatingPillTabBar matching web pill.
- LandingScreen: OLD dark design ("Loki" serif + polaroid grid + category chips) PLUS an
  Original/Editorial variant toggle that does not exist on the web. EditorialLanding is a second
  invented variant using bundled app screenshots. Neither matches the web's current light landing.
- AuthenticationScreen: email/password sign-in/sign-up glass card (platform substitution for the
  web's Google popup; documented exception).
- BrowseScreen: port of the landing-variation browse surface (greeting, search, Ask Loki teaser,
  ExploreSection, CuratedAlbums, VibePlacesGrid, Today's picks, quick-access, sign-in CTA).
- MapsScreen: MapLibre WebView + draggable sheet + hotspots + filters + interstitial.
- CollectionsScreen / CollectionDetailView / decide/swipe/members/map: ported.
- ProfileScreen: has EXTRA "Loki" menu group (About, How it works, Ambassadors, Your Plans, Vibe
  picker, Upload an image, Maintenance preview) that the web profile does NOT have; legal rows
  navigate (web's are no-op); lacks BookingReminders.
- OnboardingScreen: 7-step flow matching the web flow's step names.
- Static screens: About, HowItWorks (dropped on web), Ambassadors (dropped on web), CookiePolicy,
  PrivacyPolicy, Trial, Maintenance, Welcome.
- theme.ts: tokens converted from the web .dark oklch palette (bg #030405, fg #e8e8e8, border
  rgba(255,255,255,0.11), radius scale, Geist/Outfit fonts, shadow set).
- assets/web: Google.png, ambassador.png, logo2.png, lokianimation.json. assets/screenshots: 4 app
  screenshots used by the invented EditorialLanding.
- No screen renders the web's current "Stop scrolling. Start going." landing design.
