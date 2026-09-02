# Target Model Specification

## Entry contract

Enter from [`AUTONOMOUS_CLONE_BUILDING.md`](./AUTONOMOUS_CLONE_BUILDING.md) Phase 4, after research is validated and — where the target is gated — after the authentication gate has produced a live session and the evidence sweep described in Phase 3 has run.

Required inputs: validated `research.json` with its evidence corpus; the authenticated session or the recorded reason there is none; the run's claimed browser lane; the run ledger path. Produces `target-spec.json`, validated against [`schemas/target-spec.schema.json`](./schemas/target-spec.schema.json).

Owner: the Specification Architect. In `delegated` mode this must not be the Implementer, for the reason given in the entrypoint's role table — an author who knows what they intend to build describes their intended build.

---

## What this artifact is, and what it is not

It is the answer to one question asked before any code exists: **what does this product store, what operations does it expose, and what pages exist to reach them?** Three parts, borrowed directly from InfiniteWeb's unified specification: data models, programming interfaces, page architecture.

The reason to write it down rather than discover it while building is the one the source paper gives: a language model writes one good page easily and a coherent multi-page application badly, and the incoherence is an interface problem. Page nine invents a field name that page one already had under a different spelling; a list view filters on a status the detail view calls something else; two surfaces compute the same total two ways. Every one of those is cheap to prevent and expensive to find, and all of them are prevented by naming the entities and operations once, before nine pages exist to disagree.

It is **not** a schema, and the distinction matters. A schema is a storage decision — column types, indexes, migration order, nullability. A specification is a claim about the product: that a reservation has a status drawn from this vocabulary, that cancelling one is a named operation taking a reservation id supplied by the user and an actor supplied by the system, that the operation is idempotent under a repeat click. Phase 7 turns the specification into a schema; if the specification is written as a schema it will encode our storage taste as if it were the target's product design, and the resulting clone will be self-consistent and subtly not the target.

It is also **not** a scope document. Scope closure is the FSM's job in Phase 5. The specification classifies pages by scope class because the FSM inherits that classification, but a specification that argues about what to include has taken work from the wrong phase.

---

## The evidence rule, before anything else

Every entity, field, enum value, relationship, operation, parameter, and page in this artifact carries `evidence: { level, ref, observed_at }`, and the levels are the entrypoint's:

- **A** — directly observed rendered behaviour, an authenticated API response, a captured DOM, or a safely exercised interaction.
- **B** — official product documentation, a target-owned preview, or a frozen capture of the target.
- **C** — licensed reference material or a conservative recorded inference.

Two hard rules follow, and they are the only thing standing between this protocol and a confident fabrication. **No Core-class item may rest on level C.** And anything asserted with no evidence at all is not a low-level entry — it is an **assumption**, and it goes in the `assumptions` array with its subject, the statement, why it is unobservable, and what breaks if it is wrong. An assumption absorbed into a field as though observed is the failure this whole artifact is supposed to make impossible, and it is invisible afterwards, because a validated specification looks identical whether its contents were observed or invented.

The highest-value evidence class is the authenticated API response, and it is worth saying why rather than merely preferring it. Rendered text tells you what a status is called in one place, in one locale, after formatting. A JSON payload tells you the target's own field name, the exact enum string, the shape of the relationship, and which fields exist but are not displayed. The Canvas run captured 101 authenticated API responses; a specification extracted from that corpus is a reading of the product, while one extracted from screenshots is a reading of a rendering of the product.

---

## 0. Recursive reconnaissance — discover the surface graph before modelling it

**This section exists because omitting it produced a measured failure.** The first run under this protocol declared six retained surfaces where a run under the incumbent protocol, against the same target on the same day, declared twenty-seven. The cause was a claim in an earlier version of this folder that FSM extraction replaced the incumbent's recursive reconnaissance. That claim was wrong, and the distinction it missed is the one this section turns on: **reconnaissance discovers what exists, modelling describes how what exists behaves.** A model can only be as wide as the surface list handed to it, so a model built without reconnaissance is deep and narrow by construction, and nothing downstream will notice — every gate passes, because every gate measures the model against itself.

So reconnaissance runs first, and it is the incumbent's, unchanged. Follow [`../CLONING/HIGH_FIDELITY_WEBSITE_CLONING.md`](../CLONING/HIGH_FIDELITY_WEBSITE_CLONING.md) Phase 4 and Phase 5 in full: treat each planned entry route as a tree, walk routes, navigation, links, buttons, forms, dialogs, sheets, popovers, menus, tabs, accordions, toggles, search, filters, pickers, editors, uploads, cards, maps, tooltips, keyboard interactions and responsive variants, and expand every state a control produces until no new retained state appears.

