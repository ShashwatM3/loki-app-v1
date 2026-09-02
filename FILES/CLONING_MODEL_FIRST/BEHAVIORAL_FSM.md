# Behavioral FSM

## Entry contract

Enter from [`AUTONOMOUS_CLONE_BUILDING.md`](./AUTONOMOUS_CLONE_BUILDING.md) Phase 5, after gate `SPEC_VALIDATED`.

Required inputs: validated `target-spec.json`; the research evidence corpus; the authenticated session or the recorded reason there is none; the run's claimed browser lane. Produces `fsm.json` validated against [`schemas/fsm.schema.json`](./schemas/fsm.schema.json), the selector contract, and the conformance harness that Phase 9 runs.

Owner: the FSM Architect. Not the Implementer, and not the Conformance Engineer.

---

## 1. Why a state machine, and what it buys

The specification says what the product *has*. It says nothing about what the product *does* — which action is available when, what it changes, and what becomes true afterwards. In the incumbent protocol that knowledge lives in prose and then in code, which has one consequence that shapes everything downstream: **every question about behaviour has to be answered by looking at the running clone, and no question about behaviour can be answered exhaustively.**

AutoWebWorld's framing of the underlying problem is worth quoting because it is exactly our situation with the roles reversed: on real websites "the underlying state transitions are hidden," which forces you to buy step-level correctness from an external judge. The paper's answer is to write the transitions down. Ours is the same answer applied to a target we did not design: write down what we observed the target's transitions to be, then check that the clone implements them.

Four things become possible that were not, and each is a direct answer to a cost the incumbent protocol pays:

**Scope closure becomes a graph property.** The incumbent asks a planner to certify in prose that no Core or Supporting path ends at an inert element. Here that is reachability, dangling-edge, and orphan-node checking, run by a script before any code exists.

**"Every affordance works" becomes enumerable.** A control sweep is evidence about the controls somebody remembered to click. A transition set replayed is evidence about a set whose membership is written down, and whose unreached members are listed by name.

**Interaction-produced states stop depending on attention.** The incumbent explores recursively "until the retained interaction graph is exhausted," which is a real instruction bounded by a real limit. BFS over a declared state graph is bounded by the model, and when the bound is hit the script says so.

**Task authoring inherits structure instead of re-deriving it.** Goals, checkpoints, and dense reward read off the FSM and the ledger. The workspace measured what the alternative costs: twelve generated task families whose graded structure never varies across sixty seeds or seven difficulty settings, five grading questions on average against twenty-two for the hand-written long-horizon tasks, and ten schema tables no grader ever reads.

And one thing becomes newly dangerous, which is why §6 exists: a model can be perfectly coherent and simply not be the target's behaviour. The papers do not have this problem — their site is generated from the FSM, so the FSM is true by construction. Ours is a hypothesis, and a validator cannot tell a well-observed model from a well-invented one.

---

## 2. The formalism

AutoWebWorld's tuple, adopted directly: `M = <S, A, T, O>` where `S` is the internal semantic state space, `A` the executable action space, `T` a deterministic transition function, and `O` the map from internal state to what the agent observes.

### 2.1 State

A state is a pair `s = (p, sigma)`: the current page identifier and the **page signature**, a structured variable assignment. The paper's examples are the right ones — query text, filters, sort order, pagination, form fields, cart contents. A signature is not the whole world; it is the controllable configuration and task context of the page the agent is standing on.

Keep signatures **minimal** and **stable**. Minimal because every declared variable multiplies the state space and has to be conformance-checked; stable because states are deduplicated by `hash(sigma)` during traversal and an unstable serialization makes two identical states look different. A variable earns its place by gating an action, changing what is rendered in a way an action depends on, or being the thing a goal predicate reads.

### 2.2 The one departure that matters: durable and transient backing

The source paper's signature lives in the page. Ours cannot: SQLite is authoritative here, and a durable outcome held in browser state would violate the workspace's fourth invariant and be unreadable to a verifier. So **every signature variable declares its backing**:

~~~json
"selected_status": {
  "type": "enum",
  "domain": ["all", "confirmed", "cancelled"],
  "default": "all",
  "backing": { "kind": "transient" },
  "evidence": { "level": "A", "ref": "evidence/target/trips-filter.png", "observed_at": "2026-08-30T11:04:00Z" }
},
"reservation_status": {
  "type": "enum",
  "domain": ["pending", "confirmed", "cancelled", "completed"],
  "default": "confirmed",
  "backing": { "kind": "durable", "table": "reservations", "column": "status", "key": "$.selected_reservation_id" },
  "evidence": { "level": "A", "ref": "evidence/target/api/reservation-show.json", "observed_at": "2026-08-30T11:11:00Z" }
}
~~~

