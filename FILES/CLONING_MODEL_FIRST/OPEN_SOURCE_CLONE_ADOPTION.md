# Open-Source Clone Adoption — model-first

## Entry contract

Enter only from [`AUTONOMOUS_CLONE_BUILDING.md`](./AUTONOMOUS_CLONE_BUILDING.md) Phase 8 when validated `research.json` and `plan.json` select `ADOPT`, and after gates `SPEC_VALIDATED`, `FSM_VALIDATED`, and `STATE_CONTRACT_VALIDATED`. The selected repository must already have passed every hard qualification gate, scored at least 75/100, and succeeded in a disposable build/start probe at an exact commit.

**The entire adoption mechanics of `../CLONING/OPEN_SOURCE_CLONE_ADOPTION.md` are inherited verbatim and are not restated here.** Read that document and follow it. Specifically inherited in full: its ten adoption invariants; Phase 1 quarantine revalidation, static execution audit, baseline replay, and last-responsible-adoption gate; Phase 2 clean attributable snapshot and `UPSTREAM.md` provenance record; Phase 3 clone boundary and runtime contract; Phase 4 persistence-surface inventory and SQLite seam; Phase 5 pruning ledger; Phase 6 base and episode state; Phase 8 Harbor packaging; and its future-upstream-update procedure.

This document contains only what changes when a validated model exists before the import. It is short on purpose: adoption is the branch where this protocol's delta is smallest, because the hard work of adoption is provenance, safety, and state authority, and none of those change.

---

## What the model changes

Four things, and one of them changes the branch decision itself.

**1. The gap inventory is a transition ledger, not a page ledger.**

The incumbent branch opens Phase 7 convergence with an upstream gap inventory keyed by "route/component/interaction". Here it is keyed by FSM node, and every row is one of the model's own actions:

| FSM action id | Upstream state at pinned commit | Current target state | Decision | Backing operation | Conformance |
|---|---|---|---|---|---|
| `<action_id>` | Present / partial / absent / different semantics | Directly observed truth | `KEEP` / `ADAPT` / `REPLACE` / `REMOVE` | Specification operation id | Not run → Conformant / Non-conformant |

The difference is not cosmetic. A page-keyed inventory asks "does this screen exist upstream," which upstream clones usually answer yes to, because pages are the cheap part. A transition-keyed inventory asks "does the upstream perform this state change, with this precondition, producing this durable consequence," which is where adoption cost actually lives. An upstream repository with thirty matching pages and four matching transitions looks excellent under the first question and is nearly worthless under the second.

**2. Coverage scoring in the branch decision gets a hard denominator.**

The entrypoint's Phase 6.1 requires counting candidate transitions satisfied against the FSM action set, and candidate entities against specification entities. Record both counts, with the FSM action count as the denominator, in `plan.json`'s rationale. This replaces a judgment about "current target coverage" with a ratio over a declared set — which is the whole reason for having a declared set.

Consequence worth stating plainly: **this protocol adopts less often than the incumbent.** A candidate that looks like the target and does not behave like it will score poorly here where it scored well before. That is the intended direction, and if a run finds itself wanting to relax the count to preserve an attractive candidate, the count is doing its job.

**3. Persistence-surface inventory joins the model rather than standing alone.**

The incumbent's Phase 4.1 traces every read and write and classifies each value as transient presentation, session identity, durable product state, simulator state, or external integration. Every one of those classifications now has a counterpart already declared: `fsm.json` says which signature variables are `durable` and which are `transient`, and the state contract says where each durable one lives.

So the inventory becomes a join with three outcomes rather than a fresh classification:

- **Agreement** — upstream holds durably what the model calls durable. Migrate the storage to SQLite behind the operation layer; the classification is settled.
- **Upstream holds in the browser what the model calls durable** — the common case, and the ordinary work of adoption. `localStorage`, IndexedDB, or component state becomes a specification operation writing SQLite plus its ledger row.
- **Upstream holds durably what the model calls transient** — the interesting case, and the one to stop at. Either the model missed a durable consequence the target actually has, which is a model-target divergence requiring target re-observation, or upstream persists something the target does not, which is upstream behaviour to remove rather than preserve. Do not resolve this by preferring whichever is cheaper.

**4. Selector attributes are additive to upstream markup too.**

