# Spec-Driven Implementation

## Entry contract

This is the from-scratch implementation branch of [`AUTONOMOUS_CLONE_BUILDING.md`](./AUTONOMOUS_CLONE_BUILDING.md). Enter only when validated planning selected `GREENFIELD` or `REFERENCE_ONLY`. It is the model-first counterpart to `../CLONING/HIGH_FIDELITY_WEBSITE_CLONING.md`.

Required inputs: target URL and authenticated resume state where applicable; `research.json`; validated `target-spec.json` and `fsm.json` with `model-validation.json`; validated `plan.json` with its ordered transition list and both build profiles; validated `state-contract.json`; writable canonical clone path and run-evidence path.

The adoption branch also invokes this document's §5 through §8 — the test-driven loop, conformance, comparison, and discrepancy handling — after its upstream code and state seams are safe. It must not use §2's scaffolding to overwrite a qualified imported architecture.

### What is inherited verbatim

This document contains only what changes when a validated model exists before the code. Everything below is **inherited unchanged from `../CLONING/HIGH_FIDELITY_WEBSITE_CLONING.md` and is not restated here**, because duplicating it would let it drift:

| Inherited | Where it lives |
|---|---|
| The exact-asset scrape protocol and the `NEEDED_FROM_HUMAN.md` standard — hard bans, all six maximal-scrape methods, local packaging, the always-maintained handoff file, the child-simple template, the release-impact severities | its Phase 7, §"Asset rules" |
| The autonomy rule and the authentication pause, including the cursor and tab-identity handling | its Phase 2 |
| The permanent target/clone side-by-side invariant and its list of things not to do | its Phase 3 |
| The state-aware UI inventory field set — id, scope class, route and parent, element/state, preconditions, trigger, result, read operation, write operation, target evidence, clone status, visual/behavioural/state status, notes | its Phase 5 |
| The four fidelity categories — structure, visual design, interaction, content — and the domain-consequence record | its Phase 6 |
| Discrepancy severities and the correction loop with no fixed iteration cap | its Phase 9 |
| The per-item verification ladder from Discovered to Verified | its Phase 10 |
| Browser and run isolation | `../CLONING/BROWSER_AND_RUN_ISOLATION.md`, in full |
| The state, seed and reset hardening rules, the production and Harbor readiness checks, and the survival-critical test budget | the entry protocol's Phases 7 and 10 |

**One** phase of the incumbent branch is replaced rather than inherited: its Phase 7 slice ordering, because the unit of work here is a transition rather than a page. Its Phase 13 coverage audit is extended rather than replaced — §8 below keeps its checklist and adds the transition, goal, asset and static-node checks.

Its Phase 4 recursive reconnaissance is **not** replaced, and an earlier version of this document wrongly said it was. Reconnaissance now runs ahead of the specification, in [`TARGET_MODEL_SPECIFICATION.md`](./TARGET_MODEL_SPECIFICATION.md) §0, and its inventory is the input the model must account for. Discovering what exists and describing how it behaves are different jobs, and a protocol that lets the second one stand in for the first produces a deep, narrow clone whose every gate passes.

---

## Mission

Build a complete, high-fidelity implementation of the target's declared product scope for use as a computer-use training environment, where the declared scope is the node and edge set of `fsm.json`.

A clone is valid only when a user action produces the right visible transition **and** the right verifier-readable consequence. This branch adds a third condition: **and the transition the clone performs is the transition the model declares.** Visual fidelity, behavioural fidelity, model conformance, deterministic state, and clean episode reset are all functional requirements.

---

## 1. Quick-reference principles

1. **The model is the work order.** Implementation consumes `target-spec.json` and `fsm.json`. Do not re-derive entities, operations, pages, or transitions from memory or from the target while building — that work already happened, under evidence discipline, and redoing it informally produces a second, unrecorded model.
2. **The target is still the fidelity authority.** The model governs structure and behaviour; the live target governs pixels, copy, assets, and anything the model does not name.
3. **Target and clone stay side by side continuously.** Unchanged from the incumbent protocol, and not weakened by having a model. A model tells you what should happen; only the target tells you what it looks like.
4. **The unit of work is a transition, not a page.** A slice is a set of transitions sharing a precondition state and a durable consequence.
5. **Tests and code are written together, then iterated until they pass.** InfiniteWeb's loop, driven by canonical traversals rather than a guessed task set.
6. **Schema, clock, ledger, seed, reset, and the server state seam precede deep UI work.**
7. **Never edit the model to make the implementation pass.** Amendments require target evidence and re-run the Phase 5 gate.
8. **Every included affordance is a declared action, and every declared action is replayed.**
9. **Exact assets only, per the inherited asset protocol.**
10. **Task-ready, not task-hard-coded.** Goals are product completions; the base world supports overlays without containing answers.
11. **No interactive human checkpoint except authentication.**
12. **Completion requires conformance, coverage, state, reset, production runtime, asset provenance, and independent-audit evidence.**