A signature is therefore a **view over authoritative state plus presentation context**, never a store. The consequence is the one that makes conformance possible: asserting a durable effect resolves to a SQL read, so a replay checks the database rather than believing the screen. The research question from Phase 2 — *did the change survive a reload?* — is precisely the question that classifies a variable here, which is why it was asked at every control while the browser was already on the target.

Two rules follow. No durable outcome may depend on a `transient` variable. And every `durable` variable must be given a declared home in the Phase 7 state contract — table, column, and row-selection key — or the state-contract gate fails.

### 2.3 Action

An action is one atomic thing the agent can do, carrying:

- `from` — the page it is available on, and it appears in exactly that page's `actions` list;
- `preconditions` — constraints on the current signature, evaluated as `pre(s, a) in {0, 1}`. **A failed precondition is a no-op**, `s' = s`. This is the paper's semantics and it is also a fidelity claim: a disabled button that does nothing is a state the target has, and the clone must have it too;
- `effects` — deterministic, local updates applied only when preconditions hold, as `Apply(sigma, eff(s, a))`;
- `is_navigation` and `to_page_id` — for a cross-page transition the destination signature is `Init(p') merged with Carry(sigma')`: defaults first, then same-named variables carried over;
- `durable_effect` — `none`, or a `write` naming the specification operation, the tables touched, the idempotency rule, and the `ledger.action` string;
- `gui_procedure` — the executable sequence of atomic operations that performs it;
- `observable_result` — one sentence naming what an agent can see that tells it the action landed. An action with no observable result is a grounding defect, because an agent cannot know it succeeded;
- `evidence` — level and reference, as everywhere.

Atomic operation vocabulary, from the source paper: `click`, `hover`, `type_text`, `scroll_until_visible`, plus `press_key` and `select_option` which our targets need. Nothing outside this set, and nothing outside the harness action space declared in the audit rubric's defaults — an action requiring drag physics or a native file dialog is a `D4` reachability failure waiting to happen, and if the target genuinely requires it, the surface is `model_exempt` and the fact is reported rather than hidden.

### 2.4 Goal

A goal is an id, a description, and a predicate. **Predicates are over durable state, never over page identity.** This is a deliberate refusal of the source paper's usual form, `G(s) = 1[p in terminal_pages]`: reaching a confirmation page is not the same as having booked, and grading page arrival is grading a click path under another name — which the workspace's whole verifier discipline exists to avoid.

A predicate is a list of clauses, each naming a table, a row selection, a column, an operator, and an expected value, plus optional exclusion clauses asserting that surplus rows do not exist. Exclusions are not optional in spirit: the workspace's own doctrine is that `{x, t, z}` passes and `{x, t, z, w}` fails, and a goal predicate with no exclusion clause cannot tell those apart.

### 2.5 Model exemption

A surface that does not reduce to a small variable assignment is declared exempt rather than modelled badly:

~~~json
"model_exempt": { "reason": "Freehand annotation canvas; state is a stroke list with no product-visible discrete configuration.", "fidelity_treatment": "Compared and behaviourally verified by the incumbent side-by-side loop; no conformance signal." }
~~~

Rich-text editors, freehand canvases, drag-ordered boards, media scrubbers, and real-time feeds are the usual candidates. An exempt surface gets no conformance benefit and must still pass the ordinary fidelity gates. Count exempt surfaces and their share of Core scope: a target whose Core scope is mostly exempt is a target this protocol should not have been used on, and the run must say so rather than reporting a conformance gate that covered a fraction of the work.

---

## 3. Extraction procedure

The papers *generate* an FSM from a theme. We *extract* one from a target, and the order below exists to keep inference out of it for as long as possible.

**3.1 Pages from the specification.** Every specification page becomes an FSM page with its route, scope class, and actor roles. This is mechanical and it is also the first cross-reference check: a page in one artifact and not the other is a defect in whichever was written second.