### 0.1 The inventory is the completeness authority

Reconnaissance produces `surface-inventory.json`, with the incumbent's Phase 5 field set unchanged — stable id, scope class, route and parent, element or state, preconditions, trigger, result, read operation, write operation, target evidence, and status. In this protocol that artifact is produced **here, before the specification**, rather than by the Implementer afterwards. That relocation is the point: the inventory becomes an input that the model must account for, instead of a record of what somebody happened to build.

Every node the inventory carries must end up in exactly one of four places, and the validator checks it:

| Disposition | Meaning |
|---|---|
| **Behavioural** | It becomes an FSM page, signature variable, or action. Most Core nodes land here. |
| **Static** | It is a real retained surface with no action — a footer, an hours table, a ratings breakdown, a legal block. It is marked `static` in the inventory, it is built and compared like anything else, and it simply has no transition. |
| **Excluded** | It is outside the declared scope, and it carries a boundary treatment: a truthful target-like unavailable state, or consistent removal. |
| **Exempt** | It does not reduce to a variable assignment, per `BEHAVIORAL_FSM.md` §2.5, and is recorded with its reason. |

The fourth disposition that must never happen is silence. A node discovered by reconnaissance and absent from all four buckets is a surface somebody saw and nobody decided about, and it is the exact shape of the six-versus-twenty-seven failure.

### 0.2 Panes and subpanes are nodes, not details

Say this plainly because the transition-shaped unit of work in this protocol invites the opposite reading. A pane, a subpane, a rail, a drawer, a nested tab, a card's expanded state, a hover card, an empty state, and an error state are each a node in the inventory with their own id. They are not attributes of the page that contains them.

The reason is mechanical rather than stylistic. Later phases order work by transition, and a static subpane has no transition, so it acquires no work unit and quietly never gets built. Giving it an inventory id is what makes it appear in the comparison sweep and in the coverage audit regardless of whether any action touches it.

---

## 1. Data models

### 1.1 Extract entities

Work from the evidence corpus, not from product intuition. For each candidate entity record: the name in the product's own vocabulary; the storage table it will own; every field with type, whether it is a primary key, whether it is required, and its enum vocabulary where one exists; the lifecycle states the product exposes; and the evidence for each.

Sources, in descending order of authority: authenticated API payloads and form submissions; captured DOM carrying `data-*` attributes, ids, and hidden inputs; rendered content across multiple rows and states, which is how you learn a field is optional; official documentation for vocabularies the UI shows only one member of; and the target's own URL parameters, which name the identifiers the product considers addressable.

Three extraction disciplines are worth more than the list:

**Enums come from the product, complete or declared incomplete.** A status field whose vocabulary you have seen two of five members of is recorded with those two and an assumption naming the gap. Inventing the other three produces a clone whose UI can enter states the target never shows, and every one of them is a fidelity defect nobody will look for.

**A field seen once is a field, and a field seen never is an assumption.** Resist completing the obvious shape. If the target's reservation payload has no `cancelled_at`, do not add one because cancellation obviously needs a timestamp — record the assumption, and let Phase 7 decide whether the clone needs a column the target does not expose.

**Relationships are directional and named.** Record `from`, `to`, type, and the field carrying it. A relationship you cannot name a field for is an inference, not an observation.

### 1.2 Declare relationships and invariants

Every relationship names two existing entities and an existing field on one of them. Record cardinality through the type (`belongs_to`, `has_many`, `has_one`, `many_to_many` with its join entity).

Record invariants the product visibly enforces, in product language: a reservation's nights cannot overlap another confirmed reservation on the same listing; a published listing must have at least one photo; a discount code is unique per store. These become schema constraints in Phase 7 and protected-state invariants in the verifier contract, and they are the cheapest reward-hacking defence available, because an invariant expressed as a constraint cannot be bypassed by a route the UI does not offer.

### 1.3 Seed density, declared per surface

The **surface density budget** in [`../CLONING/HIGH_FIDELITY_WEBSITE_CLONING.md`](../CLONING/HIGH_FIDELITY_WEBSITE_CLONING.md) §1.4 governs here in full and is not restated: per-surface floors derived from observed target counts, filters and sorts that both include and exclude, every lifecycle state instantiated more than once where a Core workflow acts on it, declared relationship fan-out, real variety rather than numbered rows, media on every row that renders it, and empty states declared rather than accidental.

What this document adds is where the budget is written down. Because the specification already enumerates entities, relationships and pages, it is the natural home for it, and recording it here rather than in the seed builder is what makes it checkable before any data exists.

**On each entity**, record `seed_density`: an `amount` of `one`, `few`, or `many`, the `capability` that amount exists to serve, and — where the target exposed one — the `observed_target_count` it was derived from. The amount is a summary; the binding numbers live on the pages.

