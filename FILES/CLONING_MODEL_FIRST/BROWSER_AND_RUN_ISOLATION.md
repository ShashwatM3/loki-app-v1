# Browser and Run Isolation — held constant

## This file is deliberately a binding stub

The governing text is [`../CLONING/BROWSER_AND_RUN_ISOLATION.md`](../CLONING/BROWSER_AND_RUN_ISOLATION.md). Read it there, in full, during Phase 0 of [`AUTONOMOUS_CLONE_BUILDING.md`](./AUTONOMOUS_CLONE_BUILDING.md) — before the run ledger is complete and before any browser, server, or repository write.

Nothing in it is amended, relaxed, or extended by this protocol variant. It applies here exactly as written: the six isolation invariants; the four-resource lane claim recorded in `run.json` before first use, unconditionally; the claim procedure and binding rules; the Playwright-lane preference and the prohibition on editor-embedded browsers with the reasoning behind it; namespace addressing; the persistent-versus-isolated profile mechanics; per-worker browser grants defaulting to `false`; the rule that while an authentication page is live the browser has no user, including the coordinator; the prohibition on `browser_close` and storage clears; tab-identity verification before each action; the four-step degradation ladder; and the rule that an agent never edits the host's MCP configuration.

## Why it is a stub rather than a copy

Duplicating a 138-line document into a sibling folder creates two texts that must be edited together and will not be. The isolation rules are the most safety-critical in the suite — they are what stops one run from logging another out mid-session, and what stops a run's own research worker from navigating away from its authentication page — so a stale second copy of them is worse than no copy.

Keeping one governing text also means a fix to lane discipline reaches every protocol that binds it, on the day it is made.

## The three places where this protocol relies on it

Stated so a run knows where the dependency bites, not as new rules:

- **Phase 3, the authentication gate.** This variant is the heavier consumer of the authenticated session, because Phases 4 and 5 extract a specification and an FSM from it. The entrypoint therefore asks the run not to release the session until modelling is drafted far enough to know what evidence is still missing. That makes tab-identity persistence and the "no user while the auth page is live" rule more load-bearing here than in the incumbent protocol, not less.
- **Phase 9, model conformance.** The harness drives the running clone in the run's own claimed lane, on its claimed port, against the conformance build profile. It is a browser consumer like any other and it holds no special exemption; a granted worker browses one at a time, in a bounded burst.
- **Per-episode freshness.** The conformance harness materializes a fresh episode per action group, and per-episode browser freshness is obtained by starting an `--isolated` context — never by clearing storage on a live profile.