---

## 2. Phase A — Ownership and the thin stack

Create or confirm a self-contained clone root under `clones/<name>/`, following `plan.json`:

~~~text
clones/<name>/
├── web/                    application root
├── db/                     schema, migrations, base fixtures, derived seed
├── environment/            runtime contract, image helpers, and the model contracts
│   ├── target-spec.json    installed at release; the clone's specification
│   ├── fsm.json            installed at release; the clone's behavioural contract
│   └── conformance/        the replay harness
└── FILES/                  target evidence, scope, fidelity, and release records
~~~

Use the plan-selected stack; for a greenfield web clone the workspace default is Next.js App Router with TypeScript, route handlers or server actions as a thin backend, SQLite through a maintained server-side driver, a production build path, and local static assets. Pin the package manager and runtime, commit the lockfile, define build/start/reset/release-gate commands, externalize port and database path, and prove a clean production build immediately.

Define **both build profiles** now, not later. The graded profile's stripping transform is part of the build configuration from the first commit, because retrofitting it after two hundred components carry the attribute is how one gets missed.

---

## 3. Phase B — State foundation, derived

Complete before substantial page styling. This is the incumbent branch's Phase 1 with the guesswork removed: entities, fields, enums, relationships, invariants, actors, and the clock all come from `target-spec.json`, and the durable signature homes come from `fsm.json` through the state contract.

1. **Schema and migrations** from specification entities. Every table records the specification entity id it implements. Enable foreign keys on every connection; encode enums, uniqueness, nullability, and referential behaviour as constraints where practical; add the invariants recorded in the specification as constraints where a constraint can express them.
2. **The environment metadata table** carrying `schema_version`, `seed_version`, `generator_version`, `episode_id`, `episode_seed`, `frozen_now`, and — new here — `spec_version` and `fsm_version`. A clone that cannot say which model it implements cannot be checked against one.
3. **The clock**, from the specification's clock block, in one injectable module. Every product date calculation routes through it; no product code reads wall time.
4. **The operation layer.** One server-side function per specification operation, taking exactly its declared user-provided parameters, resolving system-managed parameters from the session and the injected clock, running in one `BEGIN IMMEDIATE` transaction with precondition predicates and checked affected-row counts, and applying its declared idempotency rule. UI components never open SQLite.
5. **The transition ledger.** One append-only table per the state contract. Every write operation writes its `ledger_action` row **inside the same transaction as the domain write**, so the pair cannot come apart. The ledger carries what changed, never what should have changed.
6. **Base seed and episode seams**, exactly as the entry protocol's shared state lifecycle requires: human-diffable fixtures, a deterministic base builder that stages/validates/closes/hashes/atomically publishes, a generic episode-overlay interface, a reset command copying an immutable episode to a fresh runtime path, and the integrity/foreign-key/identity/digest/reset tests. The seed is built to the **surface density budget** the specification already carries — the per-page `density` floors and per-entity `seed_density` — under the standard in `../CLONING/HIGH_FIDELITY_WEBSITE_CLONING.md` §1.4. Build to the floors first and the totals will follow; building to a total and hoping the surfaces fill is how a clone ends up with a large database and an empty screen.

### 3.1 The first tracer bullet is a traversal, not a page

Before breadth, implement the shortest canonical traversal from the initial state to one declared goal, end to end:

~~~text
immutable seed → fresh runtime DB → rendered target-like UI
→ transition 1 … transition n along the traversal
→ server operation per write → durable rows + ledger rows
→ goal predicate becomes true, and not before
→ reload/readback → artifact inspection → reset to initial digest
~~~

The incumbent protocol's tracer bullet is one Core operation. Making it a traversal costs slightly more and proves considerably more: it proves the operation layer, the ledger, the goal predicate, the clock, the reset, *and* that the transitions compose. If it cannot pass, repair the architecture before adding pages. A wide static clone on a broken state seam is discarded work.

---

## 4. Phase C — The global visual system, once

InfiniteWeb's frontend order is adopted while its authority is refused. The paper extracts a global style constraint from a reference image before realising pages; we extract it from the **target itself**, which is strictly better evidence, and then hold it fixed.

