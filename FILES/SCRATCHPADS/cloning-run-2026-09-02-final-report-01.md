# Cloning run final report — loki-app converged onto loki-web-app (2026-09-02, run `2026-09-02-run-01`)

## Protocol and how it was adapted

The run followed `FILES/CLONING_MODEL_FIRST` end to end: ledger, reconnaissance, `target-spec.json`, `fsm.json`, validator gates, convergence loop, conformance record, final report. The protocol was written for cloning third-party websites into closed-network RL environments, so four of its mechanisms do not apply here and were recorded as adaptations in `run.json` rather than silently skipped. The clone shares the live production Firebase backend with the target by design, so there is no clone-owned SQLite, no seed or episode lifecycle, no transition-ledger table, and no graded/conformance dual build. Everything else — the evidence discipline, the inventory as completeness authority, the model gates, the side-by-side loop, and the honesty rules — was kept at full strength.

---

## Model artifacts and gates

Reconnaissance produced `surface-inventory.json` with 66 nodes covering every page, pane, sheet, dialog and menu of the target at the 390px mobile breakpoint, each with a disposition. `target-spec.json` carries 8 entities, 20 operations and 13 pages; `fsm.json` carries 13 pages, 41 signature variables (9 durable, mapped to Firestore paths), 71 actions (14 writes) and 7 goals. `validate_model.py` exits 0 with zero errors and 12 recorded warnings, and the enumeration bounded 694 reachable states. The validator proves coherence, not truth; truthfulness sampling came from driving the live target in the claimed browser lane (playwright-lane-1) with the demo account signed in on both sides.

---

## What was actually wrong, and what was fixed

The web app moved a long way after the original 2026-08-19 port, and the drift concentrated in five places. The landing page was fully rebuilt: the app's old dark landing plus its invented Original/Editorial toggle were deleted and replaced with a faithful port of the web's light "paper" landing — nav with wordmark and Sign in pill, the "Stop scrolling. Start going." hero with the purple underline SVG, the interactive PhoneSwipeMock deck (3.2s autoplay, 88px/420 velocity thresholds), the 21-card 3D conveyor carousel (30s cycle, rotateY 66deg, depth folded into scale because RN has no translateZ), the #120C24 count-up metrics band, the four-step how-it-works with ChatMock/TrendingMock/mini-deck/ConfirmMock visuals, and the draggable 19-sticker footer collage with boarding pass, pill links and legal row. All 21 landing webp assets were copied byte-identical from the target's public folder.

The profile screen gained the web's new BookingReminders "Calendar" pane (add-booking dialog with place/date/time and reminder chips, .ics via the native share sheet replacing the browser download, Google Calendar links, delete), and lost the invented "Loki" menu group; its legal rows are now no-ops exactly like the web's. The browse surface's explore section was corrected from a two-column "Explore" grid to the web's single-column "Browse by Category" rows with emoji tiles and per-group place counts. Collections and the shared-collection page gained the two features the web added since the port: swipe-vote undo (Undo2 button on the deck, lastSwiped/removeVote wiring, an "undo" vote type on the shared API) and the two-week group availability calendar with the "When:"/"Where?"/"When?" summaries; the shared page's section order was also corrected to Map, Swipe, Lineup, Availability, Plan. Deleted for parity: the How-it-works and Ambassadors screens (the web removed those pages), with About's "See how it works" retargeted to the landing's #how section via a new scrollTo param.

---

## What was verified, and how honestly

Landing, auth, browse, place-details sheet and profile were verified live side-by-side at 390x844 in the claimed lane, signed into the same demo account on both sides against the same production data (screenshots under the run's evidence folder). Maps, vibes, onboarding, chat, curated albums, vibe grid, about, plans, maintenance, trial and both legal pages were verified by exhaustive code diff (subagent report: IN PARITY at the mobile breakpoint). Four FSM actions were replayed conformant with zero undeclared effects; the fourteen write actions were deliberately not exercised because they mutate the live shared production Firestore, and that is a recorded limit in `conformance.json`, not a pass claim. tsc is clean, expo-doctor is 18/18, and both native bundles compile on SDK 54.

---

## What remains open

Three things are yours: the on-device Expo Go tap-through (this machine has no simulator, so rendered checks used the react-native-web proxy — layout and colors are shared with native via Yoga, but fonts and shadows deserve one pass on glass); an explicitly authorized live-write conformance pass if you want votes/shares/bookings exercised against production; and a keep-or-remove decision on the two placeholder PostHog vars this run appended to `loki-web-app/.env.local` (backup saved) because the dev server refuses to hydrate without them. New dev-facing dependencies (react-native-web, dotlottie-react for web preview, expo-file-system/sharing, datetimepicker) do not affect the store bundles except the last three, which power real ported features.
