# INDEX — model-first cloning protocol

This folder is a **variant** of [`../CLONING/`](../CLONING/), not a successor to it. Both build a high-fidelity, state-verifiable clone of a real product; they differ in one thing, and the difference is legible on purpose so the two can be compared.

The incumbent protocol carries the clone's behaviour as prose and code. This one carries it as two machine-readable artifacts produced and gated **before** implementation: a **target specification** — what the product stores, what operations it exposes, what pages reach them — and a **behavioural FSM** — which action is available in which state, what it changes, and what becomes durably true afterwards. Everything downstream then reads off those artifacts: the schema, the implementation order, the definition of a working affordance, the coverage claim, and the goals a future task author picks a subgraph from.

Both mechanisms are derived from published work — InfiniteWeb's unified specification and task-centric test-driven development, and AutoWebWorld's FSM formalism with its validate-revise loop and replay filtering — adapted for the case those papers do not have: we are cloning somebody else's product rather than generating our own, so every node in the model is a hypothesis that has to carry target evidence. Read [`RESEARCH_BASIS.md`](./RESEARCH_BASIS.md) first; it records the attribution, exactly what was adopted and what was refused, how this folder differs from the incumbent protocol, and the honest case against it.

## Files

| Path | Role |
|---|---|
| [`RESEARCH_BASIS.md`](./RESEARCH_BASIS.md) | Attribution, what was adopted and what was refused, the original-versus-revised architecture table, the risks, and the prediction the comparison tests. **Start here.** |
| [`AUTONOMOUS_CLONE_BUILDING.md`](./AUTONOMOUS_CLONE_BUILDING.md) | The entrypoint. Invocation, invariants, roles, twelve phases, gates, terminal states, and the final-report contract. |
| [`TARGET_MODEL_SPECIFICATION.md`](./TARGET_MODEL_SPECIFICATION.md) | Phase 4. How to extract entities, operations, page architecture, and the per-surface density budget from target evidence, and the evidence and assumption discipline that keeps extraction from becoming invention. |
| [`BEHAVIORAL_FSM.md`](./BEHAVIORAL_FSM.md) | Phase 5. The formalism, the durable/transient signature backing, goals as durable predicates, the structural check catalogue, the selector contract with its two build profiles, and the conformance harness. |
| [`SPEC_DRIVEN_IMPLEMENTATION.md`](./SPEC_DRIVEN_IMPLEMENTATION.md) | The from-scratch branch. Derived state foundation, the global visual system, the test-driven loop over canonical traversals, continuous side-by-side comparison, and the three model-specific discrepancy classes. |
| [`OPEN_SOURCE_CLONE_ADOPTION.md`](./OPEN_SOURCE_CLONE_ADOPTION.md) | The adoption branch. Inherits the incumbent adoption mechanics verbatim; contains only what a validated model changes, including the rule that upstream source is never evidence for the model. |
| [`BROWSER_AND_RUN_ISOLATION.md`](./BROWSER_AND_RUN_ISOLATION.md) | A binding stub. Lane discipline is held identical to the incumbent protocol and read from there. |
| [`validate_model.py`](./validate_model.py) | The executable validator: 17 specification checks including the surface density budget, 21 FSM checks, 7 cross-artifact checks including the independent breadth check, bounded state enumeration, and the canonical traversal set. Standard library only. |
| [`schemas/target-spec.schema.json`](./schemas/target-spec.schema.json) | Contract for `target-spec.json`. |
| [`schemas/fsm.schema.json`](./schemas/fsm.schema.json) | Contract for `fsm.json`. |
| [`examples/example.target-spec.json`](./examples/example.target-spec.json) | A small passing fixture — three pages, nine actions, one goal — for a fictional trips product. Read it before authoring a real one. |
| [`examples/example.fsm.json`](./examples/example.fsm.json) | The matching FSM fixture. |
| [`examples/example.surface-inventory.json`](./examples/example.surface-inventory.json) | The reconnaissance fixture the breadth check runs against: eleven nodes across all four dispositions, including three static nodes that carry no transition. |
| [`examples/example.model-validation.json`](./examples/example.model-validation.json) | Its validator output, including the structural metrics a run is required to report. |

## Running it

Invoke the protocol with one sentence and one URL:

> Follow the cloning protocol at `FILES/PROTOCOLS/CLONING_MODEL_FIRST/` and clone: `https://target.example`

Validate the model artifacts at the Phase 4 and Phase 5 gates:

~~~bash
python3 FILES/PROTOCOLS/CLONING_MODEL_FIRST/validate_model.py \
  --spec      <run>/target-spec.json \
  --fsm       <run>/fsm.json \
  --inventory <run>/surface-inventory.json \
  --out       <run>/model-validation.json

# and against the shipped fixture, to confirm the checker itself still works
python3 FILES/PROTOCOLS/CLONING_MODEL_FIRST/validate_model.py \
  --spec      FILES/PROTOCOLS/CLONING_MODEL_FIRST/examples/example.target-spec.json \
  --fsm       FILES/PROTOCOLS/CLONING_MODEL_FIRST/examples/example.fsm.json \
  --inventory FILES/PROTOCOLS/CLONING_MODEL_FIRST/examples/example.surface-inventory.json
~~~

Exit 0 means no errors. A warning never blocks a gate; an error always does, and the answer to an error is to revise the model, never to relax the check.

## What it inherits unchanged

Four bodies of rules are deliberately identical to [`../CLONING/`](../CLONING/) and are read from there rather than restated here: **browser and run isolation**, the **exact-asset scrape protocol and the `NEEDED_FROM_HUMAN.md` standard**, the **SQLite and episode state lifecycle with its survival-critical test budget**, and the **audit rubric** under [`../AUDITING/`](../AUDITING/).

That is not laziness, it is where the risk is. Those four are the most load-bearing and most safety-critical parts of the suite, they are already correct, and a second copy of any of them would drift. This folder changes the *ordering* of a clone build and adds two artifacts to it; it does not reopen settled questions about lanes, assets, state, or grading.

## What this protocol cannot do

`validate_model.py` proves a model is coherent, closed, and executable. It cannot prove the model describes the target — a fabricated FSM passes every structural check. That is why every node carries an evidence level, why no Core node may rest on level-C evidence, why anything unobserved goes into the assumptions register rather than into a field, and why the release audit carries a separate **model-truthfulness** gate answered only by re-observing the live target. Reporting conformance as fidelity is the central dishonesty this folder makes available, and the final report is required to keep the two numbers apart.