**3.2 Signature variables from observed controls.** For each page, walk the research interaction inventory. Every control that changes what is rendered implies either a signature variable or an action, and often both — a filter dropdown is an action that assigns a variable. For each candidate variable, record type, domain, default, and the reload answer that fixes its backing. Prefer a narrow domain that you observed over a wide one that seems natural; a filter whose observed values are three of an unknown set is recorded with three values and an assumption, not with a guess at the rest.

**3.3 Actions from affordances.** Every affordance in the retained scope becomes an action, including the ones that only navigate. For each: which page, what precondition made it available or unavailable when observed, what changed, whether the change survived a reload, and what the user could see afterwards. Disabled states observed on the target are gold — they are direct evidence of a precondition, and they are the part of a product that clone builds most reliably omit.

**3.4 Durable effects from specification operations.** Each write action names exactly one specification operation, inherits its idempotency rule, and carries its `ledger.action`. An action whose write cannot be tied to a declared operation means the specification is missing an operation; go back and add it rather than inventing an untracked write here.

**3.5 Goals from product completions, not from tasks.** Declare a goal for each *product* completion the scope supports — a booking exists, a listing is published, an order is fulfilled and its inventory decremented. Do not declare goals for the benchmark tasks you imagine; the environment must be reusable before tasks exist, and a goal set shaped by a guessed task set bakes that guess into the clone's contract. Goals are the reusable skeleton a future task author picks a subgraph from.

**3.6 Selectors, assigned here.** Assign a unique selector to every action before any code exists. §5.1 covers the contract.

**3.7 Validate, revise, repeat.** Run the validator; fix what it names; run it again. Log each iteration in the run trace with what failed.

---

## 4. Structural validation

One script owns both artifacts:

~~~bash
python3 FILES/PROTOCOLS/CLONING_MODEL_FIRST/validate_model.py \
  --spec <run>/target-spec.json \
  --fsm  <run>/fsm.json \
  --out  <run>/model-validation.json
~~~

Standard library only, exits non-zero on any error, and writes errors, warnings, and structural metrics. A warning does not block the gate; an error does. The checks:

**Specification checks (S-series).** `S15` through `S17` are the surface density budget, checkable before a single row exists.

| ID | Check |
|---|---|
| `S1` | Entity names unique; each has exactly one primary-key field and an owning table |
| `S2` | Field types drawn from the allowed set; enum fields declare a non-empty domain |
| `S3` | Relationships name existing entities and an existing carrying field on one of them |
| `S4` | Operation ids unique and in `noun.verb` form; each declares kind, reads, and writes |
| `S5` | Every operation parameter declares `source` of `user` or `system` |
| `S6` | Every write operation declares an idempotency rule and a `ledger_action` |
| `S7` | `ledger_action` values unique across write operations |
| `S8` | Operation `reads`/`writes` name existing entities |
| `S9` | Page ids unique; each declares route, scope class, and operations that exist |
| `S10` | Every outgoing navigation and chrome link resolves to an existing page or a declared boundary |
| `S11` | Every entity, field, operation, and page carries an evidence level in {A,B,C} and a reference |
| `S12` | No Core-scoped page, and no entity or operation reachable only from Core pages, at evidence level C |
| `S13` | Clock block declares frozen now, timezone, locale, currency; assumptions register present |
| `S14` | Every entity declares seed density with the capability it serves |
| `S15` | Every page declares a `density` array — possibly empty — or `declared_empty` with a reason |
| `S16` | Every declared collection names an existing entity and a valid surface kind; `min_rows` meets the derived floor or carries an override reason; a paginating surface carries at least two full pages plus a partial third |
| `S17` | Each entity's `seed_density` amount can satisfy the highest page floor that reads it |

**FSM checks (F-series).**