Before per-page work, capture from the target and record in `FILES/`: the colour system, typography hierarchy with families and weights, spacing scale, border radii, shadow set, control and button patterns, focus treatment, and breakpoints. Implement it once as design tokens plus a shared shell, then build pages against tokens.

The reason for the ordering is not tidiness. A clone built page by page from memory acquires a slightly different blue and a slightly different card radius on every surface, and the resulting drift is a long tail of Minor findings that individually never justify a refactor. Fixing the system first converts that tail into one decision.

This is a *starting constraint*, not a licence to stop looking. Where the target is locally unconventional — and real products are, constantly — the target wins and the local exception is recorded. Never "improve" an observed oddity into a generic design.

---

## 5. Phase D — The test-driven loop over canonical traversals

This is InfiniteWeb's task-centric test-driven development with its driver replaced, and the replacement is the point.

The paper generates tests and implementation in parallel from shared pre-generated data, runs the tests, and iterates until they pass, with a fixed iteration cap. Its correctness criterion is explicitly partial: "rather than enforcing full functional correctness over the entire website, we focus on ensuring that only the functionalities required for the target tasks are correct." Removing the loop costs it 5.0 points of functional correctness.

We cannot accept that criterion. An environment must be reusable before its tasks exist — invariant 3 — so "only the task paths work" is a clone that quietly fails the moment a task author picks a different subgraph. So the tests are driven by the **canonical traversal set** from `model-validation.json`: every declared transition covered at least once, plus a shortest path to each declared goal. That set is derived from the model rather than from a guessed benchmark, it covers the whole declared scope by construction, and it is exactly what the Phase 9 harness will replay.

### 5.1 The loop

For each slice in `plan.json`'s transition order:

~~~text
read the slice's transitions from fsm.json
→ write the slice's conformance assertions from their declared preconditions, effects,
  durable consequences, ledger rows, and idempotency rules
→ implement the smallest shared shell/components the slice needs
→ implement the server operations the slice's writes name
→ implement the UI, carrying data-fsm selectors verbatim from the model
→ scrape every asset the slice's surfaces render, by the inherited asset protocol, and record
  each one in assets.json with its locator, method, local path and hash
→ run the slice's assertions
→ on failure: read the failing assertion, the observed state, the declared state, and the
  responsible code; fix; re-run
→ on pass: compare the slice's surfaces against the live target (§6)
→ correct visual and content discrepancies
→ reset and prove the slice returns to its initial semantic digest
→ mark the slice's transitions Implemented
~~~

Assertions are written from the model **before** the implementation they check, and by reading the model rather than the code. Writing them afterwards from the code produces assertions that agree with whatever was built, which is the same failure as editing the model to make a replay pass, arriving through a different door.

### 5.1.1 The asset step is inside the loop, not after it

**This step exists because omitting it produced a measured failure.** An earlier version of this loop inherited the asset protocol by reference and did not name it as a step, and the first run under this protocol shipped a category rail of emoji, fifty assets handed to the human, and store cards rendering as flat coloured rectangles with the restaurant name set in text — while reporting zero fabricated stand-ins. A run under the incumbent protocol against the same target packaged fifty-four scraped SVGs and photographed every card.

The mechanism is worth understanding rather than just the rule. Inheriting a body of rules by reference works when the rules govern a decision the run is already forced to make. It fails when the rules govern work the loop never asks for, because a loop that never says "now get the icon" will reach the end without an icon and without noticing. The incumbent's vertical-slice loop names assets as step four; this loop had no such step.

So the slice is not Implemented while any surface it renders shows a placeholder. Concretely, and repeated here rather than referenced because a reference is what failed:

- **Emoji are a fabricated stand-in.** So are icon-library glyphs, letter avatars, AI-generated imagery, free-stock photography, and coloured rectangles bearing a name in text. Shipping one and reporting zero fabrications is a false claim in a release report, not a rounding error.
- **A chrome icon is usually inline SVG in the DOM**, not an image file. Failing to find a `.png` URL proves nothing; serialize the SVG node.
- **Every seeded row that the target renders with an image gets one.** One scraped hero and nineteen placeholders is a density failure and an asset failure at once.
- **An asset that survives the full scrape protocol unobtained** goes to `NEEDED_FROM_HUMAN.md` with child-simple retrieval steps, and the surface it belongs to carries an open Major until it arrives. It does not get a substitute in the meantime.



### 5.2 The iteration cap, and what to do when it is hit

