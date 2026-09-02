# Evidence: loki-web-app code-derived surface map (subagent a9c60462, 2026-09-02)

Source: read-only exploration of /Users/gobus/Desktop/main/LOKI-EVERYTHING/loki-web-app at commit d6f9b03.
Level: B (code capture of the target's own source — the target IS this codebase, so code reads are
target-owned captures; rendered-behaviour A-level refs are the evidence/*.png screenshots).

Key structural facts extracted (full report in conversation log):

- Root layout: fonts SF Pro/Geist/Geist Mono/Instrument Serif/Outfit; body `dark`; sonner Toaster
  bottom-right dark richColors; LokiPeeker mounted by landing page only.
- Landing `/`: signed-in users redirected to /dashboard/browse. Sections: nav (logo2 + "loki." +
  How it works anchor + Sign in pill), SectionHero ("Stop scrolling./Start going." + purple
  underline SVG + subcopy + Open Loki CTA + Live in Dubai chip + interactive PhoneSwipeMock +
  HeroCarousel 21 cards), SectionNumbers (#120C24, count-up 400k+/200+/500+ with FF5468/a68bff
  accents), SectionHowItWorks (#how, white, 4 steps with ChatMock/TrendingMock/PhoneSwipeMock/
  ConfirmMock visuals in #f5f4f2 boxes), SectionFooter (draggable sticker collage on #f7f5f2,
  Explore Loki/Instagram/TikTok pills, legal row About/#how/Privacy/Cookies).
- /Authentication: Google-popup-only sign-in card; FullPageLoader during boot; redirects signed-in
  to returnTo (default /dashboard/browse); new users -> /onboarding.
- /onboarding: guards unauth -> /Authentication; renders 7-step OnboardingFlow (Intro Dubai,
  Friends, Interests draggable cards, Distance & Budget, Spots chips, Building progress, Ready);
  persists sessionStorage loki_onboarding_profile_v1; finishes to /dashboard/browse?budget=...
- /dashboard/layout: fetchPlaces on mount; guests allowed only on browse+maps; mobile bottom pill
  nav (Home/MapPin/Library/User, Library+User signed-in only) hidden on /dashboard/landing-variation
  and .../vibes; pill = rounded-xl border-border bg-card/95 px-10 py-3 shadow-float backdrop-blur;
  icons h-[18px], active text-foreground, inactive text-muted-foreground/50.
- /dashboard/browse re-exports /dashboard/landing-variation (mobile-first dark browse surface).
- /dashboard/landing-variation/vibes: vibe list page, back arrow, Apply -> /dashboard/browse?vibe=id.
- /dashboard/maps: MapLibre map, draggable bottom sheet (peek 210px to 88%), area search, hotspots,
  filters drawer, place select -> details; interstitial on entry; desktop side list is md:hidden.
- /dashboard/collections: list + create dialog; detail view (banner collage, members, map preview,
  availability calendar, share link, swipe/decide voting, delete).
- /dashboard/profile: ProfileGlow + LightRays; Avatar hero (72px, violet ring+glow); BookingReminders
  component; Account group (Help & Support "Questions? We're here.", Suggest a Venue "Know a hidden
  gem?" — both no-op); Legal group (Terms & Conditions, Privacy Policy — both no-op); Sign out
  (red-400/60 text button) -> signOut + /Authentication + toast "Signed out". Loki Wrapped card is
  commented out. NO "Loki" menu group exists.
- /dashboard/plans: placeholder page (still exists).
- /collection/[token]: server-decrypts token; SharedCollectionClient (guest name+emoji dialog,
  places grid, votes, availability, save-to-collections, add-places dialog for editors, map overlay).
- /about: server page, hero/mission/values/CTA. Reachable from landing footer.
- /welcome: redirects to /. /trial: orphaned dev upload page. /maintenance: wavy bg + glass card +
  bypass form.
- REMOVED from web (commit e466b15): standalone how-it-works and ambassadors pages.
- globals.css dark tokens: background oklch(0.105 0.004 265), surface 0.125, surface-muted 0.155,
  foreground 0.93, card 0.145, border oklch(1 0 0 / 11%), muted-foreground 0.62, etc.
