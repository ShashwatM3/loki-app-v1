# Research basis, attribution, and the architecture delta

## Why this folder exists at all

`../CLONING/` works. Six clones came out of it, one of them — Canvas — with 142 exact-scraped assets, 25 retained surfaces, and an empty `limits` array on its release audit. Nothing here claims it is broken. What this folder claims is narrower: the incumbent protocol carries the clone's **behaviour** only as prose and code, so every question about behaviour has to be answered by looking at the running clone, and no question about behaviour can be answered exhaustively.

That single property is the source of three costs the incumbent pays repeatedly. Fidelity is established surface by surface through side-by-side comparison, which is linear in surfaces and never provably complete. "Every included affordance works" is a sweep, so it is evidence about the controls somebody remembered to click. And when a task author arrives months later, the transition structure of the product has to be re-derived by reading the application, which is why the workspace's own measurement found twelve generated task families whose graded structure never varies and ten schema tables no grader ever reads.

The two papers below independently arrived at the same fix from the opposite direction: they were **generating** websites rather than cloning them, and both found that the generation only becomes reliable and verifiable once an explicit machine-readable model of the site exists before the code does. This folder takes that fix and points it at a real target.

---

## The two sources

### InfiniteWeb — Scalable Web Environment Synthesis for GUI Agent Training

Zhang, Wang, Zhang, Guo, Li, Li, Lu. <https://arxiv.org/abs/2601.04126>

What it contributes, in its own terms: a **unified specification** — data models, programming interfaces, page architecture — authored as structured JSON before any page is written, so that many interconnected pages stay mutually consistent instead of each being independently plausible; **task-centric test-driven development**, in which tests and implementation are generated in parallel from shared pre-generated data and then iterated until the tests pass; a **design-guided frontend** that extracts a global style constraint (colour system, typography hierarchy, spacing, component styling) from a reference image before page realisation; and **automatic evaluator generation** built on two variable classes, existing application state and deliberately added *instrumentation variables*, which is what lets an evaluator return a dense 0.0–1.0 signal instead of a binary one.

The numbers worth carrying: 85.6% functional correctness on WebGen-Bench against 80.8% for Codex and 75.8% for Claude-Code; removing the test-driven loop costs 5.0 points; dense reward produces 4.4x more discriminative tasks than binary (767 against 174); about \$1.93 and twenty minutes per website.

The reason the specification matters more than the numbers: the paper's own framing is that an LLM writes one good page easily and a coherent multi-page application badly, and that the incoherence is an *interface* problem — pages disagree about entities, parameters, and routing. A unified specification is not documentation, it is the thing that makes page nine consistent with page one.

### AutoWebWorld — Synthesizing Infinite Verifiable Web Environments via Finite State Machines

Wu, Peng, Chen, Ruan, Zhuang, Yang, Zhang, Chen, Tseng, Yu, Chen, Zhai, Liu, Wu, Luo. <https://arxiv.org/abs/2602.14296>

What it contributes: modelling the environment as an explicit FSM, formalised as `M = <S, A, T, O>` where a state is a pair `s = (p, sigma)` of page identifier and **page signature** — a structured variable assignment covering query text, filters, pagination, form fields, cart contents. Actions carry a boolean precondition `pre(s, a)`; a failed precondition is a no-op; a satisfied one applies deterministic, local effects. A multi-agent proposer/validator/improver loop generates the FSM and the validator performs *structural* checks — reachability of terminal pages, preconditions referencing only signature paths, deterministic and local effects, well-defined navigation, pagination resets. Every interactable component gets a pre-assigned DOM selector that the generated site must implement verbatim, which is the bridge from an abstract FSM path to a concrete GUI operation. Trajectories then come from BFS over the state graph, are replayed through Playwright, and are accepted only if every atomic operation executes.

The numbers worth carrying: 29 environments, 11,663 verified trajectories at \$0.04 each against \$0.15–\$1.00 for real-world collection, mean trajectory length 21.94 steps against 6.9–12.1 for real-world datasets, and a 7B agent trained on 16K synthetic steps beating baselines trained on 350K–1M.

