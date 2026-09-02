# Autonomous Clone-Building Protocol — model-first

## Invocation

This is the sole entrypoint for a new clone built under the model-first protocol. A request such as:

> Follow the cloning protocol at `FILES/PROTOCOLS/CLONING_MODEL_FIRST/` and clone: `https://target.example`

authorizes the coordinator to research, model, plan, implement, validate, and package the clone autonomously. The target URL is the only required input. Do not ask the user to choose a stack, repository, scope, seed shape, port, import method, or implementation detail.

The only permitted interactive human pause is target-site authentication. Exact visual assets that remain unobtainable after maximal scrape effort are recorded in `NEEDED_FROM_HUMAN.md` (a deliverable handoff, not a design Q&A). All other uncertainty is resolved by the evidence, gates, and conservative fallbacks in this protocol.

This folder is a deliberate variant of [`../CLONING/`](../CLONING/), not a replacement. Read [`RESEARCH_BASIS.md`](./RESEARCH_BASIS.md) before running it: it states what was taken from InfiniteWeb and AutoWebWorld, what was refused and why, the exact delta against the incumbent protocol, and the case against this folder. A run that does not understand why the ordering changed will follow the phases and lose the benefit.

---

## Protocol suite and branch routing

Read these files in this order:

1. **This file** — orchestration, research, model gates, planning, state, Harbor, conformance, and release gates.
2. [`TARGET_MODEL_SPECIFICATION.md`](./TARGET_MODEL_SPECIFICATION.md) — Phase 4. Produces and validates `target-spec.json`.
3. [`BEHAVIORAL_FSM.md`](./BEHAVIORAL_FSM.md) — Phase 5. Produces and validates `fsm.json`, and defines the selector contract and the conformance harness.
4. If a qualifying open-source clone is selected, follow [`OPEN_SOURCE_CLONE_ADOPTION.md`](./OPEN_SOURCE_CLONE_ADOPTION.md).
5. If no candidate qualifies, or a candidate is useful only as a reference, follow [`SPEC_DRIVEN_IMPLEMENTATION.md`](./SPEC_DRIVEN_IMPLEMENTATION.md).

Two documents are **held constant with the incumbent protocol and are read from there unchanged**, because they are not part of what this variant changes:

- [`BROWSER_AND_RUN_ISOLATION.md`](./BROWSER_AND_RUN_ISOLATION.md) — a binding stub; the governing text is `../CLONING/BROWSER_AND_RUN_ISOLATION.md`. Read it during Phase 0, before the ledger is complete and before any browser, server, or repository write.
- The exact-asset scrape protocol and the `NEEDED_FROM_HUMAN.md` standard in `../CLONING/HIGH_FIDELITY_WEBSITE_CLONING.md`, Phase 7. Every asset rule, hard ban, scrape method, and handoff template applies here verbatim and is not restated.

The branch documents return to this file for conformance and the independent release audit. `../../CLONING_PROTOCOL.md` is Airbnb-specific background, not an entrypoint.

Primary external authorities to recheck during each run:

- [Harbor task structure and configuration](https://www.harborframework.com/docs/tasks)
- [Harbor artifact regrading](https://www.harborframework.com/docs/run-jobs/regrade)
- [CUA-Gym task/environment/reward discipline](https://github.com/xlang-ai/CUA-Gym)
- [InfiniteWeb](https://arxiv.org/abs/2601.04126) and [AutoWebWorld](https://arxiv.org/abs/2602.14296) — the mechanisms this protocol derives from

```text
TARGET URL
   │
   ▼
CAPABILITY ROUTING → PUBLIC RESEARCH → AUTH GATE → VALIDATED RESEARCH
                                                      │
                                                      ▼
                                          TARGET SPECIFICATION  (spec gate)
                                                      │
                                                      ▼
                                            BEHAVIORAL FSM      (fsm gate)
                                                      │
                                                      ▼
                                              VALIDATED PLAN
                                                /            \
                                      QUALIFYING OSS       NO QUALIFYING OSS
                                             │                    │
                                             ▼                    ▼
                                      ADOPT + CONFORM      BUILD FROM THE MODEL
                                             \                    /
                                              ▼                  ▼
                                  MODEL CONFORMANCE → STATE / RESET / FIDELITY GATES
                                                      │
                                                      ▼
                                           INDEPENDENT RELEASE AUDIT
```

The single structural difference from the incumbent flow is that two gated modelling phases sit between validated research and planning, and one gated conformance phase sits between implementation and fidelity. Everything else in the diagram is the incumbent's shape.

---

## Mission and scope standard

Build a lightweight, production-mode, closed-internet replica that is visually convincing, behaviorally complete, and state-verifiable. It must be reusable as an environment before any final task set exists and composable with sibling clones later without moving product ownership into task packages.

"High fidelity" means exhaustive fidelity **inside a declared product scope**, not recursively cloning the entire public internet. In this protocol the declared scope is not a prose classification that implementation is trusted to honour — it is the node and edge set of `fsm.json`. Scope closure is therefore a graph property that a validator checks before code exists:

- every page reachable from the initial page;
- every declared terminal state reachable;
- every action attached to exactly one page whose signature declares every path its preconditions and effects touch;
- no action whose `from` page is unreachable;
- every visible affordance either present as an action, or absent from the markup, with the boundary treatment recorded.

If a visible control would cross the scope boundary, either model a truthful target-like boundary state as a real action, or remove the control consistently as part of the declared scope. Recording a limitation alone never permits an inert control. Deep unrelated products, marketing trees, third-party flows, and operational consoles may be excluded; a primary workflow or dependency may not be excluded merely because it is difficult.

---

## Non-negotiable invariants

The first fifteen are the incumbent protocol's invariants, unchanged, because this variant does not relax any of them. Numbers 16 to 21 are this protocol's additions.

1. **Research before modelling, modelling before implementation.** A repository search result is not an adopted clone, and a validated model is not a built clone.
2. **The live target is the fidelity authority.** An open-source clone is only a substrate; a specification and an FSM are only hypotheses until target evidence backs each node.
3. **Environment-first, task-ready.** Build reusable domain capabilities and state seams; do not bake guessed future task answers into the app, the spec, or the FSM.
4. **SQLite owns durable state.** Any fact a future verifier may grade must be queryable from the clone-owned database.
5. **Task state is injected, not hard-coded.** One application build must support many clean episode worlds.
6. **Every run starts clean.** Immutable episode inputs are copied to fresh runtime paths; runtime databases are never reused as seeds.
7. **Clone boundaries remain independent.** Cross-app composition belongs under workspace `harbor/`.
8. **Runtime is self-contained.** Production containers make no calls to the target, CDNs, analytics, hosted databases, or other public services.
9. **No dead affordances, fake writes, or starved surfaces.** A visual imitation without its durable consequence is incomplete, and so is a retained surface that renders empty because nothing was seeded into it — a control nobody can exercise and a list nobody can read are the same defect wearing different shapes.
10. **Authentication is the only interactive human checkpoint.**
11. **Exact target assets; never fabricate.** Governed verbatim by the incumbent asset protocol.
12. **Unobtainable assets become a human handoff file, not a guess.**
13. **Evidence earns completion.** Builds, resets, replays, UI comparisons, and release controls must actually run.
14. **Live-target exploration is read-only by default.** Never cause a purchase, booking, send, invitation, upload, deletion, publication, payment, or other monetary/public/third-party effect on the user's real account without separate explicit authorization.
15. **A run claims an exclusive lane and never assumes it is alone on the machine.**
16. **The model is evidence-bound, not invention.** Every page, signature variable, action, precondition, effect, and goal in the model carries a target-evidence reference and an evidence level. A node asserted without target evidence is written into the specification's `assumptions` array with its risk, never silently absorbed as fact. Structural validity is not truth: a validator certifies that a model is coherent, never that it is the target's model.
17. **The model precedes and outranks the implementation.** When code and model disagree, one of them is wrong and the run must decide which with target evidence. Silently editing the model to match what was built is the primary failure mode of this protocol and is a release blocker.
18. **A signature is a view, never a store.** Every signature variable declares `backing: durable` with its table and column, or `backing: transient` for presentation-only state. No durable outcome may depend on a transient variable.
19. **Every durable transition leaves a queryable ledger row.** Instrumentation lives in SQLite, not in browser storage. A transition whose occurrence cannot be recovered from the collected artifact cannot be graded, and therefore cannot support the revision and retraction capabilities this workspace exists to measure.
20. **Conformance is replayed, not reasoned about.** A transition is conformant when its GUI procedure has been driven on the running clone and produced the declared signature effect and the declared durable consequence. Source inspection, route probes, and reasoning from the model satisfy nothing.
21. **Model instrumentation never reaches the graded image.** Selector attributes exist in the conformance build profile only. The graded build is proven to contain none, and to be otherwise identical.

---

## Phase 0 — Bootstrap and durable run state

### 0.1 Read local authority

Before acting, read the workspace and applicable clone `AGENTS.md` files, the workspace context and workflow, this protocol suite including `RESEARCH_BASIS.md`, `../CLONING/BROWSER_AND_RUN_ISOLATION.md`, the asset protocol in `../CLONING/HIGH_FIDELITY_WEBSITE_CLONING.md`, the audit rubric under `../AUDITING/`, current Harbor configuration, and the nearest relevant working clone. Local executable schema, materializers, entrypoints, and tests outrank historical scratchpads when they conflict.

At run time, also verify the installed Harbor version and current official task documentation. Record the version used.

### 0.2 Create the run ledger

Create a unique staging directory at:

```text
FILES/SCRATCHPADS/cloning-runs/<target-slug>/<run-id>/
```

Maintain these machine-readable artifacts. Rows marked **new** do not exist in the incumbent protocol; every other row keeps the incumbent's name and meaning so that two runs of the two protocols produce comparable ledgers.

| Artifact | Owner | Required content |
|---|---|---|
| `run.json` | Coordinator | URL, target identity, phase, mode, branch, `lane` claim, auth cursor including tab identity, retries, artifact hashes, gate results, model versions, and final status |
| `research.json` | Researcher | Search coverage, target evidence, candidate evidence, measurements, scores, and rejections |
| `target-spec.json` | Specification Architect | **new** — entities, relationships, operations, page architecture, actors, clock, chrome, and the assumptions register. Schema: [`schemas/target-spec.schema.json`](./schemas/target-spec.schema.json) |
| `fsm.json` | FSM Architect | **new** — pages, signatures, actions with preconditions/effects/GUI procedures, durable effects, goals. Schema: [`schemas/fsm.schema.json`](./schemas/fsm.schema.json) |
| `model-validation.json` | Model validator | **new** — the executable output of `validate_model.py`: errors, warnings, and structural metrics |
| `plan.json` | Planner | Branch, architecture, paths, ports, pruning, implementation order over transitions, and acceptance gates. Scope is a reference into `fsm.json`, not a re-listing |
| `state-contract.json` | State & Episode Architect | Schema/seed/runtime layers, clock, identity, reset, materializer, artifact, ledger, and verifier contracts — derived from `target-spec.json` |
| `surface-inventory.json` | **Reconnaissance (Specification Architect)**, extended by the Implementer | **new position** — produced in Phase 4 *before* the specification, not after implementation. Routes, UI nodes, panes, subpanes, triggers, resulting states, backing reads/writes, disposition (behavioural / static / excluded / exempt), and fidelity status. It is the completeness authority: the model must account for every node it carries |
| `conformance.json` | Conformance Engineer | **new** — per-transition replay result, observed against declared effect, durable consequence check, and unreached transitions |
| `implementation-evidence.json` | Implementer | Changed paths, commands/results, screenshots/diffs, runtime measurements, and known discrepancies |
| `assets.json` | Implementer | Per-asset inventory as specified by the incumbent asset protocol |
| `NEEDED_FROM_HUMAN.md` | Implementer | Always present, per the incumbent standard |
| `audit.json` | Auditor | Independent gate results with reproducible evidence |

Write artifacts atomically and checksum each completed handoff in `run.json`. On success, preserve accepted evidence under `clones/<name>/FILES/CLONING/`, and additionally install the two model artifacts as **live clone-owned contracts** at `clones/<name>/environment/target-spec.json` and `clones/<name>/environment/fsm.json`. They are not run evidence; they are the clone's specification, and a later change to the clone that does not update them is a defect.

The ledger's phase is one of:

~~~text
INIT
CAPABILITY_ROUTING
PUBLIC_RESEARCH
AUTH_WAIT
RESEARCH_VALIDATED
SPEC_DRAFTING
SPEC_VALIDATED
FSM_DRAFTING
FSM_VALIDATED
PLANNING
PLAN_VALIDATED
STATE_CONTRACT_VALIDATED
IMPLEMENTING_ADOPTION
IMPLEMENTING_MODEL_DRIVEN
MODEL_CONFORMANCE
STATE_AND_RESET_HARDENING
FIDELITY_CONVERGENCE
RELEASE_AUDIT
COMPLETE
READY_WITH_DOCUMENTED_EXCEPTIONS
TERMINAL_INCOMPLETE
~~~

Record a timestamp, responsible role, input hashes, output hashes, and gate result for every transition. A resume begins by validating those hashes; it does not trust a stale phase label.

### 0.3 Resume and collision rules

- Resume only when the target identity and run ledger match.
- Never overwrite an existing clone or unrelated dirty worktree automatically.
- If `clones/<name>/` already exists, first determine from its provenance and run evidence whether it is the same product and an intentionally resumable build. If it carries model contracts from a prior run, treat those as the resume baseline and re-validate them before extending.
- Use disposable staging for candidate inspection.
- If a safe merge cannot be proven, preserve both states and end as `TERMINAL_INCOMPLETE`.

---

## Phase 1 — Capability routing and agent organization

### 1.1 Detect; do not ask

Inspect the available runtime tools. If a real sub-agent spawn primitive is available, set `execution_mode` to `delegated`. Otherwise set it to `single-agent-hats`, execute the same roles sequentially, freeze and checksum each artifact before changing hats, and make the next hat consume the written handoff rather than unrecorded context.

Inspect the same tool surface for browser drivers and claim a lane by the procedure in the isolation protocol; record it in `run.json` before any browser call.

### 1.2 Roles

| Role | Authority | Exit artifact |
|---|---|---|
| Coordinator | Owns state machine, validates handoffs, selects transitions, and alone communicates with the user | `run.json` |
| Researcher | Read-only target/OSS research and isolated candidate trials | `research.json` |
| **Specification Architect** | **new** — extracts entities, operations, and page architecture from target evidence; owns the assumptions register | `target-spec.json` |
| **FSM Architect** | **new** — extracts states, signatures, actions, preconditions, effects, and goals; assigns selectors | `fsm.json` |
| Planner | Selects `ADOPT`, `REFERENCE_ONLY`, or `GREENFIELD`; freezes architecture and transition implementation order | `plan.json` |
| State & Episode Architect | Specifies and audits deterministic SQLite, ledger, reset, and verifier seams | `state-contract.json` |
| Implementer | Changes only planned clone/runtime paths and gathers evidence | inventory + implementation evidence |
| **Conformance Engineer** | **new** — builds and runs the replay harness; reports observed transitions against declared, and never edits the model to make a replay pass | `conformance.json` |
| Independent Auditor | Read-only release audit; never fixes its own findings | `audit.json` |

Two separation rules matter more than the roster. The Specification Architect and the FSM Architect must not be the Implementer in `delegated` mode, because an author who knows what they intend to build writes a model that describes their intended build rather than the target. And the Conformance Engineer has authority to fail a transition but **no authority to amend `fsm.json`**; a conformance failure returns to the Implementer, or — when target evidence shows the model itself was wrong — to the FSM Architect with that evidence attached. The path from "the replay failed" to "the model now says something else" always runs through recorded target evidence.

Every worker assignment must name objective and current gate; exact inputs to read; writable and forbidden paths; required evidence and output schema; the browser grant, `false` by default; valid exits (`PASS`, `REJECT`, `RETRY`, `BLOCKED`); and the rule that chat summaries do not replace the artifact.

### 1.3 Handoff validation

The coordinator must reject a handoff that lacks reproducible evidence, contradicts its inputs, leaves required fields implicit, or claims a command passed without output. For the two model artifacts there is one additional rejection: a handoff whose accompanying `model-validation.json` was not produced by actually running `validate_model.py` is rejected outright. Retry the worker once with a narrowed contract; if it fails again, execute that role as a sequential hat.

---

## Phase 2 — Public target and open-source research

This phase is the incumbent protocol's Phase 2, unchanged in substance, with one addition to what the researcher must collect. Read `../CLONING/AUTONOMOUS_CLONE_BUILDING.md` §2.1–2.4 for the full requirements: the target brief, repository discovery coverage across at least three materially different query families on at least two discovery surfaces, the candidate evidence table, the hard rejection list, the 75/100 weighted score with its 15/25 coverage and 12/20 state-adaptability floors, and the three permitted research exits.

**The addition.** Research now feeds two consumers rather than one, so it must capture the raw material a specification and an FSM need, and it must capture it while the browser is already on the target rather than sending a later phase back for it:

- **Route families and their parameters** — not merely "there is a listing page" but the URL shape, which parameters are user-supplied, and what changes when each varies.
- **Network and data shape** — authenticated API responses, JSON payloads, and form submissions observed while navigating, saved as evidence files. These are the highest-value evidence class for entity extraction, because they show the target's own field names, enums, and relationships rather than our inference from rendered text. Canvas's run captured 101 authenticated API responses; that corpus is what a specification is extracted from.
- **Interaction inventory per route** — every control, and for each one what visibly changed, whether the change survived a reload, and whether a URL parameter moved. The reload question is the single cheapest discriminator between a durable and a transient signature variable, and asking it during research costs one keystroke where asking it later costs a return trip through the auth gate.
- **Lifecycle and enum vocabularies** — the exact status strings the product shows, in the product's own words.
- **Actor and permission variants** — what differs by role, plan tier, or entitlement.

Every factual claim carries a source URL or local evidence path and an access date. Search snippets alone are leads, not evidence.

---

## Phase 3 — Authentication gate

Identical to the incumbent protocol's Phase 3. Finish all public research that does not need the session; navigate the run's claimed lane to the genuine authentication page; persist the exact resume route **and the tab identity** in `run.json`; stop all target interaction by coordinator and workers alike; tell the user only that the page is open and they need to sign in; never request or accept a password, token, cookie, recovery code, or secret; verify the session and resume from the saved cursor.

Then complete gated target research, freeze a candidate-independent minimum product scope from target evidence, and rerun candidate coverage, hard gates, scores, ranking, and the research exit against that minimum scope before marking research validated.

One ordering note specific to this protocol: **do not release the session until modelling is drafted far enough to know what is missing.** The specification and FSM phases are the heaviest consumers of authenticated evidence in the whole run, and a re-authentication is the only interactive human cost this protocol can incur. Before leaving the authenticated window, sweep the interaction inventory from §2 against a first-draft page and action list, and capture what is still absent. Session expiry may repeat the checkpoint; needing it twice because modelling was deferred is avoidable.

---

## Phase 4 — Target specification

Follow [`TARGET_MODEL_SPECIFICATION.md`](./TARGET_MODEL_SPECIFICATION.md) in full. It produces `target-spec.json` and ends at the specification gate.

Phase 4 begins with **recursive reconnaissance**, inherited unchanged from the incumbent branch and run *before* any modelling. It produces `surface-inventory.json`, and that artifact is the completeness authority for everything downstream. The reason it comes first is a measured one: an earlier version of this protocol claimed FSM extraction replaced reconnaissance, and the first run under it declared six retained surfaces where a run under the incumbent protocol, same target, same day, declared twenty-seven. Discovering what exists and describing how it behaves are different jobs, and letting the second stand in for the first produces a narrow clone that passes every gate, because every gate measures the model against itself.

**Gate `SPEC_VALIDATED`.** `validate_model.py --spec target-spec.json` exits zero, meaning: every entity has a primary key and a declared storage table; every relationship names existing entities and an existing field; every operation classifies each parameter as user-provided or system-managed and names the entities it reads and writes; every write operation names its idempotency rule; every page names its route, its scope class, its operations, and its outgoing navigation; every outgoing navigation names an existing page or a declared boundary; every entity, field, operation, and page carries an evidence reference and level; and no Core-class item rests on level-C evidence. The assumptions register exists, and every assumption names what is unobservable and what breaks if it is wrong. And `surface-inventory.json` exists, carries every node reconnaissance found including panes and subpanes as nodes in their own right, and assigns each one a disposition of behavioural, static, excluded or exempt — with none left silent.

---

## Phase 5 — Behavioral FSM

Follow [`BEHAVIORAL_FSM.md`](./BEHAVIORAL_FSM.md) in full. It produces `fsm.json`, the selector contract, and the conformance harness design, and ends at the FSM gate.

**Gate `FSM_VALIDATED`.** `validate_model.py --spec target-spec.json --fsm fsm.json --inventory surface-inventory.json` exits zero, meaning every structural check in `BEHAVIORAL_FSM.md` §4 passes, spec and FSM cross-reference cleanly in both directions, **every inventory node is accounted for by a behavioural, static, excluded or exempt disposition**, and the recorded structural metrics — page count, action count, durable-write count, mean out-degree, bounded reachable-state count, evidence distribution, canonical traversal set — are written to `model-validation.json`.

A failing check is not a reason to relax the check. The proposer/validator/improver loop the source paper uses is the intended response: revise the model, re-run, repeat. Record each loop iteration in the run trace so the cost of reaching a valid model is visible rather than hidden.

---

## Phase 6 — Planning and branch decision

The planner reads validated research, the two validated model artifacts, this protocol suite, current Harbor rules, and relevant local clone patterns. It does not begin implementation.

The incumbent protocol's planner both freezes scope and chooses architecture. Here the first job is already done: **scope is `fsm.json`**, and the planner may not restate it, narrow it in prose, or hold a private second opinion about it. What the planner may do is propose an amendment to the model — with target evidence — which returns the run to Phase 4 or 5 and re-runs the gate. A planner that quietly plans a subset of the model has broken the only property this protocol buys.

### 6.1 Branch decision

Choose exactly one, on the incumbent protocol's criteria:

- `ADOPT` — select the highest-ranked qualifying candidate and follow [`OPEN_SOURCE_CLONE_ADOPTION.md`](./OPEN_SOURCE_CLONE_ADOPTION.md).
- `REFERENCE_ONLY` — use candidate evidence only as reference and follow [`SPEC_DRIVEN_IMPLEMENTATION.md`](./SPEC_DRIVEN_IMPLEMENTATION.md).
- `GREENFIELD` — no candidate materially helps; follow [`SPEC_DRIVEN_IMPLEMENTATION.md`](./SPEC_DRIVEN_IMPLEMENTATION.md).

There is now one additional input to the decision that the incumbent protocol cannot compute: **how much of the model a candidate already satisfies.** Count the candidate's transitions that already exist against the FSM's action set, and its entities against the specification's. A candidate with many superficial pages and few matching transitions scores worse here than under the incumbent's coverage dimension, which is the correct direction — pages are cheap and transitions are the work.

### 6.2 Required implementation plan

`plan.json` must freeze:

- branch and evidence-backed rationale, including the transition-coverage count above;
- canonical clone root, ownership boundaries, ports, start/build/test commands, and dependency manager;
- **both build profiles** — `conformance` and `graded` — their commands, and how the graded profile strips selector attributes;
- retained, replaced, and pruned upstream areas when applicable;
- architecture and module boundaries, including the server-side state seam and the ledger write path;
- the frozen product clock, timezone, locale, currency, and deterministic randomness policy, taken from `target-spec.json`;
- base-world strategy and future episode-overlay interface, including the density floors carried over from `target-spec.json` and any the plan overrides with a reason;
- local asset and closed-network strategy, governed by the incumbent asset protocol;
- production image, health check, database path, artifact, and cross-app composition seams;
- repository registration updates for the workspace map/index, clone bootstrap, and runtime metadata;
- **implementation order as an ordered list of FSM transition ids**, grouped into slices, with each slice's acceptance check naming the transitions it must conform on;
- expected resource envelope and automatic adoption-abort conditions.

Ordering transitions rather than pages is the operative change. A slice is a set of transitions that share a precondition state and a durable consequence, so the first slice is a shortest path from the initial state to one declared goal — which means the first thing that exists is a working spine rather than a finished page. Order remaining slices by durable-write density first and visual surface area last, because a wrong write seam invalidates pages while a wrong margin does not.

The plan must remain environment-first. It may create an internal smoke episode to test reset and grading seams, but it must not invent or hard-code the final benchmark task set.

---

## Phase 7 — Shared SQLite and episode standard

This section is governed **verbatim** by `../CLONING/AUTONOMOUS_CLONE_BUILDING.md` §5.1–5.7: state authority and classification, the required state layers and their one-way lifecycle, schema and migration rules, base world and episode overlays, runtime reset and isolation, cross-app state, and the verifier boundary. None of it changes, and it is not restated here. Read it there.

Three additions bind the state contract to the model.

### 7.1 The schema is derived, not drafted

The incumbent protocol asks the planner for "draft domain entities" and the branch document for entities derived from live behaviour. Here `target-spec.json` already holds entities, fields, types, enums, relationships, and lifecycle states with evidence. The state contract's job is to turn that into clone-owned schema and ordered migrations, and to record for each entity the specification id it came from. A table that no specification entity maps to, or a specification entity with no table, is a state-contract failure — not a discretionary choice.

### 7.2 Every durable signature variable has a declared home

For each `fsm.json` signature variable with `backing: durable`, the state contract names the table, column, and row-selection key that variable reads from. This is the join that makes conformance checkable: a replay asserts a signature effect, and the assertion resolves to a SQL read. A `durable` variable with no declared home fails the gate; a variable that cannot be given one is either genuinely `transient` or the schema is missing something the product has.

### 7.3 The transition ledger is part of the state contract

Declare one append-only ledger table — the shape Airbnb's `state_events` already uses is the reference: actor, action, entity type, entity id, before-JSON, after-JSON, occurred-at on the frozen clock, and an episode-scoped sequence. Then:

- every `fsm.json` action whose `durable_effect.kind` is `write` names a `ledger.action` string, and the state contract maps that string to exactly one server-side write path;
- the ledger row is written **inside the same transaction** as the domain write, so a ledger row without its domain effect is impossible and a domain write without its ledger row is a bug rather than a race;
- the ledger is not answer-bearing. It records that a transition happened and what changed, never what should happen. Storing an expected value in it would put a task answer inside the agent image, which the non-hackability matrix's `HV1` and `HV11` exist to catch;
- the ledger is protected state for grading purposes: a verifier may read it, and an agent may not write to it except as the consequence of a real product action.

### 7.4 The seed is built to the declared budget

The **surface density budget** in [`../CLONING/HIGH_FIDELITY_WEBSITE_CLONING.md`](../CLONING/HIGH_FIDELITY_WEBSITE_CLONING.md) §1.4 governs the base world here exactly as it does on the incumbent branch. This protocol changes only where the budget is recorded and when it is checked: `target-spec.json` carries a `density` block per page and a `seed_density` per entity, so the budget is a validated artifact before the seed builder is written rather than a property discovered by looking at the finished clone.

The state contract therefore names, for every page-level collection floor, the query that populates it and the fixture source that supplies the rows. A floor with no builder behind it is a number nobody is going to meet.

**Gate `STATE_CONTRACT_VALIDATED`** adds to the incumbent's requirements: entity-to-table coverage in both directions, a declared home for every durable signature variable, a ledger contract covering every write action in the FSM, and a builder path for every declared density floor.

---

## Phase 8 — Execute the selected implementation branch

### `ADOPT`

Follow [`OPEN_SOURCE_CLONE_ADOPTION.md`](./OPEN_SOURCE_CLONE_ADOPTION.md). If the selected candidate later violates a hard gate or adaptation ceases to be cheaper and safer than building from the model, quarantine only run-owned imported work and return to Phase 6. Preserve target-derived scope; the model does not shrink to fit a candidate.

### `REFERENCE_ONLY` or `GREENFIELD`

Follow [`SPEC_DRIVEN_IMPLEMENTATION.md`](./SPEC_DRIVEN_IMPLEMENTATION.md).

Both branches finish against the same conformance, state, fidelity, production-runtime, and audit gates. Adoption receives no fidelity discount and no conformance discount.

---

## Phase 9 — Model conformance

This phase has no counterpart in the incumbent protocol, and it is the phase that pays for the modelling.

The Conformance Engineer runs the harness specified in [`BEHAVIORAL_FSM.md`](./BEHAVIORAL_FSM.md) §6 against the running conformance build, in the run's claimed browser lane, and writes `conformance.json`. For every action in `fsm.json`:

1. materialize a fresh episode and drive the clone to the action's `from` state along a validated path;
2. assert every precondition holds in the observed state;
3. execute the `gui_procedure` exactly as declared;
4. read back the resulting state and compare it against `Apply(sigma, eff)` — the declared effect, and nothing beyond it;
5. for a `write` action, read the declared tables and assert the declared durable consequence and the ledger row;
6. re-execute the same procedure once more and assert the idempotency rule the specification declared;
7. for a `no-op` case, drive to a state where the precondition fails, execute the procedure, and assert the state did not change.

Then traverse: run the canonical traversal set from `model-validation.json` — every transition covered at least once, plus a shortest path to every declared goal — and assert each goal predicate becomes true exactly at its declared point and not before.

**Gate `MODEL_CONFORMANCE`.** Every Core-class action conformant; zero actions with an effect the clone produces but the model does not declare, and zero with an effect the model declares that the clone does not produce; every declared goal reached by its canonical traversal; every declared idempotency rule holding; unreached transitions enumerated with a reason and zero of them Core.

Three results are treated differently, and confusing them is how a conformance phase becomes theatre:

- **The clone is wrong.** Return to the Implementer. This is the ordinary case and the cheap one.
- **The model is wrong.** Return to the FSM Architect **with target evidence attached**. The model may be amended, the gate re-runs from Phase 5, and the amendment is recorded with its evidence. No evidence, no amendment.
- **The model is unfalsifiable here.** A surface declared `model_exempt` produces no conformance signal by design. Count exempt surfaces and their share of Core scope in `conformance.json`; a run whose Core scope is mostly exempt has not been validated by this protocol and must say so in the final report rather than inheriting the gate's authority.

An extra effect the clone produces that the model does not declare is the most valuable finding this phase generates, and the easiest to wave away. It means one of two things: the implementation has a side effect nobody intended, which is a determinism and reward-hacking risk; or the target has behaviour the model missed, which is a fidelity gap the incumbent protocol's sweep would very likely never have found. Both are Major until diagnosed.

---

## Phase 10 — State hardening and Harbor-ready environment boundary

Governed by `../CLONING/AUTONOMOUS_CLONE_BUILDING.md` §5.8 (the survival-critical test budget) and §7 (the Harbor composition seam), unchanged and not restated. Apply the maximum default release gate exactly as written there: destructive output-path protection; deterministic fresh reset after mutation; pristine reward 0 / oracle reward 1 / protected-state mutation forcing failure where released tasks exist; one controller test per released task; one reactive-trigger test where premature delivery would destroy causal structure; and a production image build with one real container smoke per declared topology.

Two additions, both narrow, and both chosen to stay inside that budget rather than to grow it:

- **The graded-profile check is survival-critical.** A graded image containing selector attributes is an environment that hands a screen-driven agent grounding the real product does not offer, which silently invalidates every capability number measured on it. One check: build the graded profile, assert zero occurrences of the selector attribute in served markup and bundles, and assert the two profiles are otherwise identical.
- **Conformance is re-runnable, not a one-time gate.** The harness and `fsm.json` ship inside the clone at `clones/<name>/environment/`, so a future change to the clone can be checked against the model it claims to implement. This is the OpenComputer observation applied locally: a checker that evolves with the environment is worth more than a checker that graded it once.

Do not add tests that merely restate constants, inspect file layout, duplicate verifier assertions, snapshot pixels, or probe speculative edge cases. In particular, do not convert every FSM transition into a permanent unit test: the conformance harness already covers the transition set as one runnable artifact, and duplicating it as hundreds of test files is exactly the bloat the survival-critical budget exists to prevent.

---

## Phase 11 — Independent release audit

Use a fresh sub-agent when delegation is available. Otherwise freeze implementation evidence, switch to the Independent Auditor hat, and audit read-only. The auditor does not repair findings.

The repeatable instrument is [`../AUDITING/CLONE_QUALITY_AUDIT.md`](../AUDITING/CLONE_QUALITY_AUDIT.md), used **unchanged** — same thirty criteria, same four pillars, same six gates, same renderer. A protocol does not get to write its own grader: the audit exists to be an outside standard, and a clone built under this folder is held to exactly the standard every other clone in the workspace is held to.

Audit the incumbent protocol's full Phase 8 gate table — Research, Plan, Provenance, Build, Runtime, State, Reset, Fidelity, Assets, Affordances, Harbor, Cross-app, Leakage, Registration — with its evidence requirements verbatim, including the rule that **Fidelity evidence must come from a live side-by-side comparison driven in the run's claimed browser lane**, and that static source reasoning, HTTP status probes, and route sampling satisfy it at no severity.

Then audit these additional gates:

| Gate | Required evidence |
|---|---|
| Spec | `target-spec.json` validates; entity/operation/page coverage complete; assumptions register present with risks; no Core item on level-C evidence |
| FSM | `fsm.json` validates; scope closure holds as a graph property; every durable signature variable has a declared home; goals are predicates over durable state |
| Model truthfulness | A sampled re-observation of the live target confirms a random subset of model nodes. **This is the gate the validator cannot supply.** Sample at least every Core page, every Core write action's precondition, and every enum vocabulary, and drive them on the target in the claimed lane. A model that validates structurally and was never re-checked against the target has not been audited for truthfulness, and the honest record is a recorded limit, not a pass |
| Conformance | `conformance.json` complete; every Core action replayed; zero undeclared effects; exempt surfaces counted with their Core share |
| Breadth | Every node in `surface-inventory.json` is present in the clone or excluded with a treatment; panes and subpanes are nodes in their own right; static nodes are built and compared even though they carry no transition. **A model that is internally complete is not evidence of breadth — the inventory is, and it is the artifact to audit against** |
| Assets | `assets.json` complete; every retained visual asset exact-scraped or listed in `NEEDED_FROM_HUMAN.md`; **zero emoji, icon-pack glyphs, letter avatars, AI imagery, or named colour blocks standing in for target media**; inline SVG chrome not missed by an image-only scrape. A report claiming zero fabricated stand-ins while any of the above ships is a false release claim |
| Depth | Every retained surface meets its control-parity bar against the target's equivalent surface — 90% Core, 75% Supporting — and renders every card the target renders. **Any retained route with zero interactive controls fails outright and is not scored: it is a dead end wearing a heading.** Counts are taken on the same basis on both sides, in the main region at the declared viewport. Governed by [`../CLONING/HIGH_FIDELITY_WEBSITE_CLONING.md`](../CLONING/HIGH_FIDELITY_WEBSITE_CLONING.md) §1.4 |
| Density | Every retained collection surface meets the floor declared in `target-spec.json`, or is a recorded `declared_empty`; filters, sorts, tabs and facets each include and exclude at least one row; every lifecycle state instantiated, and more than once where a Core workflow acts on it; declared fan-out met; no numbered-placeholder content. **Evidence is a live sweep in the run's claimed lane at the declared viewport with rendered row counts, not a row count from SQL.** A surface can be full in the database and empty on screen |
| Ledger | Every write action produces its declared ledger row in the same transaction; ledger carries no answer-bearing values; ledger unwritable by the agent except through product actions |
| Graded profile | Graded image contains zero selector attributes; profiles otherwise identical |
| Model drift | The installed `clones/<name>/environment/` model contracts hash-match the accepted run artifacts |

The auditor records every check it could not perform in an explicit `limits` list, and **a recorded limit that names the subject of a gate invalidates that gate's `PASS`.** An auditor that did not drive the browser has not audited Fidelity, Affordances, Model truthfulness, or the UI half of State, regardless of what it inferred from source, schema, or the model. The coordinator reconciles `limits` against `gates` before any terminal transition and rejects the audit on contradiction.

An unrun gate is never a documented exception. `READY_WITH_DOCUMENTED_EXCEPTIONS` covers a Minor discrepancy that was measured and a Supporting/Shell-only evidence limitation scoped in `plan.json` — never a gate whose measurement did not happen.

Any audit failure returns to the relevant phase, then requires a new independent audit. If materially distinct repair strategies make no measurable progress, transition once through replanning; if evidence then establishes the gate is infeasible, end as `TERMINAL_INCOMPLETE`.

---

## Failure, retry, and autonomy policy

The incumbent policy applies in full: inspect actual state before retrying; change strategy after three materially identical failures; diagnose the seam after three fidelity passes with the same discrepancy; one narrowed retry per failed worker before the coordinator assumes the role; a failed OSS candidate returns to replanning; record an evidence level per retained state and never present B or C as direct observation; unclear licensing rejects a candidate while unclear asset retrieval goes to `NEEDED_FROM_HUMAN.md` rather than to fabrication; missing credentials or hosted services trigger a local alternative, not a user design question; an unrecoverable non-authentication infrastructure failure ends truthfully as `TERMINAL_INCOMPLETE`.

Four additions specific to modelling, each of which exists because it is a way this protocol can fail quietly:

- **Model churn is a signal, not a cost of doing business.** After three revisions of the same FSM region, stop revising and go back to the target. Repeated structural failure in one region almost always means the region was modelled from inference rather than observation.
- **Never edit the model to make a replay pass.** This is the single most dangerous available shortcut, because it produces a clone that conforms perfectly to a model of itself. Every amendment carries target evidence and re-runs the FSM gate.
- **Do not model what you have not seen.** A surface reachable only behind an unsafe write, an unavailable role, or an expired session is modelled at evidence level B from documentation or capture, and a Core surface that would need level C ends the run as `TERMINAL_INCOMPLETE` rather than being guessed into the FSM. A confident invented transition is worse than an admitted gap, because the gap is visible and the invention is not.
- **Do not force the abstraction.** A rich-text editor, freehand canvas, drag-ordered board, media scrubber, or real-time feed that does not reduce to a small variable assignment is declared `model_exempt` with a reason. Modelling it badly produces a validator that is precise about the wrong thing, which is worse than no model of that surface at all.

---

## Completion states and final report

Valid terminal states are `COMPLETE`, `READY_WITH_DOCUMENTED_EXCEPTIONS`, and `TERMINAL_INCOMPLETE`, defined exactly as in the incumbent protocol.

The coordinator's final report must include everything the incumbent report requires — target, clone path, execution mode, branch, adopted repository/commit/license or the evidence-backed no-adoption result, included and excluded scope, stack, commands, port, database and frozen-clock contracts, Harbor and cross-app boundary, routes and inventory implemented and verified, production build and survival-critical gate and reset and offline-runtime and artifact and audit results, discrepancies and exact terminal status, the asset outcome with the path to `NEEDED_FROM_HUMAN.md`, and paths to preserved run evidence — plus:

- specification and FSM versions with their digests, and the number of proposer/validator/improver iterations each took to validate;
- model size: pages, signature variables, actions, durable-write actions, declared goals, bounded reachable-state count and whether the bound was hit;
- evidence distribution across model nodes (A/B/C) and the count of Core nodes above level A;
- the assumptions register count, and which assumptions remain open at release;
- conformance results: actions replayed, conformant, non-conformant, unreached with reasons, undeclared effects found, exempt surfaces and their Core share;
- model-truthfulness sampling: what was re-observed on the target, and what was not;
- graded-profile check result;
- where the model contracts were installed inside the clone.

Do not claim full fidelity, model conformance, deterministic reset, Harbor readiness, or successful adoption without the corresponding recorded evidence. In particular, do not report a validated model as a truthful one: `validate_model.py` proves coherence, and only re-observation proves correspondence.