Cap repair iterations per slice — eight, following the source paper, which reports only 1.5% of its websites unresolved at that cap. Hitting the cap is a signal, not a reason to loosen the assertion. Diagnose in this order: the model is wrong about the target (return to the FSM Architect **with target evidence**); the state seam is wrong (return to Phase B); the slice is too large (split it at a precondition boundary). Loosening the assertion or deleting the transition is available, produces a green slice, and leaves a clone that no longer implements its own contract.

### 5.3 What not to convert into permanent tests

The slice assertions are the conformance harness — one runnable artifact over the transition set, kept at `clones/<name>/environment/conformance/`. Do not additionally scatter them as hundreds of unit-test files. The entry protocol's survival-critical test budget is explicit about which permanent tests earn their place, and "one test per transition" would blow through it while adding nothing the harness does not already run.

---

## 6. Phase E — Continuous target ↔ clone comparison

Unchanged in substance from the incumbent branch, and non-negotiable. Having a model does not tell you what the product looks like.

Keep the live target and local clone visible and independently controllable throughout, both in the run's own claimed lane on its own claimed port, re-selecting the recorded tab before each action. Do not explore for a long period and then build from memory, close the target and rely on a component library's defaults, compare different routes or actors or viewports or states, build a whole page before the first comparison, substitute source similarity for rendered evidence, or rely on screenshots when the live interactive state is reachable.

Apply the loop to every meaningful item:

~~~text
match target and clone state
→ compare presence → structure → visual design and content → interaction and navigation
→ compare durable state
→ fix highest-severity discrepancy → reproduce and compare again
→ recheck adjacent verified items
~~~

Always match actor, seed data, route, selected values, dialog state, scroll position, viewport, and theme before judging a difference. Compare at every viewport the plan declares. Record the four fidelity categories the incumbent branch defines — structure, visual design, interaction, content — for each item.

**The checklist is the inventory, joined with the model — not the model alone.** This is a correction to an earlier version of this document, which said the list of states to compare was `fsm.json`'s state set. That was wrong, and it was wrong in the direction that hurts: the FSM carries behaviour, so a static pane with no action is absent from it, and a comparison sweep driven from the FSM never visits the footer, the hours table, or the ratings breakdown.

So the sweep is driven from `surface-inventory.json`, which reconnaissance populated before the model existed and which carries every node regardless of whether an action touches it. The FSM then supplies, for each node that has one, the transitions to exercise while you are there. Breadth comes from the inventory; depth comes from the model; neither substitutes for the other.

A node the inventory declares and nobody looked at is `NOT ASSESSED`, exactly as in the audit rubric, and it costs coverage.

`surface-inventory.json` keeps the incumbent's fields and adds `fsm_node_id` to every row, so the inventory and the model can be joined rather than compared by eye.

---

### 6.1 The cross-surface sweep

Per-transition conformance and per-surface comparison both work one node at a time, and a whole class of defect only appears when nodes are used together. So after the slices in a region are verified, exercise organic workflows that cross components and routes — the incumbent branch's Phase 10 requirement, carried here unchanged because a model does not remove the need for it.

It catches, specifically:

- stale component or session state;
- inconsistent calculations or counts between two surfaces reading the same fact;
- writes that one page performs but another fails to reflect;
- ordering effects and duplicate submissions;
- back, forward and reload problems;
- route transitions that bypass auth or actor identity;
- controller or background effects that survive reset.

Worth being explicit about why this survives into a model-first branch: several of those are *composition* defects, and the conformance harness drives one transition from a clean state, so it will not see them. A stale count on a second surface is a real defect that every single-transition replay passes. Any new discrepancy re-enters the inventory and the correction loop.

## 7. Phase F — Discrepancy classification and correction

The incumbent severities, unchanged:

- **Critical** — missing or incorrect Core route, action, durable result, auth/identity, reset, or navigation; data loss or dead affordance; fabricated or lookalike Core chrome assets presented as target-faithful.
- **Major** — wrong structure, responsive behaviour, state transition, permissions, validation, ordering, or meaningful content; an exact asset still only in `NEEDED_FROM_HUMAN.md` on a retained Supporting surface; placeholder media with no handoff entry.
- **Minor** — small typography, colour, spacing, border, radius, shadow, or alignment difference with no behavioural impact. Icon geometry mismatches are not Minor if the glyph is a substitute.

Three model-specific classes, and the third is the one that earns this protocol its keep:

- **Model-implementation divergence** — the clone does not do what the model declares. Critical on a Core transition, Major otherwise. Fixed in the clone.
- **Model-target divergence** — the model does not describe the target. Always at least Major, because it means an artifact the whole run depends on is wrong, and it may have propagated into the schema, the goals, and the ledger vocabulary. Fixed in the model, with target evidence, re-running the Phase 5 gate.
- **Undeclared effect** — the clone does something the model does not declare. Major until diagnosed, and it resolves into one of the two above. This is the class no sweep-based protocol produces, and it is worth stating why it is valuable: an unintended side effect is a determinism and reward-hacking risk that will otherwise be discovered by a training run, and an unmodelled target behaviour is a fidelity gap that no amount of clicking around was going to surface.