**On each page**, record a `density` block for every collection that page renders: the collection's name, the entity behind it, the surface kind (`page_list`, `pane`, `menu`, or `detail_child`), the rows observed on the target at first paint, whether the target paginates and at what page size, and the `min_rows` floor the clone must meet. A page that renders no collection declares `density: []`, which is a statement rather than an omission. A page that is genuinely empty in the product declares `declared_empty` with its reason, and is then exempt from its floor.

Two rules keep this honest. **A floor with no observed count behind it is an assumption**, and goes in the assumptions register like any other unobserved claim; the validator warns rather than blocks, because an unobservable count is a legitimate situation and an unrecorded one is not. And **the entity amount must be able to satisfy the page floors that read it**, on this mapping:

| `amount` | Highest page floor it permits |
|---|---:|
| `one` | 1 |
| `few` | 5 |
| `many` | unbounded |

So if three surfaces each need twelve rows of the same entity under different filters, `few` is not a coherent answer and the validator says so. The mapping is deliberately blunt: its job is to catch the case where somebody wrote `few` next to an entity that a twelve-row list depends on, which is exactly how a clone ends up with a trips page showing two rows.

The floors themselves come from the surface kind, and are the lesser of the target's observed first paint and the kind's default — `page_list` 12, `pane` 5, `menu` 3, `detail_child` 3. A floor below that needs an `override_reason`. A paginating surface additionally needs at least two full pages plus a partial third, and no override rescues that one: a floor that cannot fill a second page leaves pagination as a control that exists and can never be exercised.

This section exists because of a measured failure in this workspace, not for symmetry. Three Airbnb task families are pinned at exactly two distinct tasks each for one reason: the seed world holds two reservations, of which one is completed and one is confirmed, and zero pending requests. A family that needs a queue to triage has nothing to choose between. That ceiling is a count of rows, the count was chosen without anyone recording what the rows were for, and it was discovered a quarter later by measurement rather than at the time by a gate.

---

## 2. Programming interfaces

### 2.1 Name every operation the product performs

An operation is one named thing the product does: a read that backs a surface, or a write that changes durable state. For each, record: a stable id in `noun.verb` form; a human name; `kind` of `read` or `write`; parameters; the entities it reads and the entities it writes; the invariants it must preserve; and its evidence.

Operations come from the interaction inventory collected in research. Every control that changes what is on screen is backed by a read or a write, and the question that separates them is the one research was told to ask at each control: **did the change survive a reload?** A change that survives is a write, and the operation is durable. A change that does not is either a read with different parameters or pure presentation, and Phase 5 will classify it as a transient signature variable.

### 2.2 Classify every parameter

Each parameter is `source: "user"` or `source: "system"`. InfiniteWeb's phrasing is exact: `productId` and `quantity` are user-provided, `userId` and `sessionId` are system-managed.

The classification is not bookkeeping. A system-managed parameter that leaks into a user-supplied position is a reward-hacking vector and a fidelity error at the same time: an actor id the client can set is an authorization bypass, and it is also not what the target does. The audit's `HV4` — undocumented bypass affordance — is exactly this mistake at runtime, and this is where it is cheapest to prevent. When Phase 8 builds the server boundary, the user-provided set is the request body and the system-managed set comes from the session and the injected clock. Nothing else may be accepted.

### 2.3 Declare idempotency for every write

For each write, record what happens on repetition: `natural` (repeating is a legitimate product action, such as sending a second message), or a named key (`reservation_id + night`, `order_id + line_item`) under which a repeat must be absorbed rather than duplicated.

Every double-click, retry, background poll, and impatient agent will exercise this. The audit criterion `C7` and the hack vector `HV9` — surplus, duplicate, or orphan rows accepted — are both this decision, made once here and enforced in one transaction later.

### 2.4 Name the ledger action for every write

Each write operation carries `ledger_action`, the string that identifies it in the transition ledger declared in Phase 7.3. The vocabulary is the product's own actions — `reservation.cancel`, `listing.publish`, `discount.disable` — and it must be one-to-one with write operations, because a ledger action shared by two operations makes their occurrences indistinguishable in the artifact, which is precisely the distinction the ledger exists to preserve.

This is the transposition of InfiniteWeb's instrumentation variables, and the workspace's own measurement is the argument for it. Its graders read final state; an agent that books a replacement and then correctly withdraws it leaves a final state identical to an agent that never booked. Telling those apart is the capability the model evidence identified as the frontier weakness, and it is unrecoverable unless the transition itself persisted. In the source paper the checkpoint lives in `localStorage`; here it lives in a table a verifier opens read-only, which is the same idea moved somewhere a grader can reach.