Upstream components receive `data-fsm` attributes on the elements the model's GUI procedures target, under exactly the two-profile contract in `BEHAVIORAL_FSM.md` §5. Upstream's own classes, ids, test attributes, and structure are left alone: replacing an upstream test id with ours breaks upstream's tests for no gain, and replacing an upstream class breaks its styling.

---

## The adoption-specific model risk

One risk is unique to this branch, and it is the reason this document exists at all rather than being a paragraph in the entrypoint.

**Do not let the upstream repository become evidence for the model.** Reading upstream source is a fast, cheap, plausible way to fill in a precondition, an enum vocabulary, or a lifecycle transition the target never showed you. It is also almost always wrong in a way that is undetectable afterwards, because upstream is somebody's *interpretation* of the target, usually from an older version, and often simplified for a demo.

Upstream is `REFERENCE_ONLY` evidence — level C — for every model claim, without exception. A Core model node may not rest on level C, so a Core node whose only support is upstream source is not supported. Either observe it on the target, or record it as an assumption with its risk. The incumbent protocol's second invariant already says the live target is the fidelity authority and an open-source clone is only a substrate; this is that invariant applied to the model, where it is easiest to forget, because the substrate is right there and it is legible.

The inverse holds too, and it is a genuine benefit. Upstream source is excellent at *suggesting* model nodes to go and check: a status enum in an upstream migration is a strong hint about what to look for in a target API response. Use it as a search direction, never as a citation.

---

## Ordering inside the branch

Follow the inherited phases in their original order, with the model consumed at three points:

1. **Quarantine revalidation and baseline replay** — unchanged. Nothing about the model affects whether upstream is safe and reproducible.
2. **Import and provenance** — unchanged. `UPSTREAM.md` additionally records the FSM action-coverage ratio measured at the pinned commit, since that is the number the adoption decision rested on.
3. **Clone boundary** — the runtime contract additionally declares both build profiles and the paths where the model contracts and conformance harness will be installed.
4. **State authority** — the persistence inventory runs as the three-outcome join above; the SQLite seam implements specification operations and the ledger; the state contract's durable-variable homes are honoured rather than rediscovered.
5. **Pruning** — the pruning ledger gains one column: which FSM actions a removal affects. A removal that orphans a declared action is not a pruning decision, it is a scope change, and it goes back to Phase 5 with evidence. Preserve future task seams; the model already names them as goals.
6. **Base and episode state** — unchanged, except that the density floors come from `target-spec.json` rather than being decided at seed-writing time. The inherited branch's warning applies with full force here: upstream demo fixtures are built to make a README screenshot look good, not to populate the target's surfaces, so importing them and moving on produces a clone that is architecturally sound and visibly empty. The advantage this branch has is that the floors were declared and validated two phases earlier, so the gap between what upstream supplies and what the surfaces need is a number rather than an impression.
7. **Convergence** — run `SPEC_DRIVEN_IMPLEMENTATION.md` §5 through §8: the test-driven loop over canonical traversals, continuous side-by-side comparison against the live target, discrepancy classification including the three model-specific classes, and the coverage audit. Adoption receives no fidelity discount and no conformance discount.
8. **Harbor packaging** — unchanged, plus the graded-profile check.

---

## Adoption exit

Return to the coordinator with `implementation-evidence.json`, `surface-inventory.json` carrying `fsm_node_id` on every row, the clone runtime contract, `UPSTREAM.md`, the seed and episode manifests, and the installed model contracts. The coordinator then runs Phase 9 conformance and the Phase 11 independent audit.

Reproducible evidence is required for everything the inherited branch requires — provenance and license preservation, imported-tree verification, the pristine upstream baseline, the adapted production build and start, closed-network runtime, removal of hidden authorities and debug bypasses, durable UI-to-SQLite Core slices, and scoped fidelity with zero unresolved Critical or Major discrepancy — plus:

- the FSM action-coverage ratio at the pinned commit, and again after adaptation;
- the three-outcome persistence join, with every "upstream durable, model transient" case and how it resolved;
- every model amendment made during adoption, with the target evidence that justified it and a note confirming upstream source was not the evidence;
- pruning decisions that touched declared actions, and the scope amendments they triggered;
- both profiles' build results and the graded-profile attribute check.

If the candidate violates a hard gate at any point, or adaptation stops being cheaper and safer than building from the model, quarantine only run-owned imported work and return to Phase 6. The model does not shrink to preserve a candidate.