Correction has no fixed iteration cap. After three materially unchanged passes, stop tweaking symptoms and diagnose the shared layout, state, data, asset, model, or timing seam. Never dismiss a discrepancy because an agent could probably work around it. Record every unresolved Minor; no Critical or Major may remain at release.

---

## 8. Phase G — Coverage audit before handoff

Every declared transition must satisfy:

~~~text
[ ] Implemented
[ ] Precondition observed to gate it, including the no-op branch
[ ] GUI procedure executes as declared, with the declared selector
[ ] Declared effect produced, and nothing beyond it
[ ] Declared durable consequence and ledger row committed in one transaction
[ ] Declared idempotency rule holds under repetition
[ ] Observable result actually visible to a screen-driven agent
[ ] Every asset it renders is exact-scraped and recorded in assets.json, or is an open NEEDED_FROM_HUMAN entry
[ ] Zero placeholder glyphs, emoji, icon-pack substitutes, letter avatars, or named colour blocks
[ ] Any collection it renders meets its declared floor, or is a recorded declared_empty
[ ] Control count is within the parity bar of the target's equivalent surface, and every card the target renders is present
[ ] Not a zero-control route
[ ] Every filter, sort, tab and facet on it both includes and excludes at least one seeded row
[ ] Surfaces compared against the live target at every declared viewport
[ ] Survives reload/restart as expected
[ ] Returns to initial semantic digest after episode reset
[ ] Evidence level recorded; directly compared where safe and reachable
[ ] Rechecked after adjacent modification
~~~

Every declared goal must satisfy:

~~~text
[ ] Reached by its canonical traversal
[ ] Predicate true at the declared point and false before it
[ ] Exclusion clauses reject a superset final state
[ ] Predicate reads only durable state
~~~

Every **static** inventory node — a node with no transition — must satisfy:

~~~text
[ ] Present, and compared against the live target at every declared viewport
[ ] Assets exact-scraped
[ ] Content and formatting match
[ ] Responsive behaviour matches
[ ] Recorded Verified in the inventory, with no conformance signal expected
~~~

A static node is not exempt from fidelity. It is exempt only from replay, because there is nothing to replay.

Every excluded or boundary surface must satisfy:

~~~text
[ ] Scope rationale recorded
[ ] Inbound affordances identified
[ ] Boundary treated — truthful target-like state, or consistent removal
[ ] No reachable dead end left behind
[ ] No required Core/Supporting dependency removed
[ ] Fidelity consequence reported
~~~

Requirement: zero unreviewed declared transitions, states, and goals; zero unresolved Critical or Major discrepancies of any class; zero unverified persistent surfaces; no knowingly stale runtime state.

---

## 9. Phase H — Branch completion handoff

Complete only when the Implementer can establish that:

- the validated specification, FSM, plan, and state contract were followed or formally amended with target evidence;
- every declared transition and goal passed §8, and every retained UI node met the evidence-level rule and was directly compared where safe and reachable;
- every included durable operation writes and reads authoritative SQLite and its ledger row;
- base seed, episode materialization, reset, browser/process isolation, and artifact collection pass;
- the production clone runs offline from locked inputs, in both profiles, with the graded profile proven free of selector attributes;
- the model contracts and the conformance harness are installed under `clones/<name>/environment/` and hash-match the accepted run artifacts;
- no Critical or Major discrepancy or state/reset failure remains.

Write `implementation-evidence.json` and return to the coordinator for Phase 9 conformance and then the independent release audit. Do not self-certify the release, and do not run your own conformance pass as the Conformance Engineer in `delegated` mode.

The evidence must report everything the incumbent branch requires — identity, scope version, stack, frozen clock, route and node and interaction-state and durable-operation counts, comparison passes and discrepancies by severity, schema/base/episode versions and digests, production build and gate and runtime and reset and offline and artifact and Harbor-smoke results, reference-only sources and asset provenance with the path to `NEEDED_FROM_HUMAN.md`, excluded surfaces and unresolved Minor items and unobservable target states, and technical limitations without inflating them into success — plus the specification and FSM versions and digests, slices and their repair-iteration counts, transitions implemented against declared, model amendments with their target evidence, undeclared effects found and how each resolved, and both profiles' build results.