| ID | Check |
|---|---|
| `F1` | Page ids unique; every `from` and `to_page_id` names an existing page |
| `F2` | Every action listed by a page exists, and its `from` equals that page |
| `F3` | Every action is listed by exactly one page — no orphans, no duplicates |
| `F4` | Every page reachable from `meta.initial_page_id` through navigation edges |
| `F5` | Every declared goal reachable: some traversal satisfies its predicate's write actions |
| `F6` | Precondition paths start with `$.` and resolve to a variable declared on the action's `from` page |
| `F7` | Effect paths resolve to a variable declared on the page the effect applies to — `from` for intra-page, destination or carried for navigation |
| `F8` | Effects are local and deterministic: no effect value is a function of unmodelled input; no effect writes an undeclared path |
| `F9` | Every signature variable declares type, default, and `backing` of `durable` with table/column/key, or `transient` |
| `F10` | No goal predicate and no `durable_effect` depends on a `transient` variable |
| `F11` | Every action has a non-empty `gui_procedure` using only allowed atomic ops |
| `F12` | Selector values globally unique; every `gui_procedure` op that needs a selector has one |
| `F13` | No ambiguous pair: two actions on one page with equivalent preconditions and the same first selector |
| `F14` | Every `durable_effect.kind == "write"` names an existing specification operation, existing tables, an idempotency rule, and a `ledger.action` matching that operation's |
| `F15` | Every action declares a non-empty `observable_result` |
| `F16` | Pagination reset: any action whose effects touch a variable marked `result_set` also resets every variable marked `pagination` on the same page |
| `F17` | Every page, signature variable, and action carries evidence level and reference; no Core action or Core page at level C |
| `F18` | Goal predicates reference only durable tables and columns, and declare exclusion clauses |
| `F19` | Every action names a `boundary_treatment` when it leaves declared scope |
| `F20` | Exempt surfaces declare a reason and a fidelity treatment |
| `F21` | Every action is applicable in at least one state reachable within the declared traversal bounds |

**Cross-artifact checks (X-series).** `X6` is the one check the model cannot supply for itself, and it is worth understanding why. Every other check validates the model against its own contents, so a model covering six surfaces of a twenty-seven-surface product passes all of them — internal consistency is not breadth. Only an inventory produced independently, by reconnaissance, before the model existed, can say whether the model covers what the target actually has. It runs when `--inventory` is passed, and the Phase 5 gate passes it.

| ID | Check |
|---|---|
| `X0` | The two artifacts name the same clone, and the FSM's `spec_version` matches the specification's |
| `X1` | Specification pages and FSM pages are the same set |
| `X2` | Every specification write operation is referenced by at least one FSM action |
| `X3` | Every specification read operation is assigned to at least one FSM page |
| `X4` | Scope class agrees between the two artifacts for every page |
| `X5` | Every entity is touched by at least one operation referenced by at least one action, or is declared reference-only |
| `X6` | **Breadth.** Every node in `surface-inventory.json` carries a disposition of behavioural, static, excluded or exempt; behavioural nodes name a real FSM node; excluded nodes carry a boundary treatment; exempt nodes carry a reason. Warns where the FSM declares a page no inventory node maps to |

`F5` and `F21` are answered by enumeration rather than by inspection, so it is worth knowing what the enumeration actually does. The validator cannot walk the true state space — a free-text field has no finite domain — so it walks an abstraction: each variable's reachable value set is its default, plus every literal value an effect assigns to it, plus an opaque marker when a non-literal effect (increment, toggle, typed text) can move it. An opaque value satisfies any precondition, which makes the abstraction **conservative**: it will not report a transition unreachable that is actually reachable, and it may report one reachable that is not. Both `max_states` and `max_depth` are declared in `meta.traversal_bounds` and a `bound_hit` flag is published, because a bound quietly hit is a coverage claim quietly weakened.

Read `F21` carefully rather than as a formality. An action that no reachable state makes applicable is one of four things: an orphan the page list forgot, a precondition mis-typed against a value the domain never takes, a genuinely dead affordance already present in the model, or a bound too tight for a deep flow. The first three are exactly the defects the incumbent protocol finds by clicking, months later, if at all.

**Metrics written to `model-validation.json`.** Page count by scope class; signature-variable count and its durable/transient split; action count, navigation count, write-action count; mean and max out-degree; bounded reachable-state count with a `bound_hit` flag; the canonical traversal set — every action covered at least once, plus a shortest path to each goal — with its size and total step count; evidence distribution across all nodes; Core nodes above level A; exempt surface count and Core share; assumption count.

Those metrics are the model's shape. Record them as numbers in `model-validation.json`; do not summarise them in prose, because a later reader needs the counts rather than an impression of them.

---

## 5. The selector contract and the two build profiles

### 5.1 Pre-assigned selectors

The source paper's mechanism, adopted: every interactable component receives a unique DOM selector, pre-assigned in the FSM and implemented verbatim in the rendered DOM. This shared namespace is the deterministic bridge from an abstract path to a concrete GUI operation, and without it a replay has to *find* the control it wants, which reintroduces exactly the brittleness the model was supposed to remove.