The reason the FSM matters more than the numbers: the paper's stated problem is that on real websites "the underlying state transitions are hidden," which forces you to buy step-level correctness from an external judge. Writing the transitions down converts verification from a judgment into an arithmetic check that costs nothing per trajectory.

---

## What was adopted, what was refused, and why

A clone is not a synthesised website, and most of the adaptation work is in that gap. Both papers are free to invent a product; we are bound to an observed one. Each row below is a deliberate departure, and the departures are more load-bearing than the adoptions.

| Paper mechanism | Status here | Reason |
|---|---|---|
| Unified specification (entities, operations, page architecture) | **Adopted** as `target-spec.json` | Same coherence problem, worse: a clone must be consistent with a target as well as with itself. |
| Specification generated from a seed description | **Refused.** It is *extracted* from target evidence | A generated spec is a hypothesis about a product we can go and look at. Every field carries an evidence reference and an A/B/C level; a field with no target evidence is logged as an explicit assumption. |
| Reference design image drives visual style | **Refused as authority, kept as ordering** | The incumbent's exact-asset scrape and live side-by-side comparison are stronger than a style token extraction, and they stay. What is adopted is only the *sequencing* insight: fix the global visual system before per-page realisation instead of rediscovering it per page. |
| Task-centric TDD — only the target tasks need to be correct | **Adopted, with the driver replaced** | "Only the task paths work" contradicts the workspace's environment-first invariant. So the tests that drive development are the FSM's own canonical traversals — every transition covered at least once, plus a shortest path to each declared goal — not a guessed benchmark task set. |
| FSM `M = <S, A, T, O>`, state as (page, signature) | **Adopted** as `fsm.json` | This is the artifact the incumbent protocol is missing. |
| Signature variables held in the page/browser | **Refused.** Every variable declares `backing: durable` with table and column, or `backing: transient` | SQLite is authoritative here; a signature is a *view* over authoritative state, never the store. InfiniteWeb writes to `localStorage`; that would violate invariant 4 of the incumbent protocol and make every graded fact unreadable by a verifier. |
| Instrumentation variables in `localStorage` for dense reward | **Adopted, relocated** to a durable transition ledger in SQLite | This is the highest-value transposition in the folder. The workspace already found that its graders read the endpoint and that provisional-then-retracted behaviour is invisible in the endpoint. A ledger row per durable transition makes exactly that behaviour queryable from the collected artifact. |
| Goal predicate as `p in terminal_pages` | **Refused.** Goals are predicates over durable state | Reaching a confirmation page is not the same as having booked. Page identity is a click path by another name. |
| Pre-assigned DOM selectors implemented verbatim | **Adopted, with a two-profile build** | A clone's markup belongs to the target, so selectors are *additive* `data-fsm` attributes. Because such an attribute is a grounding aid the real target does not offer, the graded image is built with them stripped and the conformance harness runs the otherwise-identical conformance build. See `BEHAVIORAL_FSM.md`. |
| Proposer / validator / improver loop with structural checks | **Adopted**, and the checks are executable in `validate_model.py` | A validator whose checks are prose is a checklist; the incumbent protocol already suffers from gates asserted rather than run. |
| BFS enumeration of trajectories, Playwright replay filtering | **Adopted** as the conformance harness | This is what turns "no dead affordances" from a sweep into an enumeration. |
| Synthetic mock data behind the UI | **Refused** | The base world comes from the incumbent's seed/episode lifecycle unchanged. |

Two mechanisms from the workspace's own prior research are also folded in rather than reinvented, because `../../cua_environment_approaches_comparison.md` already argues for them: CUA-Gym's discipline of co-generating instruction, initial state, golden state and reward as one rejectable tuple, which is why `fsm.json` goals and the state contract are validated together rather than in sequence; and OpenComputer's finding that evolving state checkers moved human agreement from 85.2% to 94.1%, which is why the conformance harness is a permanent artifact of the clone rather than a build-time scaffold.