---

## 3. Page architecture

For each page: a stable id; the route including parameter shape; the product's own page name; `scope_class` of `Core`, `Supporting`, or `Shell-only`; the operations assigned to it; the parameters it accepts on entry; its outgoing navigations with the parameters each carries; the access methods by which a user arrives; and its evidence.

Then record the chrome separately — header links, footer links, persistent rails — because chrome is the thing that makes navigation closure checkable. Most dead affordances in a clone are chrome links to pages nobody planned, and they are found by listing chrome once rather than by clicking around later.

Two rules keep this honest. **Every outgoing navigation names an existing page or a declared boundary.** A boundary is an explicit record that this control leaves the declared scope, with the treatment chosen: a truthful target-like unavailable state, or consistent removal. There is no third option and "note the limitation" is not one of them. And **operations are assigned, not duplicated.** An operation appearing on four pages is one operation referenced four times; if two pages need subtly different behaviour, they need two operations, and writing them as one is how a clone ends up with two divergent totals for the same number.

---

## 4. Actors, clock, and the assumptions register

**Actors.** Every role the scope needs, whether it is seeded in the base world, and what differs for it. A clone with one actor and no declared alternative cannot support a permission surface later, and the target's role differences are among the cheapest things to observe and the most expensive to retrofit.

**Clock.** The frozen `now`, timezone, locale, and currency, with the reason for the chosen instant. The reason matters: Canvas's run had to amend its frozen clock mid-build because the original instant fell in summer break and made every Core dashboard state empty. A frozen instant is a product decision about which world the clone shows, and choosing it here — against the seed density declared in §1.3 — is how that amendment gets avoided rather than discovered.

**Assumptions register.** Every entry carries an id, subject, the statement being assumed, why it is unobservable, and the risk if it is wrong. This array is a first-class deliverable, it is read by the auditor's model-truthfulness gate, and it is reported at release with which entries remain open. An empty register on a gated target is not a clean bill of health; it is a claim that everything was observed, and the auditor will sample against it.

---

## 5. The validate-revise loop

Both source papers converge on the same shape — propose, validate structurally, revise, repeat — and the reason is that a specification is long, mechanical, and full of cross-references no author reliably keeps straight by reading.

Run it:

~~~bash
python3 FILES/PROTOCOLS/CLONING_MODEL_FIRST/validate_model.py \
  --spec FILES/SCRATCHPADS/cloning-runs/<target-slug>/<run-id>/target-spec.json \
  --out  FILES/SCRATCHPADS/cloning-runs/<target-slug>/<run-id>/model-validation.json
~~~

The checks it performs are listed in [`BEHAVIORAL_FSM.md`](./BEHAVIORAL_FSM.md) §4 alongside the FSM checks, since one script owns both. Iterate until it exits zero. Record each iteration in the run trace, including what failed, so that the cost of reaching a valid specification is visible rather than absorbed into a single successful-looking gate.

A failing check is never answered by relaxing the check or by deleting the offending node. Both are available, both produce a passing gate, and both leave a specification that describes less of the product than the run already knows about.

---

## 6. Gate `SPEC_VALIDATED`

Freeze and checksum `target-spec.json`, record its digest and version in `run.json`, and hand off to Phase 5.

- [ ] Validates against the schema and `validate_model.py` exits zero
- [ ] Every entity has a primary key, an owning table, and typed fields with enum vocabularies where the product has them
- [ ] Every relationship names existing entities and an existing carrying field
- [ ] Every operation declares kind, parameters with `user`/`system` source, reads, writes, and invariants
- [ ] Every write operation declares an idempotency rule and a unique `ledger_action`
- [ ] Every page declares route, scope class, operations, and outgoing navigations resolving to a page or a declared boundary
- [ ] Chrome enumerated; every chrome link resolves to a page or a declared boundary
- [ ] Actors, frozen clock, timezone, locale, and currency declared with the reason for the instant
- [ ] Seed density declared per entity, each naming the capability it serves
- [ ] Every page declares a `density` block per rendered collection, or `declared_empty` with a reason
- [ ] Every page declares a `depth` block: the target's observed control and card counts, and the parity bar it must meet
- [ ] No retained page declares a target control count of zero without being Shell-only or excluded
- [ ] Every `min_rows` floor traces to an `observed_target_count` or to an assumptions entry
- [ ] Entity amounts can satisfy the page floors that read them
- [ ] Every node carries evidence level and reference; no Core-class node at level C
- [ ] Assumptions register present, each entry naming what is unobservable and what breaks

A specification that passes all twelve is coherent. It is not yet known to be true — that is the auditor's model-truthfulness gate in Phase 11, and nothing in this document can substitute for it.