Our form is additive: `data-fsm="<action_id>"` on the element the procedure targets. Additive because the markup belongs to the target — target classes, structure, roles, and accessible names are reproduced unchanged, and the attribute rides alongside. Never replace a target attribute with ours, and never let the attribute's presence change layout or styling.

### 5.2 Why the graded image cannot contain it

A `data-fsm="cancel_reservation"` attribute is a grounding aid the real product does not offer. An agent that reads the DOM finds a labelled map of every consequential action, which inflates its grounding accuracy for a reason that has nothing to do with its capability, and hands it an answer-shaped hint about which controls matter. That is `HV11` — task constants leaking into the environment — arriving through the front door.

So the clone builds two profiles:

| Profile | Contains selector attributes | Used by |
|---|---|---|
| `conformance` | Yes | The Phase 9 harness, and any later re-run of it |
| `graded` | No | Every episode image, every sweep, every published environment |

Requirements, all three checked at release:

- the graded build is produced by stripping the attribute, and is otherwise **byte-identical in served markup and bundles** to the conformance build;
- the graded image contains **zero** occurrences of the attribute name in served markup, bundles, or source maps;
- the harness refuses to run against a graded build rather than silently falling back to heuristic selectors — a fallback would turn a conformance failure into a passing run.

The stripping must be a build-time transform, not a runtime conditional. A runtime flag means the attribute exists in the bundle and one environment variable stands between the graded environment and a leak.

---

## 6. The conformance harness

The artifact Phase 9 runs and the clone keeps. It lives at `clones/<name>/environment/conformance/`, ships with `fsm.json`, and is re-runnable after any later change to the clone.

For each action:

~~~text
fresh episode → drive to `from` state along a validated path
→ assert every precondition holds in the observed state
→ execute `gui_procedure` exactly as declared
→ read back state; compare against Apply(sigma, eff) — the declared effect and nothing beyond it
→ for a write: assert the declared durable consequence and the ledger row
→ repeat once; assert the declared idempotency rule
→ drive to a precondition-failing state; execute; assert no-op
~~~

Then traverse the canonical set and assert each goal predicate becomes true exactly at its declared point and not before.

Three properties make it worth having rather than merely tidy.

**It fails on undeclared effects, not just missing ones.** Comparing the observed post-state against `Apply(sigma, eff)` catches a clone that does *more* than the model says. That is the most valuable finding the harness produces: either the implementation has an unintended side effect — a determinism and reward-hacking risk — or the target has behaviour the model missed, which is a fidelity gap a control sweep would almost never surface. Both are Major until diagnosed.

**It tests the no-op branch.** A disabled control that quietly acts is a fidelity defect and a grading hazard, and it is invisible to any procedure that only exercises the happy path.

**It is not a substitute for looking at the target.** Every assertion here is against the *model*. A conformant clone is a clone that does what we wrote down; whether what we wrote down is what the target does is settled only by the auditor's model-truthfulness sampling in Phase 11. Reporting conformance as fidelity is the central dishonesty available in this protocol, and the release report is required to keep the two numbers separate.

`conformance.json` records per action: id, scope class, path driven, preconditions asserted, procedure executed, observed effect, declared effect, verdict, durable consequence, ledger row, idempotency result, no-op result, and evidence path. Plus the run-level totals: replayed, conformant, non-conformant, unreached with reasons, undeclared effects, exempt surfaces and their Core share.

---

## 7. Gate `FSM_VALIDATED`

Freeze and checksum `fsm.json`, record its digest and version in `run.json`, and hand off to Phase 6.

- [ ] `validate_model.py --spec --fsm` exits zero; every F-series and X-series check passes
- [ ] Scope closure holds: all pages reachable, all goals reachable, no orphan action, every boundary treated
- [ ] Every signature variable classified `durable` with table/column/key, or `transient`
- [ ] No goal predicate or durable effect depends on a transient variable
- [ ] Every write action ties to a specification operation with a matching unique `ledger.action`
- [ ] Every action has a unique selector, a non-empty allowed-op procedure, and an observable result
- [ ] Goal predicates are over durable state and carry exclusion clauses
- [ ] Exempt surfaces declared with reason, treatment, and Core share
- [ ] Every node carries evidence level and reference; no Core node at level C
- [ ] Structural metrics and the canonical traversal set written to `model-validation.json`
- [ ] Conformance harness design recorded, including both build profiles and the graded-profile check

A model that passes all eleven is coherent, closed, and executable. Whether it is the target's model is a separate question with a separate gate, and this document deliberately cannot answer it.