---

## Original against revised — where the two protocols actually differ

Everything not in this table is deliberately identical, including the browser-lane discipline, the asset-scrape protocol, the `NEEDED_FROM_HUMAN.md` standard, the SQLite and episode lifecycle, the survival-critical test budget, and the audit rubric. The shared surface is deliberately much larger than the delta: this folder reorders a clone build and adds two artifacts to it, and reopens nothing else.

| Dimension | `../CLONING/` | `./` (model-first) |
|---|---|---|
| Behaviour representation | Prose in `plan.json` plus the implementation itself | `fsm.json`: pages, signatures, actions, preconditions, effects, goals |
| Domain representation | "Draft domain entities" inside `plan.json`, then schema written in Phase 1 of the branch | `target-spec.json` validated before planning; schema derived from it |
| Ordering | Research → plan → state contract → implement → compare | Research → **spec** → **FSM** → plan → state contract → implement → **conform** → compare |
| What freezes scope | The planner's prose classification into Core / Supporting / Shell-only / Excluded | The same classification, carried on FSM nodes, with closure checked as a graph property by a validator |
| Unit of implementation work | A vertical slice named in `plan.json`, roughly a page or a workflow | An FSM transition: precondition state, GUI procedure, signature effect, durable consequence |
| Definition of "affordance works" | A live control sweep found no dead control | Every declared transition replayed produces its declared effect; unreached transitions are enumerable |
| Interaction-state coverage | Recursive reconnaissance until no new state appears — bounded by attention | BFS over the state graph — bounded by the model, and the bound is visible |
| Dead-affordance detection | Observation | Graph validation before code exists, then replay after |
| Independent roles added | — | Specification Architect, FSM Architect, Conformance Engineer |
| New gates | — | `SPEC_VALIDATED`, `FSM_VALIDATED`, `MODEL_CONFORMANCE` |
| Downstream task yield | Task author re-derives transitions from the app | Goals, checkpoints, and dense reward read directly off the FSM and the transition ledger |
| Executable checker shipped with the protocol | `AUDITING/selftest.py` for the report layout only | `validate_model.py` for the model itself |

---

## The honest case against this folder

A protocol document that only argues for itself is not worth following. Each of these risks is real, and a run that hits one should recognise it rather than rediscover it.

**Modelling can be confidently wrong.** The papers' FSM is correct by construction — the site is generated from it. Ours is a hypothesis about somebody else's product, and a validator will happily certify a beautifully consistent model of a product that does not behave that way. Every structural check passes on an invented FSM. The only defence is the evidence discipline: A/B/C levels per node, zero C-level Core nodes, and assumptions logged rather than absorbed. If that discipline slips, this protocol produces a *more* confident wrong clone than a prose ordering would, because continuous comparison at least keeps bumping into the target.

**Front-loading costs wall clock before anything is visible.** The incumbent protocol has a rendered page to compare within its first slice. This protocol spends two gated phases producing JSON. If a run is interrupted, or if the target turns out to be shallower than expected, that investment is unrecovered.

**The model can drift from the implementation.** Two artifacts that must agree are two artifacts that can disagree. The conformance harness is the answer, but it is only an answer if it is actually run on every pass, which is exactly the failure the baseline's audit protocol already documents about gates asserted rather than measured.

**Selector attributes are a fidelity liability.** The two-profile build resolves it on paper. It adds a build path that must be proven byte-identical apart from the attributes, and an audit check that the graded image contains none. That is new surface for a new class of mistake.

**The signature abstraction may not fit every product.** A page signature is a natural fit for search, filters, pagination, forms, and carts. A rich-text editor, a canvas, a drag-ordered board, or a real-time feed does not reduce to a small variable assignment, and forcing it to will produce a model that is precise about the wrong things. `BEHAVIORAL_FSM.md` requires such surfaces to be declared `model_exempt` with a reason rather than modelled badly — but an exempt surface gets no conformance benefit, so a target that is mostly exempt is a target this protocol should not be used on.

---
