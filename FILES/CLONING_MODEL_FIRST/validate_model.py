#!/usr/bin/env python3
"""Structural validator for the model-first cloning protocol's two model artifacts.

Standard library only. Checks target-spec.json (S-series, including the surface density budget), fsm.json (F-series),
and the cross-references between them (X-series); then enumerates a bounded reachable state set
and derives the canonical traversal set that the Phase 9 conformance harness replays.

    python3 validate_model.py --spec <run>/target-spec.json \
                              --fsm  <run>/fsm.json \
                              --out  <run>/model-validation.json

Exit 0 when there are no errors, 1 when there are, 2 on usage or IO failure. Warnings never
block a gate. Errors are named by check id so a proposer/validator/improver loop can act on
them without reading prose.

What this script can and cannot establish: it proves a model is coherent, closed, and
executable. It cannot prove the model describes the target. That is the auditor's
model-truthfulness gate, and no amount of structural checking substitutes for it.
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import deque

ALLOWED_FIELD_TYPES = {"string", "number", "integer", "boolean", "enum", "datetime", "date", "json", "blob"}
ALLOWED_VAR_TYPES = {"string", "number", "integer", "boolean", "enum", "set", "object"}
ALLOWED_GUI_OPS = {"click", "hover", "type_text", "scroll_until_visible", "press_key", "select_option"}
LITERAL_EFFECT_OPS = {"assign", "reset"}
SCOPE_CLASSES = {"Core", "Supporting", "Shell-only"}
SURFACE_FLOORS = {"page_list": 12, "pane": 5, "menu": 3, "detail_child": 3}
DENSITY_ALLOWANCE = {"one": 1, "few": 5, "many": 10 ** 9}
DISPOSITIONS = {"behavioural", "static", "excluded", "exempt"}
EVIDENCE_LEVELS = {"A", "B", "C"}
OPAQUE = "<opaque>"

DEFAULT_MAX_STATES = 20000
DEFAULT_MAX_DEPTH = 12


class Report:
    def __init__(self) -> None:
        self.errors: list[dict] = []
        self.warnings: list[dict] = []

    def error(self, check: str, subject: str, message: str) -> None:
        self.errors.append({"check": check, "subject": subject, "message": message})

    def warn(self, check: str, subject: str, message: str) -> None:
        self.warnings.append({"check": check, "subject": subject, "message": message})


def evidence_of(node, rep: Report, check: str, subject: str):
    """Return the evidence level, recording an error when the block is missing or malformed."""
    ev = node.get("evidence") if isinstance(node, dict) else None
    if not isinstance(ev, dict) or "level" not in ev or "ref" not in ev:
        rep.error(check, subject, "missing evidence block with level and ref")
        return None
    if ev["level"] not in EVIDENCE_LEVELS:
        rep.error(check, subject, f"evidence level {ev['level']!r} not in A/B/C")
        return None
    if not str(ev.get("ref", "")).strip():
        rep.error(check, subject, "evidence ref is empty")
        return None
    return ev["level"]


# --------------------------------------------------------------------------------------
# Specification checks
# --------------------------------------------------------------------------------------

def check_spec(spec: dict, rep: Report) -> dict:
    entities = spec.get("entities") or []
    operations = spec.get("operations") or []
    pages = spec.get("pages") or []

    entity_names: set[str] = set()
    entity_tables: dict[str, str] = {}
    entity_fields: dict[str, set[str]] = {}

    for ent in entities:
        name = ent.get("name")
        subject = f"entity {name!r}"
        if not name:
            rep.error("S1", "entity", "entity has no name")
            continue
        if name in entity_names:
            rep.error("S1", subject, "duplicate entity name")
        entity_names.add(name)

        table = ent.get("table")
        if not table:
            rep.error("S1", subject, "no owning table declared")
        else:
            if table in entity_tables.values():
                rep.error("S1", subject, f"table {table!r} already owned by another entity")
            entity_tables[name] = table

        fields = ent.get("fields") or []
        if not fields:
            rep.error("S1", subject, "no fields declared")
        pks = [f for f in fields if f.get("primary_key")]
        if len(pks) != 1:
            rep.error("S1", subject, f"expected exactly one primary-key field, found {len(pks)}")
        entity_fields[name] = {f.get("name") for f in fields if f.get("name")}

        for f in fields:
            fsubject = f"{subject} field {f.get('name')!r}"
            ftype = f.get("type")
            if ftype not in ALLOWED_FIELD_TYPES:
                rep.error("S2", fsubject, f"type {ftype!r} not in the allowed set")
            if ftype == "enum":
                if not (f.get("enum_domain") or []):
                    rep.error("S2", fsubject, "enum field declares no enum_domain")
                elif f.get("enum_complete") is False:
                    # Legitimate, but it must be paired with an assumption.
                    rep.warn("S2", fsubject, "enum_domain declared incomplete; confirm a matching assumptions entry exists")
            evidence_of(f, rep, "S11", fsubject)

        evidence_of(ent, rep, "S11", subject)

        density = ent.get("seed_density")
        if not isinstance(density, dict) or not density.get("amount") or not density.get("capability"):
            rep.error("S14", subject, "seed_density must declare amount and the capability it serves")

    for rel in spec.get("relationships") or []:
        subject = f"relationship {rel.get('from')}->{rel.get('to')}"
        for side in ("from", "to"):
            if rel.get(side) not in entity_names:
                rep.error("S3", subject, f"{side} names unknown entity {rel.get(side)!r}")
        carrier = rel.get("via") if rel.get("type") == "many_to_many" and rel.get("via") else rel.get("from")
        field = rel.get("field")
        if carrier in entity_fields and field not in entity_fields.get(carrier, set()):
            rep.error("S3", subject, f"carrying field {field!r} not declared on {carrier!r}")

    op_ids: set[str] = set()
    write_ops: dict[str, dict] = {}
    ledger_actions: dict[str, str] = {}
    for op in operations:
        oid = op.get("id")
        subject = f"operation {oid!r}"
        if not oid:
            rep.error("S4", "operation", "operation has no id")
            continue
        if oid in op_ids:
            rep.error("S4", subject, "duplicate operation id")
        op_ids.add(oid)
        if "." not in oid:
            rep.error("S4", subject, "id is not in noun.verb form")
        kind = op.get("kind")
        if kind not in {"read", "write"}:
            rep.error("S4", subject, f"kind {kind!r} must be read or write")

        for p in op.get("parameters") or []:
            if p.get("source") not in {"user", "system"}:
                rep.error("S5", f"{subject} parameter {p.get('name')!r}", "source must be user or system")

        for key in ("reads", "writes"):
            for ent_name in op.get(key) or []:
                if ent_name not in entity_names:
                    rep.error("S8", subject, f"{key} names unknown entity {ent_name!r}")

        if kind == "write":
            write_ops[oid] = op
            idem = op.get("idempotency")
            if not isinstance(idem, dict) or idem.get("mode") not in {"natural", "keyed"}:
                rep.error("S6", subject, "write operation must declare idempotency mode natural or keyed")
            elif idem["mode"] == "keyed" and not idem.get("key"):
                rep.error("S6", subject, "keyed idempotency declares no key")
            ledger = op.get("ledger_action")
            if not ledger:
                rep.error("S6", subject, "write operation declares no ledger_action")
            elif ledger in ledger_actions:
                rep.error("S7", subject, f"ledger_action {ledger!r} already used by {ledger_actions[ledger]!r}")
            else:
                ledger_actions[ledger] = oid
            if not (op.get("writes") or []):
                rep.error("S4", subject, "write operation names no written entity")
        elif kind == "read" and (op.get("writes") or []):
            rep.error("S4", subject, "read operation declares written entities")

        evidence_of(op, rep, "S11", subject)

    page_ids: set[str] = set()
    spec_page_scope: dict[str, str] = {}
    core_page_ops: set[str] = set()
    for page in pages:
        pid = page.get("id")
        subject = f"page {pid!r}"
        if not pid:
            rep.error("S9", "page", "page has no id")
            continue
        if pid in page_ids:
            rep.error("S9", subject, "duplicate page id")
        page_ids.add(pid)
        if not page.get("route"):
            rep.error("S9", subject, "no route declared")
        scope = page.get("scope_class")
        if scope not in SCOPE_CLASSES:
            rep.error("S9", subject, f"scope_class {scope!r} invalid")
        spec_page_scope[pid] = scope
        for oid in page.get("operations") or []:
            if oid not in op_ids:
                rep.error("S9", subject, f"assigned unknown operation {oid!r}")
            elif scope == "Core":
                core_page_ops.add(oid)
        level = evidence_of(page, rep, "S11", subject)
        if scope == "Core" and level == "C":
            rep.error("S12", subject, "Core page rests on level-C evidence")

    # Outgoing navigation and chrome closure.
    for page in pages:
        pid = page.get("id")
        for out in page.get("outgoing") or []:
            target = out.get("target")
            subject = f"page {pid!r} -> {target!r}"
            if target == "BOUNDARY":
                if out.get("boundary_treatment") not in {"target_like_unavailable_state", "consistently_removed"}:
                    rep.error("S10", subject, "boundary navigation declares no boundary_treatment")
            elif target not in page_ids:
                rep.error("S10", subject, "outgoing navigation resolves to no declared page and is not a BOUNDARY")

    chrome = spec.get("chrome") or {}
    for group in ("header_links", "footer_links", "rail_links"):
        for link in chrome.get(group) or []:
            target = link.get("target")
            subject = f"chrome {group} {link.get('text')!r} -> {target!r}"
            if target == "BOUNDARY":
                if link.get("boundary_treatment") not in {"target_like_unavailable_state", "consistently_removed"}:
                    rep.error("S10", subject, "boundary chrome link declares no boundary_treatment")
            elif target not in page_ids:
                rep.error("S10", subject, "chrome link resolves to no declared page and is not a BOUNDARY")

    # Core-reachable operations and entities may not rest on level C.
    for oid in sorted(core_page_ops):
        op = next((o for o in operations if o.get("id") == oid), None)
        if op and (op.get("evidence") or {}).get("level") == "C":
            rep.error("S12", f"operation {oid!r}", "operation reachable from a Core page rests on level-C evidence")
        for ent_name in ((op or {}).get("reads") or []) + ((op or {}).get("writes") or []):
            ent = next((e for e in entities if e.get("name") == ent_name), None)
            if ent and (ent.get("evidence") or {}).get("level") == "C":
                rep.error("S12", f"entity {ent_name!r}", "entity reachable from a Core page rests on level-C evidence")

    # S15-S17: the surface density budget. A structurally complete clone that renders empty is
    # the failure these catch, and they are checkable before a single row is seeded.
    assumption_subjects = " ".join(
        "%s %s" % (a.get("subject", ""), a.get("statement", ""))
        for a in (spec.get("assumptions") or []) if isinstance(a, dict)
    ).lower()
    entity_floor: dict[str, int] = {}

    for page in pages:
        pid = page.get("id")
        subject = f"page {pid!r}"
        density = page.get("density")
        declared_empty = page.get("declared_empty")
        if declared_empty is not None:
            if not isinstance(declared_empty, dict) or not declared_empty.get("reason"):
                rep.error("S15", subject, "declared_empty must give a reason; an empty state is declared, never accidental")
            continue
        if density is None:
            rep.error("S15", subject, "no density block; declare one entry per rendered collection, or [] if the page renders none, or declared_empty with a reason")
            continue
        if not isinstance(density, list):
            rep.error("S15", subject, "density must be an array")
            continue
        seen_collections: set[str] = set()
        for entry in density:
            name = entry.get("collection")
            dsubject = f"{subject} collection {name!r}"
            if not name:
                rep.error("S16", subject, "density entry has no collection name")
                continue
            if name in seen_collections:
                rep.error("S16", dsubject, "duplicate collection name on this page")
            seen_collections.add(name)

            ent_name = entry.get("entity")
            if ent_name not in entity_names:
                rep.error("S16", dsubject, f"names unknown entity {ent_name!r}")

            kind = entry.get("surface_kind")
            if kind not in SURFACE_FLOORS:
                rep.error("S16", dsubject, f"surface_kind {kind!r} not in {sorted(SURFACE_FLOORS)}")
                continue

            floor = entry.get("min_rows")
            if not isinstance(floor, int) or floor < 1:
                rep.error("S16", dsubject, "min_rows must be a positive integer")
                continue

            observed = entry.get("observed_target_first_paint")
            default_floor = SURFACE_FLOORS[kind]
            expected = default_floor if observed is None else min(default_floor, observed)
            if floor < expected and not str(entry.get("override_reason", "")).strip():
                rep.error("S16", dsubject,
                          f"min_rows {floor} is below the derived floor {expected} for a {kind} "
                          f"(default {default_floor}, observed {observed}); lower it only with an override_reason")

            if observed is None and str(name).lower() not in assumption_subjects:
                rep.warn("S16", dsubject,
                         "no observed_target_first_paint and no matching assumptions entry; a floor with no observed "
                         "count behind it is an assumption and should be registered as one")

            if entry.get("paginates"):
                size = entry.get("page_size")
                if not isinstance(size, int) or size < 1:
                    rep.error("S16", dsubject, "paginates is true but page_size is missing or invalid")
                elif floor < 2 * size + 1:
                    rep.error("S16", dsubject,
                              f"min_rows {floor} gives fewer than two full pages plus a partial third at page_size "
                              f"{size} (needs {2 * size + 1}); pagination would exist and be unexercisable")

            if ent_name in entity_names:
                entity_floor[ent_name] = max(entity_floor.get(ent_name, 0), floor)

    for ent in entities:
        name = ent.get("name")
        if name not in entity_floor:
            continue
        amount = ((ent.get("seed_density") or {}).get("amount"))
        allowance = DENSITY_ALLOWANCE.get(amount)
        if allowance is not None and entity_floor[name] > allowance:
            rep.error("S17", f"entity {name!r}",
                      f"seed_density amount {amount!r} allows at most {allowance} rows but a page floor needs "
                      f"{entity_floor[name]}; raise the amount or lower the floor")

    clock = spec.get("clock")
    if not isinstance(clock, dict):
        rep.error("S13", "clock", "no clock block")
    else:
        for key in ("frozen_now", "timezone", "locale", "currency", "reason"):
            if not clock.get(key):
                rep.error("S13", "clock", f"clock declares no {key}")
    if not isinstance(spec.get("assumptions"), list):
        rep.error("S13", "assumptions", "assumptions register is absent; an empty array is the way to claim there are none")
    else:
        for a in spec["assumptions"]:
            subject = f"assumption {a.get('id')!r}"
            for key in ("subject", "statement", "why_unobservable", "risk_if_wrong"):
                if not a.get(key):
                    rep.error("S13", subject, f"assumption declares no {key}")

    if not (spec.get("actors") or []):
        rep.error("S13", "actors", "no actors declared")

    return {
        "entity_names": entity_names,
        "entity_tables": entity_tables,
        "op_ids": op_ids,
        "write_ops": write_ops,
        "ledger_actions": ledger_actions,
        "page_ids": page_ids,
        "page_scope": spec_page_scope,
        "operations": operations,
        "entities": entities,
    }


# --------------------------------------------------------------------------------------
# FSM checks
# --------------------------------------------------------------------------------------

def path_var(path: str) -> str | None:
    """'$.a.b' -> 'a'. The first segment is the declared signature variable."""
    if not isinstance(path, str) or not path.startswith("$."):
        return None
    rest = path[2:]
    if not rest:
        return None
    return rest.split(".")[0].split("[")[0]


def check_fsm(fsm: dict, rep: Report, spec_ctx: dict | None) -> dict:
    meta = fsm.get("meta") or {}
    pages = fsm.get("pages") or {}
    actions = fsm.get("actions") or {}
    goals = fsm.get("goals") or []

    if not pages:
        rep.error("F1", "pages", "no pages declared")
    if not actions:
        rep.error("F11", "actions", "no actions declared")

    page_ids = set(pages.keys())
    sig_vars: dict[str, dict] = {}
    for pid, page in pages.items():
        subject = f"page {pid!r}"
        if page.get("scope_class") not in SCOPE_CLASSES:
            rep.error("F1", subject, f"scope_class {page.get('scope_class')!r} invalid")
        if not page.get("route"):
            rep.error("F1", subject, "no route declared")
        sig = page.get("signature")
        if not isinstance(sig, dict):
            rep.error("F9", subject, "no signature object")
            sig = {}
        sig_vars[pid] = sig
        for vname, var in sig.items():
            vsubject = f"{subject} signature {vname!r}"
            if not isinstance(var, dict):
                rep.error("F9", vsubject, "signature variable is not an object")
                continue
            if var.get("type") not in ALLOWED_VAR_TYPES:
                rep.error("F9", vsubject, f"type {var.get('type')!r} not in the allowed set")
            if "default" not in var:
                rep.error("F9", vsubject, "no default declared")
            backing = var.get("backing")
            if not isinstance(backing, dict) or backing.get("kind") not in {"durable", "transient"}:
                rep.error("F9", vsubject, "backing must declare kind durable or transient")
            elif backing["kind"] == "durable":
                if not backing.get("table") or not backing.get("column"):
                    rep.error("F9", vsubject, "durable backing declares no table and column")
                elif spec_ctx and backing["table"] not in set(spec_ctx["entity_tables"].values()):
                    rep.error("F9", vsubject, f"durable backing names table {backing['table']!r} owned by no specification entity")
            level = evidence_of(var, rep, "F17", vsubject)
            if page.get("scope_class") == "Core" and level == "C":
                rep.error("F17", vsubject, "Core signature variable rests on level-C evidence")
        level = evidence_of(page, rep, "F17", subject)
        if page.get("scope_class") == "Core" and level == "C":
            rep.error("F17", subject, "Core page rests on level-C evidence")
        exempt = page.get("model_exempt")
        if exempt is not None and (not isinstance(exempt, dict) or not exempt.get("reason") or not exempt.get("fidelity_treatment")):
            rep.error("F20", subject, "model_exempt must declare reason and fidelity_treatment")

    # F2 / F3: page-action listing is a bijection onto declared actions.
    listed: dict[str, list[str]] = {}
    for pid, page in pages.items():
        for aid in page.get("actions") or []:
            listed.setdefault(aid, []).append(pid)
            if aid not in actions:
                rep.error("F2", f"page {pid!r}", f"lists undeclared action {aid!r}")
    for aid, owners in listed.items():
        if len(owners) > 1:
            rep.error("F3", f"action {aid!r}", f"listed by more than one page: {owners}")
    for aid in actions:
        if aid not in listed:
            rep.error("F3", f"action {aid!r}", "declared but listed by no page")

    selectors: dict[str, str] = {}
    write_actions: dict[str, dict] = {}
    for aid, act in actions.items():
        subject = f"action {aid!r}"
        frm = act.get("from")
        if frm not in page_ids:
            rep.error("F1", subject, f"from names unknown page {frm!r}")
        elif listed.get(aid) and listed[aid][0] != frm:
            rep.error("F2", subject, f"from is {frm!r} but it is listed by page {listed[aid][0]!r}")

        is_nav = act.get("is_navigation")
        to_pid = act.get("to_page_id")
        if is_nav:
            if not to_pid:
                rep.error("F1", subject, "navigation action declares no to_page_id")
            elif to_pid not in page_ids:
                rep.error("F1", subject, f"to_page_id names unknown page {to_pid!r}")
        elif to_pid:
            rep.error("F1", subject, "non-navigation action declares a to_page_id")

        for pc in act.get("preconditions") or []:
            var = path_var(pc.get("path", ""))
            psubject = f"{subject} precondition {pc.get('path')!r}"
            if var is None:
                rep.error("F6", psubject, "path must start with $. and name a signature variable")
            elif frm in sig_vars and var not in sig_vars[frm]:
                rep.error("F6", psubject, f"resolves to no variable declared on page {frm!r}")

        for eff in act.get("effects") or []:
            var = path_var(eff.get("path", ""))
            esubject = f"{subject} effect {eff.get('path')!r}"
            applies_to = eff.get("applies_to", "from")
            target_page = to_pid if (is_nav and applies_to == "destination") else frm
            if var is None:
                rep.error("F7", esubject, "path must start with $. and name a signature variable")
            elif target_page in sig_vars and var not in sig_vars[target_page]:
                rep.error("F7", esubject, f"resolves to no variable declared on page {target_page!r} (applies_to={applies_to})")
            if eff.get("op") in LITERAL_EFFECT_OPS and "value" not in eff and eff.get("op") != "reset":
                rep.error("F8", esubject, "assign effect declares no value, so the effect is not deterministic")

        # F10: durable outcomes may not rest on transient variables.
        de = act.get("durable_effect") or {}
        if de.get("kind") == "write":
            write_actions[aid] = act
            idem = de.get("idempotency")
            if not isinstance(idem, dict) or idem.get("mode") not in {"natural", "keyed"}:
                rep.error("F14", subject, "write action declares no idempotency mode")
            elif idem["mode"] == "keyed" and not idem.get("key"):
                rep.error("F14", subject, "keyed idempotency declares no key")
            ledger = (de.get("ledger") or {}).get("action")
            if not ledger:
                rep.error("F14", subject, "write action declares no ledger.action")
            if not (de.get("tables") or []):
                rep.error("F14", subject, "write action names no tables")
            if spec_ctx:
                oid = de.get("operation")
                if not oid:
                    rep.error("F14", subject, "write action names no specification operation")
                elif oid not in spec_ctx["write_ops"]:
                    rep.error("F14", subject, f"names operation {oid!r} which is not a declared write operation")
                else:
                    spec_op = spec_ctx["write_ops"][oid]
                    if ledger and spec_op.get("ledger_action") and ledger != spec_op["ledger_action"]:
                        rep.error("F14", subject, f"ledger.action {ledger!r} disagrees with operation ledger_action {spec_op['ledger_action']!r}")
                    spec_idem = spec_op.get("idempotency") or {}
                    if isinstance(idem, dict) and spec_idem.get("mode") and idem.get("mode") != spec_idem["mode"]:
                        rep.error("F14", subject, f"idempotency mode {idem.get('mode')!r} disagrees with the operation's {spec_idem['mode']!r}")
                    known_tables = set(spec_ctx["entity_tables"].values())
                    for t in de.get("tables") or []:
                        if t not in known_tables:
                            rep.error("F14", subject, f"names table {t!r} owned by no specification entity")
            for pc in act.get("preconditions") or []:
                var = path_var(pc.get("path", ""))
                if frm in sig_vars and var in sig_vars[frm]:
                    backing = (sig_vars[frm][var].get("backing") or {}).get("kind")
                    if backing == "transient":
                        rep.warn("F10", subject, f"durable write is gated by transient variable {var!r}; confirm the gate is presentation-only")
        elif de.get("kind") != "none":
            rep.error("F14", subject, f"durable_effect.kind {de.get('kind')!r} must be none or write")

        procedure = act.get("gui_procedure") or []
        if not procedure:
            rep.error("F11", subject, "no gui_procedure declared")
        for i, op in enumerate(procedure):
            osubject = f"{subject} gui_procedure[{i}]"
            if op.get("op") not in ALLOWED_GUI_OPS:
                rep.error("F11", osubject, f"op {op.get('op')!r} outside the allowed atomic vocabulary")
            if op.get("op") in {"click", "hover", "scroll_until_visible", "select_option"} and not op.get("selector"):
                rep.error("F12", osubject, "op needs a selector and declares none")
            sel = op.get("selector")
            if sel:
                if sel in selectors and selectors[sel] != aid:
                    rep.error("F12", osubject, f"selector {sel!r} already used by action {selectors[sel]!r}")
                selectors.setdefault(sel, aid)

        if not str(act.get("observable_result", "")).strip():
            rep.error("F15", subject, "no observable_result declared; an agent cannot know the action landed")

        if act.get("boundary_treatment") is not None and act["boundary_treatment"] not in {"target_like_unavailable_state", "consistently_removed"}:
            rep.error("F19", subject, "boundary_treatment invalid")

        level = evidence_of(act, rep, "F17", subject)
        page_scope = (pages.get(frm) or {}).get("scope_class")
        if page_scope == "Core" and level == "C":
            rep.error("F17", subject, "Core action rests on level-C evidence")

    # F13: ambiguous grounding — same page, equivalent preconditions, same first selector.
    def first_selector(act: dict) -> str | None:
        for op in act.get("gui_procedure") or []:
            if op.get("selector"):
                return op["selector"]
        return None

    def pre_key(act: dict):
        return tuple(sorted((c.get("path"), c.get("op"), json.dumps(c.get("value"), sort_keys=True, default=str)) for c in act.get("preconditions") or []))

    by_page: dict[str, list[str]] = {}
    for aid, act in actions.items():
        by_page.setdefault(act.get("from"), []).append(aid)
    for pid, aids in by_page.items():
        seen: dict[tuple, str] = {}
        for aid in aids:
            key = (pre_key(actions[aid]), first_selector(actions[aid]))
            if key[1] is None:
                continue
            if key in seen:
                rep.error("F13", f"page {pid!r}", f"actions {seen[key]!r} and {aid!r} are indistinguishable: same preconditions and same first selector")
            seen[key] = aid

    # F16: a result-set mutation must reset pagination on the same page.
    for aid, act in actions.items():
        frm = act.get("from")
        sig = sig_vars.get(frm, {})
        pagination_vars = {n for n, v in sig.items() if isinstance(v, dict) and v.get("pagination")}
        if not pagination_vars:
            continue
        touched = {path_var(e.get("path", "")) for e in act.get("effects") or []}
        mutates_result_set = any(isinstance(sig.get(v), dict) and sig[v].get("result_set") for v in touched if v)
        if mutates_result_set and not (pagination_vars & {v for v in touched if v}):
            rep.error("F16", f"action {aid!r}", f"mutates a result-set variable without resetting pagination {sorted(pagination_vars)}")

    # F4: page reachability from the initial page through navigation edges.
    initial = meta.get("initial_page_id")
    if initial not in page_ids:
        rep.error("F4", "meta.initial_page_id", f"{initial!r} names no declared page")
        reachable_pages = set()
    else:
        adj: dict[str, set[str]] = {pid: set() for pid in page_ids}
        for act in actions.values():
            if act.get("is_navigation") and act.get("from") in adj and act.get("to_page_id") in page_ids:
                adj[act["from"]].add(act["to_page_id"])
        reachable_pages = {initial}
        stack = [initial]
        while stack:
            cur = stack.pop()
            for nxt in adj.get(cur, ()):
                if nxt not in reachable_pages:
                    reachable_pages.add(nxt)
                    stack.append(nxt)
        for pid in sorted(page_ids - reachable_pages):
            rep.error("F4", f"page {pid!r}", "unreachable from the initial page through navigation edges")

    for pid in meta.get("terminal_pages") or []:
        if pid not in page_ids:
            rep.error("F4", f"meta.terminal_pages {pid!r}", "names no declared page")
        elif pid not in reachable_pages:
            rep.error("F4", f"meta.terminal_pages {pid!r}", "declared terminal page is unreachable")

    # F18: goal predicates over durable state, with exclusions.
    durable_tables = {
        (v.get("backing") or {}).get("table")
        for sig in sig_vars.values()
        for v in sig.values()
        if isinstance(v, dict) and (v.get("backing") or {}).get("kind") == "durable"
    }
    known_tables = set(spec_ctx["entity_tables"].values()) if spec_ctx else durable_tables
    goal_ids: set[str] = set()
    for goal in goals:
        gid = goal.get("id")
        subject = f"goal {gid!r}"
        if not gid:
            rep.error("F18", "goal", "goal has no id")
            continue
        if gid in goal_ids:
            rep.error("F18", subject, "duplicate goal id")
        goal_ids.add(gid)
        pred = goal.get("predicate") or {}
        clauses = pred.get("clauses") or []
        if not clauses:
            rep.error("F18", subject, "predicate declares no clauses")
        for c in clauses + (pred.get("exclusions") or []):
            if c.get("table") not in known_tables:
                rep.error("F18", subject, f"predicate clause names table {c.get('table')!r} owned by no specification entity")
        if not (pred.get("exclusions") or []):
            rep.error("F18", subject, "predicate declares no exclusion clauses, so it cannot reject a superset final state")
        for aid in goal.get("requires_actions") or []:
            if aid not in actions:
                rep.error("F5", subject, f"requires_actions names undeclared action {aid!r}")
            elif (actions[aid].get("durable_effect") or {}).get("kind") != "write":
                rep.warn("F5", subject, f"requires_actions names {aid!r} which has no durable write")

    build_profiles = meta.get("build_profiles") or {}
    for profile in ("conformance", "graded"):
        if not (build_profiles.get(profile) or {}).get("command"):
            rep.error("F12", f"meta.build_profiles.{profile}", "no build command declared; the two-profile selector contract is unenforceable without both")

    return {
        "page_ids": page_ids,
        "sig_vars": sig_vars,
        "actions": actions,
        "pages": pages,
        "goals": goals,
        "meta": meta,
        "write_actions": write_actions,
        "reachable_pages": reachable_pages,
        "selectors": selectors,
    }


# --------------------------------------------------------------------------------------
# Cross-artifact checks
# --------------------------------------------------------------------------------------

def check_inventory(inv: dict, spec_ctx: dict, fsm_ctx: dict | None, rep: Report) -> dict:
    """X6: every node reconnaissance found is accounted for.

    This is the breadth check, and it is the one gate the model cannot supply for itself. A model is
    validated against its own contents, so a narrow model passes every structural check; only an
    independently produced inventory can say whether the model covers what the target actually has.
    """
    nodes = inv.get("surfaces") or inv.get("nodes") or []
    if not isinstance(nodes, list) or not nodes:
        rep.error("X6", "surface-inventory.json", "carries no surfaces; reconnaissance must run before the model")
        return {"nodes": 0}

    page_ids = fsm_ctx["page_ids"] if fsm_ctx else set()
    action_ids = set(fsm_ctx["actions"]) if fsm_ctx else set()
    sig_names = {n for sig in (fsm_ctx or {}).get("sig_vars", {}).values() for n in sig}
    tally = {d: 0 for d in DISPOSITIONS}
    tally["unassigned"] = 0

    for node in nodes:
        nid = node.get("id")
        subject = f"inventory node {nid!r}"
        if not nid:
            rep.error("X6", "surface-inventory.json", "a node has no id")
            continue
        disp = node.get("disposition")
        if disp not in DISPOSITIONS:
            rep.error("X6", subject, f"disposition {disp!r} must be one of {sorted(DISPOSITIONS)}; a node nobody "
                                     "decided about is the shape of a silently narrow clone")
            tally["unassigned"] += 1
            continue
        tally[disp] += 1

        if disp == "behavioural" and fsm_ctx:
            ref = node.get("fsm_node_id")
            if not ref:
                rep.error("X6", subject, "disposition is behavioural but no fsm_node_id is named")
            elif ref not in page_ids and ref not in action_ids and ref not in sig_names:
                rep.error("X6", subject, f"fsm_node_id {ref!r} names no FSM page, action, or signature variable")
        if disp == "excluded" and node.get("boundary_treatment") not in {"target_like_unavailable_state", "consistently_removed"}:
            rep.error("X6", subject, "excluded node declares no boundary_treatment, so an inbound affordance is left dangling")
        if disp == "exempt" and not str(node.get("exempt_reason", "")).strip():
            rep.error("X6", subject, "exempt node declares no reason")
        if disp == "static" and node.get("scope_class") not in SCOPE_CLASSES:
            rep.warn("X6", subject, "static node has no scope class; it will still be built and compared, but it "
                                    "will not appear in scope-class coverage counts")

    if fsm_ctx:
        referenced = {n.get("fsm_node_id") for n in nodes if n.get("disposition") == "behavioural"}
        for pid in sorted(page_ids - referenced):
            rep.warn("X6", f"page {pid!r}", "FSM declares this page but no inventory node maps to it; either "
                                            "reconnaissance missed it or the model invented it")
    return tally


def check_cross(spec_ctx: dict, fsm_ctx: dict, rep: Report) -> None:
    spec_pages = spec_ctx["page_ids"]
    fsm_pages = fsm_ctx["page_ids"]
    for pid in sorted(spec_pages - fsm_pages):
        rep.error("X1", f"page {pid!r}", "declared in the specification and absent from the FSM")
    for pid in sorted(fsm_pages - spec_pages):
        rep.error("X1", f"page {pid!r}", "declared in the FSM and absent from the specification")

    referenced_ops = {
        (a.get("durable_effect") or {}).get("operation")
        for a in fsm_ctx["actions"].values()
        if (a.get("durable_effect") or {}).get("kind") == "write"
    }
    referenced_ops.discard(None)
    for oid in sorted(set(spec_ctx["write_ops"]) - referenced_ops):
        rep.error("X2", f"operation {oid!r}", "specification write operation referenced by no FSM action, so no visible action performs it")

    assigned_reads: set[str] = set()
    for page in (spec_ctx.get("spec_pages") or []):
        for oid in page.get("operations") or []:
            assigned_reads.add(oid)
    read_ops = {o["id"] for o in spec_ctx["operations"] if o.get("kind") == "read" and o.get("id")}
    for oid in sorted(read_ops - assigned_reads):
        rep.error("X3", f"operation {oid!r}", "read operation assigned to no page")

    for pid in sorted(spec_pages & fsm_pages):
        spec_scope = spec_ctx["page_scope"].get(pid)
        fsm_scope = (fsm_ctx["pages"].get(pid) or {}).get("scope_class")
        if spec_scope != fsm_scope:
            rep.error("X4", f"page {pid!r}", f"scope class disagrees: specification {spec_scope!r}, FSM {fsm_scope!r}")

    touched_entities: set[str] = set()
    for oid in referenced_ops:
        op = next((o for o in spec_ctx["operations"] if o.get("id") == oid), None)
        if op:
            touched_entities.update(op.get("reads") or [])
            touched_entities.update(op.get("writes") or [])
    for page in (spec_ctx.get("spec_pages") or []):
        for oid in page.get("operations") or []:
            op = next((o for o in spec_ctx["operations"] if o.get("id") == oid), None)
            if op:
                touched_entities.update(op.get("reads") or [])
                touched_entities.update(op.get("writes") or [])
    for ent in spec_ctx["entities"]:
        name = ent.get("name")
        if name and name not in touched_entities and not ent.get("reference_only"):
            rep.error("X5", f"entity {name!r}", "touched by no operation reachable from any page; mark it reference_only or give it an operation")


# --------------------------------------------------------------------------------------
# Bounded state enumeration and canonical traversals
# --------------------------------------------------------------------------------------

def abstract_domains(fsm_ctx: dict) -> dict[str, dict[str, list]]:
    """Per page, the abstract value set of each signature variable.

    Finite by construction: the default, every literal value an effect assigns, and an opaque
    marker when a non-literal effect (increment, toggle, typed text) can move it. This is an
    abstraction, not the real state space, and it is what keeps enumeration deterministic.
    """
    domains: dict[str, dict[str, list]] = {}
    for pid, sig in fsm_ctx["sig_vars"].items():
        domains[pid] = {}
        for vname, var in sig.items():
            if not isinstance(var, dict):
                continue
            values = [json.dumps(var.get("default"), sort_keys=True, default=str)]
            domains[pid][vname] = values
    for aid, act in fsm_ctx["actions"].items():
        for eff in act.get("effects") or []:
            vname = path_var(eff.get("path", ""))
            applies_to = eff.get("applies_to", "from")
            pid = act.get("to_page_id") if (act.get("is_navigation") and applies_to == "destination") else act.get("from")
            if pid not in domains or vname not in domains.get(pid, {}):
                continue
            if eff.get("op") == "assign" and "value" in eff:
                token = json.dumps(eff["value"], sort_keys=True, default=str)
            elif eff.get("op") == "reset":
                token = domains[pid][vname][0]
            else:
                token = OPAQUE
            if token not in domains[pid][vname]:
                domains[pid][vname].append(token)
    return domains


def initial_signature(fsm_ctx: dict, pid: str) -> tuple:
    sig = fsm_ctx["sig_vars"].get(pid, {})
    return tuple(sorted((n, json.dumps(v.get("default"), sort_keys=True, default=str)) for n, v in sig.items() if isinstance(v, dict)))


def precondition_holds(state_sig: dict, clause: dict) -> bool:
    """Abstract satisfaction. An opaque value satisfies anything, because the abstraction cannot
    rule the transition out; this keeps enumeration conservative rather than optimistic."""
    vname = path_var(clause.get("path", ""))
    if vname is None or vname not in state_sig:
        return True
    actual = state_sig[vname]
    if actual == OPAQUE:
        return True
    op = clause.get("op")
    expected = json.dumps(clause.get("value"), sort_keys=True, default=str)
    if op == "==":
        return actual == expected
    if op == "!=":
        return actual != expected
    if op == "in":
        vals = clause.get("value") or []
        return actual in [json.dumps(v, sort_keys=True, default=str) for v in vals] if isinstance(vals, list) else True
    if op == "not_in":
        vals = clause.get("value") or []
        return actual not in [json.dumps(v, sort_keys=True, default=str) for v in vals] if isinstance(vals, list) else True
    if op == "is_empty":
        return actual in ('""', "[]", "{}", "null")
    if op == "is_not_empty":
        return actual not in ('""', "[]", "{}", "null")
    return True


def apply_effects(fsm_ctx: dict, act: dict, sig_from: dict) -> tuple[str, dict]:
    is_nav = bool(act.get("is_navigation"))
    dest = act.get("to_page_id") if is_nav else act.get("from")
    if is_nav:
        base = dict(initial_signature(fsm_ctx, dest))
        for name, value in sig_from.items():
            if name in base:
                base[name] = value  # Carry(sigma'): same-named variables persist.
    else:
        base = dict(sig_from)
    for eff in act.get("effects") or []:
        vname = path_var(eff.get("path", ""))
        applies_to = eff.get("applies_to", "from")
        target = dest if (is_nav and applies_to == "destination") else (act.get("from") if not is_nav else act.get("from"))
        if is_nav and applies_to != "destination":
            continue  # An effect on the source signature is discarded by leaving the page.
        if vname is None or vname not in base:
            continue
        if eff.get("op") == "assign" and "value" in eff:
            base[vname] = json.dumps(eff["value"], sort_keys=True, default=str)
        elif eff.get("op") == "reset":
            defaults = dict(initial_signature(fsm_ctx, target or dest))
            base[vname] = defaults.get(vname, OPAQUE)
        else:
            base[vname] = OPAQUE
    return dest, base


def enumerate_states(fsm_ctx: dict, rep: Report) -> dict:
    meta = fsm_ctx["meta"]
    bounds = meta.get("traversal_bounds") or {}
    max_states = int(bounds.get("max_states", DEFAULT_MAX_STATES))
    max_depth = int(bounds.get("max_depth", DEFAULT_MAX_DEPTH))
    initial = meta.get("initial_page_id")
    if initial not in fsm_ctx["page_ids"]:
        return {"reachable_states": 0, "bound_hit": False, "action_coverage": {}, "goal_traversals": {}, "unreachable_actions": sorted(fsm_ctx["actions"])}

    start = (initial, initial_signature(fsm_ctx, initial))
    seen = {start: []}
    queue = deque([(start, 0)])
    bound_hit = False
    action_coverage: dict[str, list[str]] = {}

    while queue:
        (pid, sig_t), depth = queue.popleft()
        sig = dict(sig_t)
        path = seen[(pid, sig_t)]
        for aid in (fsm_ctx["pages"].get(pid) or {}).get("actions") or []:
            act = fsm_ctx["actions"].get(aid)
            if not act:
                continue
            if not all(precondition_holds(sig, c) for c in act.get("preconditions") or []):
                continue
            if aid not in action_coverage:
                action_coverage[aid] = path + [aid]
            if depth >= max_depth:
                bound_hit = True
                continue
            dest, new_sig = apply_effects(fsm_ctx, act, sig)
            if dest not in fsm_ctx["page_ids"]:
                continue
            key = (dest, tuple(sorted(new_sig.items())))
            if key in seen:
                continue
            if len(seen) >= max_states:
                bound_hit = True
                continue
            seen[key] = path + [aid]
            queue.append((key, depth + 1))

    unreachable = sorted(set(fsm_ctx["actions"]) - set(action_coverage))
    for aid in unreachable:
        rep.error("F21", f"action {aid!r}", "not applicable in any reachable state within the declared traversal bounds; it is unreachable, mis-gated, or the bounds are too tight")

    goal_traversals: dict[str, dict] = {}
    for goal in fsm_ctx["goals"]:
        gid = goal.get("id")
        required = [a for a in (goal.get("requires_actions") or []) if a in fsm_ctx["actions"]]
        if not required:
            goal_traversals[gid] = {"reachable": None, "reason": "no requires_actions declared; reachability not computable"}
            rep.warn("F5", f"goal {gid!r}", "declares no requires_actions, so goal reachability cannot be checked structurally")
            continue
        covered_all = frozenset(required)
        gstart = (start, frozenset())
        gseen = {gstart: []}
        gq = deque([(gstart, 0)])
        found = None
        while gq and found is None:
            ((state, covered), depth) = gq.popleft()
            pid, sig_t = state
            sig = dict(sig_t)
            gpath = gseen[(state, covered)]
            for aid in (fsm_ctx["pages"].get(pid) or {}).get("actions") or []:
                act = fsm_ctx["actions"].get(aid)
                if not act:
                    continue
                if not all(precondition_holds(sig, c) for c in act.get("preconditions") or []):
                    continue
                new_covered = covered | {aid} if aid in covered_all else covered
                if new_covered == covered_all:
                    found = gpath + [aid]
                    break
                if depth >= max_depth:
                    bound_hit = True
                    continue
                dest, new_sig = apply_effects(fsm_ctx, act, sig)
                if dest not in fsm_ctx["page_ids"]:
                    continue
                nkey = ((dest, tuple(sorted(new_sig.items()))), new_covered)
                if nkey in gseen or len(gseen) >= max_states:
                    if len(gseen) >= max_states:
                        bound_hit = True
                    continue
                gseen[nkey] = gpath + [aid]
                gq.append((nkey, depth + 1))
        if found is None:
            rep.error("F5", f"goal {gid!r}", f"no traversal within the declared bounds performs all required actions {required}")
            goal_traversals[gid] = {"reachable": False, "required_actions": required}
        else:
            goal_traversals[gid] = {"reachable": True, "length": len(found), "path": found}

    return {
        "reachable_states": len(seen),
        "bound_hit": bound_hit,
        "max_states": max_states,
        "max_depth": max_depth,
        "action_coverage": action_coverage,
        "goal_traversals": goal_traversals,
        "unreachable_actions": unreachable,
    }


# --------------------------------------------------------------------------------------
# Metrics
# --------------------------------------------------------------------------------------

def build_metrics(spec: dict | None, spec_ctx: dict | None, fsm: dict | None, fsm_ctx: dict | None, enum: dict | None) -> dict:
    metrics: dict = {}
    if spec is not None and spec_ctx is not None:
        levels = {"A": 0, "B": 0, "C": 0, "missing": 0}

        def tally(node):
            lvl = (node.get("evidence") or {}).get("level") if isinstance(node, dict) else None
            levels[lvl if lvl in levels else "missing"] += 1

        for ent in spec_ctx["entities"]:
            tally(ent)
            for f in ent.get("fields") or []:
                tally(f)
        for op in spec_ctx["operations"]:
            tally(op)
        for page in spec.get("pages") or []:
            tally(page)
        metrics["spec"] = {
            "spec_version": spec.get("spec_version"),
            "entities": len(spec_ctx["entities"]),
            "fields": sum(len(e.get("fields") or []) for e in spec_ctx["entities"]),
            "relationships": len(spec.get("relationships") or []),
            "operations": len(spec_ctx["operations"]),
            "write_operations": len(spec_ctx["write_ops"]),
            "pages": len(spec.get("pages") or []),
            "pages_by_scope": {
                s: sum(1 for v in spec_ctx["page_scope"].values() if v == s) for s in sorted(SCOPE_CLASSES)
            },
            "actors": len(spec.get("actors") or []),
            "assumptions_total": len(spec.get("assumptions") or []),
            "assumptions_open": sum(1 for a in spec.get("assumptions") or [] if a.get("status", "open") == "open"),
            "declared_collections": sum(len(p.get("density") or []) for p in (spec.get("pages") or [])),
            "declared_empty_pages": sum(1 for p in (spec.get("pages") or []) if p.get("declared_empty")),
            "total_declared_min_rows": sum(
                e.get("min_rows", 0) for p in (spec.get("pages") or []) for e in (p.get("density") or [])
            ),
            "lowest_floor": min(
                [e.get("min_rows", 0) for p in (spec.get("pages") or []) for e in (p.get("density") or [])] or [0]
            ),
            "evidence_distribution": levels,
        }
    if fsm is not None and fsm_ctx is not None:
        sig_total = sum(len(s) for s in fsm_ctx["sig_vars"].values())
        durable = sum(
            1 for s in fsm_ctx["sig_vars"].values() for v in s.values()
            if isinstance(v, dict) and (v.get("backing") or {}).get("kind") == "durable"
        )
        out_degree = {}
        for pid in fsm_ctx["page_ids"]:
            out_degree[pid] = len((fsm_ctx["pages"].get(pid) or {}).get("actions") or [])
        nav = sum(1 for a in fsm_ctx["actions"].values() if a.get("is_navigation"))
        exempt_pages = [pid for pid, p in fsm_ctx["pages"].items() if p.get("model_exempt")]
        core_pages = [pid for pid, p in fsm_ctx["pages"].items() if p.get("scope_class") == "Core"]
        exempt_core = [pid for pid in exempt_pages if pid in core_pages]
        levels = {"A": 0, "B": 0, "C": 0, "missing": 0}
        core_above_a = 0
        for pid, page in fsm_ctx["pages"].items():
            lvl = (page.get("evidence") or {}).get("level")
            levels[lvl if lvl in levels else "missing"] += 1
            if page.get("scope_class") == "Core" and lvl != "A":
                core_above_a += 1
            for v in fsm_ctx["sig_vars"].get(pid, {}).values():
                lvl = (v.get("evidence") or {}).get("level") if isinstance(v, dict) else None
                levels[lvl if lvl in levels else "missing"] += 1
        for aid, act in fsm_ctx["actions"].items():
            lvl = (act.get("evidence") or {}).get("level")
            levels[lvl if lvl in levels else "missing"] += 1
            if (fsm_ctx["pages"].get(act.get("from")) or {}).get("scope_class") == "Core" and lvl != "A":
                core_above_a += 1
        metrics["fsm"] = {
            "fsm_version": fsm.get("fsm_version"),
            "pages": len(fsm_ctx["page_ids"]),
            "pages_by_scope": {
                s: sum(1 for p in fsm_ctx["pages"].values() if p.get("scope_class") == s) for s in sorted(SCOPE_CLASSES)
            },
            "signature_variables": sig_total,
            "signature_durable": durable,
            "signature_transient": sig_total - durable,
            "actions": len(fsm_ctx["actions"]),
            "navigation_actions": nav,
            "intra_page_actions": len(fsm_ctx["actions"]) - nav,
            "write_actions": len(fsm_ctx["write_actions"]),
            "goals": len(fsm_ctx["goals"]),
            "mean_out_degree": round(sum(out_degree.values()) / len(out_degree), 2) if out_degree else 0,
            "max_out_degree": max(out_degree.values()) if out_degree else 0,
            "unique_selectors": len(fsm_ctx["selectors"]),
            "exempt_pages": len(exempt_pages),
            "exempt_core_pages": len(exempt_core),
            "exempt_core_share": round(len(exempt_core) / len(core_pages), 3) if core_pages else 0,
            "evidence_distribution": levels,
            "core_nodes_above_level_a": core_above_a,
        }
    if enum is not None:
        cov = enum.get("action_coverage") or {}
        goal_t = enum.get("goal_traversals") or {}
        metrics["traversal"] = {
            "reachable_states_bounded": enum.get("reachable_states"),
            "bound_hit": enum.get("bound_hit"),
            "max_states": enum.get("max_states"),
            "max_depth": enum.get("max_depth"),
            "actions_covered": len(cov),
            "actions_unreachable": len(enum.get("unreachable_actions") or []),
            "canonical_action_traversals": len(cov),
            "canonical_action_steps": sum(len(p) for p in cov.values()),
            "goals_reachable": sum(1 for g in goal_t.values() if g.get("reachable") is True),
            "goals_unreachable": sum(1 for g in goal_t.values() if g.get("reachable") is False),
            "goals_uncheckable": sum(1 for g in goal_t.values() if g.get("reachable") is None),
            "goal_traversal_lengths": {k: v.get("length") for k, v in goal_t.items() if v.get("length")},
        }
    return metrics


def main() -> int:
    ap = argparse.ArgumentParser(description="Validate target-spec.json and fsm.json for the model-first cloning protocol.")
    ap.add_argument("--spec", help="path to target-spec.json")
    ap.add_argument("--fsm", help="path to fsm.json")
    ap.add_argument("--inventory", help="path to surface-inventory.json (enables the X6 breadth check)")
    ap.add_argument("--out", help="path to write model-validation.json")
    ap.add_argument("--quiet", action="store_true", help="suppress the human-readable summary")
    args = ap.parse_args()

    if not args.spec and not args.fsm:
        print("error: pass --spec, --fsm, or both", file=sys.stderr)
        return 2
    if args.inventory and not args.spec:
        print("error: --inventory needs --spec", file=sys.stderr)
        return 2

    rep = Report()
    spec = fsm = inventory = None
    spec_ctx = fsm_ctx = enum = inv_tally = None

    try:
        if args.spec:
            with open(args.spec, encoding="utf-8") as fh:
                spec = json.load(fh)
        if args.fsm:
            with open(args.fsm, encoding="utf-8") as fh:
                fsm = json.load(fh)
        if args.inventory:
            with open(args.inventory, encoding="utf-8") as fh:
                inventory = json.load(fh)
    except (OSError, json.JSONDecodeError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2

    if spec is not None:
        if spec.get("schema") != "target-spec.json/v1":
            rep.error("S0", "schema", f"expected target-spec.json/v1, found {spec.get('schema')!r}")
        spec_ctx = check_spec(spec, rep)
        spec_ctx["spec_pages"] = spec.get("pages") or []

    if fsm is not None:
        if fsm.get("schema") != "fsm.json/v1":
            rep.error("F0", "schema", f"expected fsm.json/v1, found {fsm.get('schema')!r}")
        fsm_ctx = check_fsm(fsm, rep, spec_ctx)
        enum = enumerate_states(fsm_ctx, rep)

    if spec is not None and fsm is not None:
        if spec.get("spec_version") != fsm.get("spec_version"):
            rep.error("X0", "spec_version", f"FSM was extracted against spec_version {fsm.get('spec_version')!r} but the specification is version {spec.get('spec_version')!r}")
        if spec.get("clone_id") != fsm.get("clone_id"):
            rep.error("X0", "clone_id", "the two artifacts name different clones")
        check_cross(spec_ctx, fsm_ctx, rep)

    if inventory is not None and spec_ctx is not None:
        inv_tally = check_inventory(inventory, spec_ctx, fsm_ctx, rep)

    metrics = build_metrics(spec, spec_ctx, fsm, fsm_ctx, enum)
    if inv_tally is not None:
        metrics["inventory"] = inv_tally
    result = {
        "schema": "model-validation.json/v1",
        "spec_path": args.spec,
        "fsm_path": args.fsm,
        "result": "PASS" if not rep.errors else "FAIL",
        "error_count": len(rep.errors),
        "warning_count": len(rep.warnings),
        "errors": rep.errors,
        "warnings": rep.warnings,
        "metrics": metrics,
        "canonical_traversals": {
            "action_coverage": (enum or {}).get("action_coverage", {}),
            "goals": (enum or {}).get("goal_traversals", {}),
        },
    }

    if args.out:
        try:
            with open(args.out, "w", encoding="utf-8") as fh:
                json.dump(result, fh, indent=2, sort_keys=False)
                fh.write("\n")
        except OSError as exc:
            print(f"error: could not write {args.out}: {exc}", file=sys.stderr)
            return 2

    if not args.quiet:
        print(f"{result['result']}  errors={len(rep.errors)}  warnings={len(rep.warnings)}")
        for e in rep.errors:
            print(f"  ERROR [{e['check']}] {e['subject']}: {e['message']}")
        for w in rep.warnings:
            print(f"  WARN  [{w['check']}] {w['subject']}: {w['message']}")
        if metrics.get("fsm"):
            m = metrics["fsm"]
            t = metrics.get("traversal", {})
            print(
                f"  model: {m['pages']} pages, {m['signature_variables']} signature vars "
                f"({m['signature_durable']} durable), {m['actions']} actions "
                f"({m['write_actions']} write), {m['goals']} goals; "
                f"{t.get('reachable_states_bounded')} bounded states"
                + (" (BOUND HIT)" if t.get("bound_hit") else "")
            )

    return 1 if rep.errors else 0


if __name__ == "__main__":
    sys.exit(main())
