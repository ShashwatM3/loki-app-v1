# NEEDED_FROM_HUMAN — run 2026-09-02-run-01

## Assets
Nothing. Every asset the retained scope renders was copied byte-identical from the
target's own repository (public/landing/*.webp, logo2.png, lokianimation). Zero
fabricated stand-ins were introduced; the app's Instagram footer glyph is drawn from
the same open-source (ISC) lucide icon geometry the target uses, because the RN icon
package dropped brand icons.

## Interactive checkpoints that remain yours
1. On-device tap-through (HUMAN_STEPS.md Part 3) — this machine has no iOS simulator
   or Android emulator, so rendered verification used the react-native-web proxy.
2. If you want the live-write conformance pass (create/delete collection, votes,
   shares, bookings) run against the production demo account, say so explicitly —
   the run deliberately did not mutate shared production data.
3. loki-web-app/.env.local: keep or remove the two placeholder PostHog vars appended
   by this run (backup: .env.local.bak-cloning-run).
