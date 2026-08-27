# KPC Operations

An end-to-end Petroleum Operations Platform for Kenya Pipeline Company (KPC) — built on [Frappe](https://frappeframework.com) and integrated with standard ArcApps Accounts and Stock.

It tracks physical petroleum cargo from vessel arrival through to financial posting, across 13 steps, with an integrated AI predictive-maintenance event during pipeline movement. A single **Golden Thread** ID (`journey_ref`) is enforced on every transaction in the chain, so any cargo can be traced end to end.

**New to the business, not just the code?** See [`BUSINESS_GUIDE.md`](BUSINESS_GUIDE.md) — it explains the petroleum-operations concepts behind the workflow (standard volume/VCF, interface cuts, reconciliation tolerance, credit/stock checks, ...) and, doctype by doctype, what every field actually means and why the app asks for it. This document (`README.md`) is the technical/architecture record of what was built; that one is the functional/business explainer.

## The Golden Thread

Every transaction doctype in this app carries a mandatory `journey_ref` — a `Link` to a **Journey** record, not a free-text string. `Journey` is the golden-thread master: it's created automatically the moment an `Oil Shipment` is first saved, and every subsequent step appends an audit row to its `journey_log` child table via one shared helper:

```python
from kpc.petroleum_operations.utils import log_journey_step

log_journey_step(self.journey_ref, "7. Movement", self)
```

A `Journey` is read-only and system-maintained — nobody edits it by hand. Open any `Journey` record to see the complete, ordered history of every document raised against that cargo, from the originating `Oil Shipment` all the way to the `Financial Posting` that closed it out.

## The 13-Step Workflow

| # | Step | DocType(s) |
|---|------|-----------|
| 1 | Shipment | `Oil Shipment` |
| 2 | Receipt | `Tank Measurement` |
| 3 | Quality Result | `Quality Result` |
| 4 | Inventory Position | `Inventory Position` |
| 5 | Nomination | `Nomination` |
| 6 | Batch | `Pipeline Batch` |
| 7 | Movement (+ AI) | `Movement`, `OT Telemetry Log`, `AI Alert`, `AI Prediction`, `AI Recommendation`, `Maintenance Work Order` |
| 8 | Terminal Receipt | `Terminal Receipt` (creates a real ArcApps Material Transfer `Stock Entry`) |
| 9 | Reconciliation | `Reconciliation`, `Variance` (a recognised loss creates a Material Issue `Stock Entry`) |
| 10 | Allocation | `Allocation` |
| 11 | Dispatch | `Dispatch` (creates a real ArcApps `Delivery Note`) |
| 12 | Invoice | `Invoice` (creates a real ArcApps `Sales Invoice`, billed against the Dispatch's Delivery Note) |
| 13 | Financial Posting | `Financial Posting` (system-generated, mirrors the Sales Invoice's GL posting) |

Supporting masters that aren't part of the numbered sequence: `Terminal`, `Oil Tank` (each auto-provisions a matching ArcApps `Warehouse`), `Capacity Assessment`, `Tariff`, `Product Compatibility`, `Plant Asset`, `Employee Certification` (see Phase 5 below), plus **Product**, which is not a separate doctype — it's the standard ArcApps `Item` extended with petroleum-specific custom fields (`density_at_15c`, `reference_temperature_c`, `api_gravity`, `is_petroleum_product`).

### Walking through the workflow, step by step

Written for someone using the app, not just reading its code: what to create, in what order, who normally does it, and what has to be true already before the system will let you move on. Every step below shares one `journey_ref` — the Golden Thread ID that first appears at Step 1 and rides along, unchangeable, all the way to Step 13. For *why* each field exists — the underlying petroleum-operations business concepts (standard volume, interface cuts, reconciliation tolerance, and so on) — see [`BUSINESS_GUIDE.md`](BUSINESS_GUIDE.md), which walks the same 13 steps at the field level.

1. **Shipment — create an `Oil Shipment`.** The starting point: a Terminal Operator records a vessel (name, product, nominated quantity) the moment it's expected or arrives. Saving it silently creates the `Journey` behind the scenes — you don't create that yourself. The Shipment then moves through its own mini-workflow as the vessel physically progresses: **Draft → Vessel Arrived → Discharging → Received**, each transition timestamped automatically. Nothing downstream can start until a Shipment exists.
2. **Receipt — create a `Tank Measurement`.** Once product is flowing into a tank, a Terminal Operator takes a dip reading (level, temperature, density) and records it here, tagged to the same tank and Shipment. A **Closing** reading is the one that counts as "received" — it calculates a standard volume at 15°C and, behind the scenes, posts a real stock receipt into that tank's warehouse. You can't measure into a tank that's under Maintenance or Quarantine.
3. **Quality Result — create a `Quality Result`.** A lab technician (Quality Analyst) enters the sample's parameters (density, sulphur, etc.) against spec. The record starts **Pending**; a *different* person with the Quality Manager role then reviews it and decides **Accepted** or **Quarantined** — the same person can't do both steps for the same result. A Quarantined result locks the sampled tank. Nothing can be nominated for sale (Step 5) until its Quality Result is Accepted.
4. **Inventory Position — create an `Inventory Position`.** A running snapshot of how much of a product is sitting in a tank right now (opening + receipts − dispatches). The first one, right after Receipt, is created the same way as everything else here — a person records the origin tank's opening position off the Tank Measurement's volume. After that, later positions (at Terminal Receipt and Dispatch) are appended automatically by the system as stock actually moves, each one carrying forward the previous closing balance as its own opening — you only create this one by hand.
5. **Nomination — create a `Nomination`.** A Commercial Officer records a customer's order against a specific, quality-released parcel. Submitting it ("accepting" the order) automatically checks the customer's **credit limit** and that there's genuinely enough **stock on hand** for that journey — either check failing blocks the submit outright, no manual override.
6. **Batch — create a `Pipeline Batch`** (optionally after a `Capacity Assessment` for that route/period). A Scheduler turns an accepted Nomination into a scheduled pumping slot, giving it a position in the pumping sequence (**Pumping Sequence No**). The system checks the batch doesn't over-commit the Nomination's quantity or the route's pipeline capacity, and — importantly — checks the **Product Compatibility** matrix against whichever batch is scheduled immediately before/after it on the same route: an outright incompatible pairing is blocked, and a pairing that merely needs an interface cut won't submit until you've entered a large-enough cut volume.
7. **Movement (+ AI) — create a `Movement`.** The actual pumping run. A Scheduler/Terminal Operator tracks its status (Draft → In Transit → Completed/Halted) and either types in telemetry readings directly or, more realistically, lets pressure/flow/vibration arrive automatically via `OT Telemetry Log` (a read-only ingest point — see the OT Safety Boundary above). A reading outside the safe envelope automatically raises an `AI Alert` → `AI Prediction` → a draft `AI Recommendation`. **Nothing happens to equipment on its own**: a human with the Maintenance Manager role has to explicitly Approve (or Reject) the recommendation before a `Maintenance Work Order` can be raised from it — and that approval is written permanently to the Decision Ledger. A hazardous repair job additionally needs a `Permit to Work` issued to a specific Employee holding the right, current certification before it can proceed.
8. **Terminal Receipt — create a `Terminal Receipt`.** The pipeline movement's arrival: another dip reading, this time at the destination tank, which posts a real stock transfer from the origin tank's warehouse to the destination's.
9. **Reconciliation — create a `Reconciliation`.** Compares what was dispatched against what actually arrived. The acceptable variance (**tolerance**) isn't a policy number you set — it's calculated automatically from the measurement uncertainty of the two dip readings that bracket the journey. If the variance is outside that tolerance, submitting is blocked until you provide a written **justification**; doing so is itself logged to the Decision Ledger as an override, not silently allowed. Any recognised physical loss is then followed up with a `Variance` record — created separately, classifying the loss (e.g. evaporation, measurement tolerance, theft) — which a second person has to Approve or Reject before it's considered resolved.
10. **Allocation — create an `Allocation`.** Once Reconciliation confirms what actually arrived, a Commercial Officer assigns (allocates) that confirmed volume to a specific Nomination/customer — this is the moment KPC-custody stock becomes customer-owned stock, on paper.
11. **Dispatch — create a `Dispatch`.** The delivery itself. Submitting it creates and submits a real ArcApps **Delivery Note** in the same step — this *is* the delivery chalan a driver takes with the load; there's no separate manual step to raise one.
12. **Invoice — create an `Invoice`.** A Commercial or Finance Officer adds one line per Dispatch, each priced against an active `Tariff`, and submits. This creates and submits a real ArcApps **Sales Invoice**, billed against the Dispatch's own Delivery Note quantity — you can't invoice more than was actually delivered.
13. **Financial Posting — nothing to create.** The system raises this automatically the moment the Invoice is submitted, mirroring the Sales Invoice's own GL posting so the Golden Thread has a record of it. If the Invoice is ever cancelled, this flips to **Reversed** automatically too.

**The short version of "what do I create first":** Shipment → Tank Measurement → Quality Result → Inventory Position → Nomination → Pipeline Batch → Movement → Terminal Receipt → Reconciliation (+ Variance) → Allocation → Dispatch → Invoice → (Financial Posting happens automatically). Every arrow is enforced by the system, not just convention — you genuinely cannot create most of these out of order; the ones you'd try first will simply refuse to submit and tell you what's missing.

## Phase 1 Hardening: write-once journey_ref, Product Compatibility, RBAC

A follow-up pass over Steps 1–4 (Inbound Logistics & Storage) toward a larger, security-and-safety-focused spec. Everything below is implemented and verified against live demo data on this codebase; later phases of that spec (OT ingest boundary, combined measurement uncertainty, EAM/HSEQ, AI Decision Ledger, and the global "owner cannot approve their own document" SoD hook) are **not yet started** and will land in dedicated follow-up passes.

- **`journey_ref` is write-once, not just read-only in the UI.** `kpc.petroleum_operations.utils.assert_journey_ref_immutable(doc)` compares the incoming value against the DB value on every `validate()` and throws if they differ, on *any* document that isn't new — closing the gap where `read_only` alone only stops the desk form, not `frappe.get_doc(...).save(ignore_permissions=True)` from a script or API call. Wired into `Oil Shipment`, `Tank Measurement`, `Quality Result`, and `Inventory Position`. (On an already-submitted document, Frappe's own `UpdateAfterSubmitError` typically fires first since `journey_ref` isn't `allow_on_submit` — the custom guard is what actually stops a change on a still-draft document, which submit-immutability doesn't cover.)
- **`Product Compatibility`** — a new master doctype recording pipeline batch-adjacency rules between two Products (`Item`s): `Compatible` (default, open-world — an unlisted pair is assumed compatible), `Requires Interface Cut` (with a mandatory `minimum_interface_cut_kl`), or `Incompatible`. A/B and B/A are the same rule — creating the reverse pair a second time is blocked. Look it up via `kpc.petroleum_operations.utils.get_product_compatibility(product_a, product_b)`, which checks both orderings and returns the open-world default when no rule exists. Not yet enforced anywhere — Phase 2 wires this into `Pipeline Batch` to block prohibited product adjacencies.
- **RBAC: no System Manager submit/cancel on `Tank Measurement`.** First doctype brought in line with "Administrators must have zero transactional approval rights" — System Manager keeps read/write/create/delete/report/etc. but not `submit`/`cancel`. The same sweep across the rest of the doctypes built so far (and the general "an owner can't approve their own document" SoD hook) is Phase 6 scope, not done yet.

## Phase 2 Hardening: Product Compatibility enforcement, write-once on Nomination/Pipeline Batch, RBAC

Covers Steps 5–6 (Commercial Planning). `Nomination`'s credit-limit and stock-ownership checks (`validate_credit_limit`, `validate_stock_ownership`, both hard-blocking at `before_submit`) already existed from the original build and needed no changes for this spec. What's new:

- **`Product Compatibility` is now enforced, not just recorded.** `Pipeline Batch.validate_product_adjacency()` looks up the immediate previous and next batch by `batch_sequence_no` on the same origin/destination route (the same route-scoping `Capacity Assessment` already uses) and calls `get_product_compatibility()` against each neighbour:
  - `Incompatible` → hard-blocks the save outright.
  - `Requires Interface Cut` → blocks the save unless the new `interface_cut_kl` field meets the rule's `minimum_interface_cut_kl`.
  - An unlisted pair, or no neighbour at that end of the sequence, passes through untouched.
  - `batch_sequence_no` is now `reqd: 1` — adjacency can't be evaluated without a real position in the pumping sequence.
- **`journey_ref` write-once guard** extended to `Nomination` (a directly-editable Link field there) and `Pipeline Batch` (fetch_from `nomination.journey_ref` — the guard catches an attempt to swap `nomination` itself on a draft batch, which would otherwise silently drag `journey_ref` along via the fetch).
- **RBAC:** System Manager submit/cancel removed from `Nomination` and `Pipeline Batch`, same pattern as `Tank Measurement` in Phase 1.

Verified with a 9/9 live-data check: incompatible adjacency blocked, missing/sufficient interface cut volume, write-once on both doctypes, and the four DocPerm assertions — then rolled back with no residue, followed by a full re-run of the existing `demo_data.create_demo_data` 13-step flow end to end to confirm nothing already-seeded regressed under the new `batch_sequence_no` and adjacency rules.

## Phase 3 Hardening: OT Telemetry Log, the OT Safety Boundary, write-once, RBAC

Covers Steps 7–8 (Pipeline Operations & OT Ingest).

- **`OT Telemetry Log`** — a new doctype for secure telemetry ingest from field instrumentation / a SCADA historian, linked to a `Movement` (and, via `fetch_from`, its `journey_ref`). This is where the brief's **OT Safety Boundary** requirement is actually implemented, at more than one layer so it can't be bypassed by a script:
  - **Schema:** the doctype has no field representing a setpoint, command, or actuator target — only sensor readings (`pressure_bar`, `flow_rate_m3h`, `vibration_mm_s`) and ingest metadata (`source_tag`, `ingest_channel`, `reading_datetime`). There is nothing to write back to a control system even if someone tried.
  - **Permissions:** no role — not even System Manager — has `write` or `delete` on this doctype. A reading can be created and read; it can never be edited or erased through the desk.
  - **Server-side:** `assert_document_immutable()` (new, generalised utility) throws on *any* save of an existing document, closing the same "script with `ignore_permissions=True`" gap that `assert_journey_ref_immutable()` closes for write-once fields elsewhere — except here the whole document is frozen, not just one field.
  - **Integration surface:** `kpc.petroleum_operations.doctype.ot_telemetry_log.ot_telemetry_log.ingest_reading()` is the one recommended entrypoint for a real SCADA/historian bridge — it accepts sensor values in and returns a document name; there is no corresponding update/delete API, and none is planned.
  - Ingesting a reading independently runs the same anomaly scoring as Movement and can raise its own `AI Alert` — see next point.
- **`assess_pipeline_anomaly` / AI Alert creation is now shared, not duplicated.** The dedup-and-create logic that used to live only inside `Movement.raise_ai_alert_if_needed` moved to `kpc.petroleum_operations.utils.raise_ai_alert()`, so both `Movement` (telemetry typed directly onto the movement record) and `OT Telemetry Log` (secure ingest) funnel through the identical rule ("don't raise a second Alert while one is already Open for this Movement") and produce identically-shaped `AI Alert` records regardless of which one observed the breach. Movement's own behaviour is unchanged — re-verified against a real breach after the refactor.
- **`journey_ref` write-once guard** extended to `Movement` (catches a `pipeline_batch` swap dragging `journey_ref` along via fetch) and `Terminal Receipt` (same pattern, via `movement`).
- **RBAC:** System Manager submit/cancel removed from `Terminal Receipt`, matching the pattern from Phases 1–2.
- **Workspace correction found and fixed along the way:** the `KPC` workspace's on-disk fixture (`kpc/petroleum_operations/workspace/kpc/kpc.json`) had drifted out of date — it was missing an entire "ArcApps Integration (Accounts & Stock)" card that already existed in the live site's Workspace record from earlier work. `bench migrate` does not push that file over an existing customized Workspace, so the drift was silent. Re-exported the file from the live DB (`frappe.modules.export_file.export_to_files`) before adding this phase's two new links (`Product Compatibility`, `OT Telemetry Log`), so the file is now the source of truth again for both existing and new content.

Verified with a 14-check live-data run (write-once on Movement/Terminal Receipt, RBAC on Terminal Receipt and OT Telemetry Log, a normal ingested reading, immutability-after-insert, a breach reading correctly raising an AI Alert with the right `journey_ref`, and a structural scan confirming no setpoint/command-shaped field exists on `OT Telemetry Log`), plus a separate targeted re-run of Movement's own breach-detection path to confirm the shared-helper refactor didn't change its behaviour — both rolled back with no residue.

## Phase 4 Hardening: combined measurement uncertainty, write-once, RBAC

Covers Steps 9–13 (Reconciliation, Outbound & Finance). Two requirements from the brief — "block variance acceptance without cause" and "GL posting with journey_ref" — already existed from the original build and needed no changes: `Reconciliation.before_submit` already hard-blocks acceptance of an out-of-tolerance variance without a `justification`, `Variance.loss_category` is already mandatory, and `Invoice.on_submit` already creates a system-generated `Financial Posting` carrying `journey_ref` (also already stamped onto the real GL Entries via a `doc_events` hook). What's new:

- **Tolerance is now auto-calculated from combined measurement uncertainty, not a flat constant.** `Tank Measurement` and `Terminal Receipt` both gained a `measurement_uncertainty_percent` field (the standard uncertainty of that dip/temperature/density reading, from the instrument's calibration certificate; defaults to an illustrative 0.15%). `Reconciliation.calculate_combined_uncertainty()` combines the two real measurements that bracket a parcel's journey — the `Tank Measurement` that established its volume of record entering KPC custody (Step 2) and this Reconciliation's own `Terminal Receipt` at the pipeline's destination (Step 8) — via root-sum-square (the correct GUM rule for independent uncertainty sources, not simple addition), then multiplies by an editable `coverage_factor` (k, default 2, ~95% confidence) to get `tolerance_percent`. That field is now system-calculated and read-only, no longer a free-typed default. **Known gap, documented below:** `dispatched_quantity_kl` (the other side of the variance itself) is still the Pipeline Batch's *planned* volume, not a live in-line meter — this combines the two best real measurements available in the current model, not a true origin-vs-destination custody meter comparison.
- **`journey_ref` write-once guard** extended to `Reconciliation` (fetch_from `terminal_receipt.journey_ref`), `Allocation` (fetch_from `nomination.journey_ref`), `Dispatch` (fetch_from `allocation.journey_ref`), `Invoice` (a directly-editable field, same as `Nomination`), and `Financial Posting` (directly-editable but system-set; its `status` flip to `Reversed` on cancellation uses `db_set`, which bypasses `validate()` entirely, so it's unaffected by this guard).
- **RBAC:** System Manager submit/cancel removed from `Reconciliation`, `Allocation`, `Dispatch`, and `Invoice` — the last of the originally-submittable doctypes in the 13-step chain to receive this treatment. `Variance` and `Financial Posting` were already not submittable, so there was nothing to remove there.

Verified with a 17-check live-data run: RSS combination math, coverage-factor scaling, uncertainty fetched correctly from both sides, eight RBAC assertions across four doctypes, and write-once on Invoice/Financial Posting (both already-submitted fixtures, so this correctly exercises Frappe's own submit-immutability rather than the custom guard's message — same situation as Tank Measurement in Phase 1). The `Reconciliation` write-once guard itself was unit-tested directly against the shared `assert_journey_ref_immutable()` function rather than via a parent-swap fixture — every other real Terminal Receipt in the demo data shares the one fully-built Journey, so proving it end-to-end would mean building a second complete 8-doctype chain purely to re-demonstrate a mechanism already proven that way on five other doctypes. All rolled back with no residue; the existing demo Reconciliation's variance (1.139%) was confirmed to still comfortably exceed the new, tighter default tolerance (~0.42% at 0.15% uncertainty each side, vs. the old flat 0.5%), so the justification-gate demo scenario still holds without any change to `demo_data.py`.

## Phase 5: EAM, HSEQ & Human Capital

New ground, not hardening of the 13-step chain: Enterprise Asset Management and HSEQ (Health, Safety, Environment, Quality) doctypes, plus the certification-expiry gate the brief calls for. Two ArcApps naming collisions checked and avoided, on top of the two from earlier phases: `Asset` (ArcApps's financial fixed-asset/depreciation doctype) → this app's equipment register is **`Plant Asset`**; `Work Order` (ArcApps's manufacturing doctype, already avoided in the original build) → this app's maintenance job is the pre-existing **`Maintenance Work Order`**, extended rather than duplicated. `Employee` is ArcApps's own core HR doctype, reused directly.

- **`Plant Asset`** (new) — a standing equipment register (pipeline segments, pump stations, valves, meters) distinct from ArcApps's own `Asset`, which is a financial/depreciation record. Master data like `Oil Tank`/`Terminal`, so it carries no `journey_ref`.
- **`Employee Certification`** (new) — one record per Employee per certification type (a shared category list: Pipeline Operations, Confined Space Entry, Hot Work, Working at Height, Electrical Isolation, Excavation, Crane Operation, General HSEQ, Other), with an `expiry_date` and an auto-computed `status`. **Important:** the certification gate never trusts that cached `status` field — `assert_certification_current()` recomputes freshness from `expiry_date` directly against today, every time, because `status` is only re-evaluated when a certification record is next saved and would otherwise silently read as "Valid" for a certification that lapsed purely by the calendar moving on.
- **`Permit to Work`** (new) — a submittable HSEQ safety permit (Draft → Issued → Closed/Revoked, with a whitelisted `close_permit()` action) linked to a `Maintenance Work Order` and fetching its `journey_ref`. **Blocks issuance if the certification is missing or expired** (the brief's requirement): `permit_type` and `Employee Certification.certification_type` share the identical option list, so a permit for "Confined Space Entry" requires the person it's `Issued To` to hold a current certification of that exact type.
- **`Maintenance Work Order`** (extended) — gained `asset` (Link to `Plant Asset`), `assigned_employee` (Link to `Employee`, replacing the old bare `assigned_to` User link, since the certification gate needs an actual HR record), and an optional `required_certification_type`. **Blocks assignment if that certification is missing or expired** when a type is set; left unrestricted when it isn't (a routine visual Inspection doesn't always need one).
- **`journey_ref` write-once and RBAC** extended to `Maintenance Work Order` and `Permit to Work` the same way as every doctype in Steps 1–13.
- **Demo data:** two Employees illustrate both sides of the gate - James Mwangi holds current Pipeline Operations and Confined Space Entry certifications and is the one actually assigned to the demo Work Order and its Permit to Work (both a Plant Asset "Pump Station KP2" and the full permit lifecycle - Issued, then Closed - are exercised for real); Peter Otieno's Confined Space Entry certification is deliberately left expired as reference data, not exercised against a real submission, so opening his record or trying to assign him yourself demonstrates the block interactively.

Verified with a 17-check live-data run covering both fixture-creation helpers, the happy path, both failure modes (no certification on file vs. an expired one) for each of Work Order and Permit to Work, the "no gate when no type is required" case, the full Permit to Work lifecycle, write-once, and RBAC - all rolled back with no residue. A naming bug was caught in the process: Frappe derives a doctype's controller class name by literally stripping spaces from the label, not by pascal-casing each word - "Permit to Work" → `PermittoWork` (lowercase "to"), not the `PermitToWork` first written. `bench migrate` didn't catch this (the DocType record itself is fine); it only surfaced as an `ImportError` the moment code first tried to instantiate the doctype - now fixed and covered by the same 17-check run. The `KPC` workspace's on-disk fixture stayed in sync with the live DB this time (checked via the same re-export-and-diff procedure introduced in Phase 3) before adding a new "EAM, HSEQ & Human Capital" card with links to all four doctypes above.

## Phase 6: AI, Decision Intelligence & Security

The final phase: the immutable Decision Ledger and the global Segregation of Duties (SoD) hook, both explicit requirements from the brief. Two new modules alongside the existing `integrations/` package: `kpc.petroleum_operations.sod` and `kpc.petroleum_operations.decision_ledger`.

- **`Decision Ledger`** (new doctype) — one append-only entry per AI-assisted decision or manual override in the app. Immutable the same way as `OT Telemetry Log` (Phase 3): no role, not even System Manager, has `write` or `delete`, and `assert_document_immutable()` blocks any edit attempt server-side regardless of permissions. Written to via a single choke point, `decision_ledger.log_decision()`, called at the exact moment each decision happens:
  - `AI Recommendation` Approved/Rejected → `is_ai_assisted=1` (this is the brief's explicit "AI Recommendation cannot execute without human approval, which writes to the Decision Ledger" - and it already couldn't execute without approval: `MaintenanceWorkOrder.validate_recommendation_approved()` has required `workflow_state == "Approved"` since the original build, so Phase 6 adds the logging, not the gate).
  - `Quality Result` Accepted/Quarantined → `is_ai_assisted=0` (a human QC judgment call, not AI-generated).
  - `Variance` Approved/Rejected (loss classification) → `is_ai_assisted=0`.
  - `Reconciliation` submitted with an out-of-tolerance variance and a justification → `is_ai_assisted=1`, since it's overriding a threshold that Phase 4 calculates algorithmically (combined measurement uncertainty), not a policy constant a human set.
- **Segregation of Duties: a document's owner cannot submit or approve their own document.** Two complementary mechanisms, because this app models "approval" two different ways:
  - Most transactional doctypes model acceptance as a docstatus submit. `kpc.petroleum_operations.sod.block_self_submit` is wired as a **global** `"*": {"before_submit": ...}` hook in `hooks.py` - genuinely global, in that it automatically covers every submittable doctype this app has now *and* any added later, with no per-doctype hooks.py entry required. It's scoped internally (`frappe.get_meta(doc.doctype).module != "Petroleum Operations"`) so it only ever fires for this app's own doctypes, never ArcApps/Frappe core or another installed app's Sales Invoice, Stock Entry, etc.
  - `Quality Result`, `Variance`, and `AI Recommendation` model their decision as a `workflow_state` change instead of a submit. There's no safe generic way to detect "this workflow_state change is the approval-shaped one" across arbitrary doctypes, so `assert_not_self_approving()` is called explicitly by each of those three, at the exact point they already detect their own transition.
  - `Oil Shipment`'s own `workflow_state` is deliberately **not** covered - its states (Draft → Vessel Arrived → Discharging → Received) are sequential physical-progress milestones normally all logged by the same Terminal Operator watching the same event in real time, not a requester/approver split. Applying self-approval SoD there would just block normal field operations, not prevent fraud.
  - **Administrator is exempt**, matching Frappe's own core permission system, which already exempts Administrator from virtually every other check for the same reason: it's the system/automation identity that migrations, `demo_data.py`, and every `doc_events` integration hook in this app legitimately run as, not a real segregated business role. In practice this exemption is rarely even reachable through the desk UI for a real person, since System Manager (Administrator's role) has already had submit/cancel removed from every one of these doctypes across Phases 1–5.
- **Operational consequence worth calling out plainly:** this is a genuine tightening of how the app must be used, not just an implementation detail. A single user can no longer both create *and* submit/approve their own Tank Measurement, Nomination, Dispatch, Quality Result, and so on - a real deployment needs at least two people collaborating on every one of these doctypes' lifecycle. `demo_data.py` is unaffected only because it runs entirely as Administrator.

Verified with a 20-check live-data run using two disposable non-Administrator test users switched between via `frappe.set_user()`: self-submit blocked then a different user's submit succeeding (Maintenance Work Order), self-approval blocked then succeeding for a different user on both `Quality Result` and `AI Recommendation` (with the correct `is_ai_assisted` flag and decided-by user recorded on each resulting Decision Ledger entry), the Reconciliation override path logging correctly with the justification carried through as `rationale`, Decision Ledger's own immutability and RBAC, and a structural check that the wildcard hook's module-scoping would skip an ArcApps core doctype. All rolled back with no residue, then the full `demo_data.create_demo_data` run re-confirmed idempotent and unaffected (it runs entirely as Administrator, which is exempt).

This completes RBAC/SoD hardening and the immutable audit trail called for across the whole spec.

## Architecture Notes

- **Module:** everything lives under the `Petroleum Operations` module (`kpc/petroleum_operations/`), separate from the app's default `Kpc` module.
- **Volumetrics:** `kpc.petroleum_operations.utils.calculate_standard_volume()` converts a tank dip reading to a standard volume at 15°C (linear strapping approximation × a simplified API MPMS 11.1 / ASTM D1250 Volume Correction Factor). Shared by `Tank Measurement` and `Terminal Receipt` so both stay on the same formula. **Not certified for fiscal custody transfer** — replace with a vendor-certified VCF table before relying on it for billing-grade accuracy.
- **AI predictive maintenance:** `kpc.petroleum_operations.utils.assess_pipeline_anomaly()` scores a `Movement`'s telemetry (pressure, flow rate, vibration) against a documented safe-operating envelope — deterministic and explainable by design, not a trained model. A breach cascades automatically: `AI Alert` → `AI Prediction` (failure risk % + horizon) → a draft `AI Recommendation`, which sits in `Pending Approval` until a Maintenance Manager acts.
- **Accounts integration:** `kpc.petroleum_operations.integrations.accounts` is deliberately thin. `Invoice` never writes a GL Entry itself — submitting it builds and submits a real ArcApps `Sales Invoice`, and a `journey_ref` custom field (added to both `Sales Invoice` and `GL Entry`) rides along, stamped onto the GL Entries by a `doc_events` hook *after* ArcApps has already posted them.
- **Stock integration:** `kpc.petroleum_operations.integrations.stock` follows the exact same philosophy — never writes a Stock Ledger Entry itself, only calls the standard ArcApps documents that do, at the point physical custody actually changes hands:

  | Step | Stock event | ArcApps document |
  |---|---|---|
  | 2 · Tank Measurement (Closing) | Product enters KPC custody from the vessel | `Stock Entry` (Material Receipt) |
  | 8 · Terminal Receipt | Product moves tank-to-tank through the pipeline | `Stock Entry` (Material Transfer) |
  | 9 · Reconciliation | A variance outside tolerance is accepted (recognised loss) | `Stock Entry` (Material Issue) |
  | 11 · Dispatch | Product delivered to the customer | `Delivery Note` |
  | 12 · Invoice | Billed against the Dispatch's own Delivery Note (`dn_detail`) | `Sales Invoice` |

  Each `Oil Tank` maps 1:1 to an auto-provisioned `Warehouse` (`Oil Tank.warehouse`, set on insert). The Delivery Note's rate comes from an active `Tariff` for that product/route if one exists, falling back to the Item's reference rate — using the Item's rate for the *invoiced* amount instead would fail ArcApps's over-billing check the moment the two diverge, which they do immediately for a commodity billed at a real commercial rate. `Accounts Settings.over_billing_allowance` is set to 100% as a deliberate safety margin on top of that, since delivery (Step 11) and the commercial rate becoming final (Step 12) aren't always the same moment in practice. `journey_ref` (added to `Delivery Note`, `Stock Entry`, and `Stock Ledger Entry`) rides along the same way it does on the Accounts side.
  - **Every doctype that posts a Stock Entry reverses it on cancel.** `Tank Measurement`, `Terminal Receipt`, and `Reconciliation` each store the Stock Entry they posted in their own `stock_entry` field and cancel it from their own `on_cancel`, the same pattern `Dispatch`/`Invoice` already use for their Delivery Note/Sales Invoice. (Found and fixed via a real `reset_demo_data(force=True)` rebuild — see Demo Data below.)
- **Native units:** every quantity in this app is kilolitres (KL), end to end. `Invoice` requires a billed product's `stock_uom` to literally be `Kilolitre` and throws rather than guessing a unit-conversion factor.
- **Two ArcApps naming collisions, deliberately avoided:**
  - `Batch` (ArcApps's manufacturing/stock lot doctype) → this app's pipeline parcel is **`Pipeline Batch`**.
  - `Work Order` (ArcApps's manufacturing doctype) → this app's maintenance job is **`Maintenance Work Order`**.
- **Fresh-install doc_events, the hard way:** `bench install-app` runs module sync, `after_install`, and (via this app) demo-data seeding all inside one long-lived process. The doc_events a `Document` actually fires at runtime come from `frappe.get_doc_hooks()` - a *separate* cache from the one `frappe.get_hooks()` uses, kept in a plain process-local variable that's computed once on first use and never recomputed for the rest of that process. If anything earlier in that same install saves a document (module sync alone saves plenty) before this app's `hooks.py` is fully walkable, that stale, kpc-less dict quietly sticks around for every document created afterward - including the entire demo Golden Thread, whose Sales Invoice/Delivery Note/Stock Entry would then submit "successfully" but silently never get `journey_ref` stamped onto their GL/Stock Ledger Entries. Neither `frappe.clear_cache()` nor busting `get_hooks()`'s own Redis key fixes this - `kpc.install.after_install` clears it directly (`frappe.local.doc_events_hooks = None`) before seeding.

## Roles & Workflows

| Role | Scope |
|------|-------|
| Terminal Operator | Oil Shipment, Tank Measurement, Terminal Receipt, Dispatch |
| Quality Analyst / Quality Manager | Quality Result entry and approval |
| Scheduler & Operations Controller | Capacity Assessment, Pipeline Batch approval, Movement tracking, Variance approval |
| Commercial Officer | Nomination, Allocation, Invoice |
| Maintenance Manager | Exclusive approver of AI Recommendation and Maintenance Work Order |
| Finance Officer | Reconciliation, Invoice (billing), Financial Posting |

Four Frappe Workflows enforce the state machines that need more than one role:

| Workflow | States |
|----------|--------|
| Oil Shipment Workflow | Draft → Vessel Arrived → Discharging → Received (+ Cancel) |
| Quality Result Workflow | Pending → Accepted / Quarantined |
| AI Recommendation Workflow | Pending Approval → Approved / Rejected |
| Variance Workflow | Pending Approval → Approved / Rejected |

Everything else that needs an approval gate (Nomination, Pipeline Batch, Tank Measurement, Terminal Receipt, Reconciliation, Allocation, Dispatch, Invoice, Maintenance Work Order) uses a plain Frappe submit, with submit permission restricted to the owning role.

## Connections

Every doctype that has other documents pointing back to it has a `<doctype>_dashboard.py` file in its own folder (e.g. `kpc/petroleum_operations/doctype/journey/journey_dashboard.py`) — the standard Frappe convention that populates the **Connections** tab on a document's form (the same grouped tab ArcApps's own Sales Invoice shows for Payment Entry, Delivery Note, etc.). No schema change or migration is needed for these; Frappe discovers them by file naming convention at page-load time.

| DocType | Connections tab shows |
|---|---|
| `Journey` | Every doctype in the thread, grouped into the same 5 phases the app was built in |
| `Terminal` | Storage (Oil Tank), Shipments (Oil Shipment) |
| `Oil Tank` | Gauging & Quality, Stock, Movements |
| `Oil Shipment` | Receipt & Quality |
| `Nomination` | Fulfillment (Pipeline Batch, Allocation) |
| `Capacity Assessment` | Batches (Pipeline Batch) |
| `Pipeline Batch` | Movement |
| `Movement` | AI Predictive Maintenance, Delivery |
| `AI Alert` → `AI Prediction` → `AI Recommendation` | Each links forward to the next stage of the cascade |
| `Terminal Receipt` | Reconciliation |
| `Reconciliation` | Loss Classification (Variance), Allocation |
| `Allocation` | Dispatch |
| `Dispatch`, `Tariff` | Billing (Invoice) — via `internal_links`, since both are referenced from inside Invoice's child table (`Invoice Line`), not a direct field |
| `Invoice` | Financials (Financial Posting) |

This is scoped to the app's own 26 doctypes. Extending a *standard* ArcApps doctype's Connections tab (e.g. showing Nomination/Dispatch on `Customer`) can't be done by editing ArcApps's own files — that gets overwritten on upgrade — but Frappe has a clean hook for exactly this: `override_doctype_dashboards` in `hooks.py`, which lets this app extend another doctype's dashboard without touching its source.

### Create buttons

The Connections tab's small "+" icons work, but they're easy to miss. Every doctype above that has a genuine, human-initiated next step also has a proper **Create ▾** split button in the page toolbar (the same pattern ArcApps's own Sales Invoice uses for "Create → Payment/Delivery Note"), so the next document in the chain is one click away with the relevant link field already filled in:

| Source | Create ▾ offers | Gated on |
|---|---|---|
| `Terminal` | Oil Tank, Oil Shipment | — |
| `Oil Tank` | Tank Measurement, Quality Result, Inventory Position, Terminal Receipt, Dispatch | — |
| `Oil Shipment` | Tank Measurement, Quality Result | — |
| `Nomination` | Pipeline Batch, Allocation | submitted |
| `Capacity Assessment` | Pipeline Batch | saved (not new) |
| `Pipeline Batch` | Movement | submitted |
| `Movement` | Terminal Receipt | — |
| `AI Recommendation` | Maintenance Work Order | `workflow_state == "Approved"` |
| `Terminal Receipt` | Reconciliation | submitted |
| `Reconciliation` | Variance, Allocation | submitted |
| `Allocation` | Dispatch | submitted |
| `Dispatch` | Invoice | submitted |
| `Journey` | Tank Measurement, Quality Result, Inventory Position, Nomination, Maintenance Work Order, Invoice | — |

**Deliberately excluded, not overlooked:** `AI Alert` → `AI Prediction` and `AI Prediction` → `AI Recommendation` (both are auto-created by the anomaly cascade itself — see `utils.raise_ai_alert` — a manual "Create" shortcut here would just invite duplicates alongside the real, system-generated ones); `Invoice` → `Financial Posting` (system-generated only, no business role even has create permission on it); `Tariff` → `Invoice` (a Tariff is a rate card looked up per invoice line, not something anyone starts an invoice *from*). `Journey`'s own list is shorter than its Connections tab because most of the chain fetches `journey_ref` from the document *before* it, not directly from Journey — only the doctypes where `journey_ref` is a real, directly-settable field are offered here.

`Dispatch → Invoice` is the one non-trivial case: Invoice references a Dispatch from inside its `lines` child table (`Invoice Line.dispatch`), not a direct field, so that button pre-populates a new Invoice with one `Invoice Line` row already pointing at the Dispatch, using `frappe.model.get_new_doc` / `frappe.model.add_child` directly rather than the simpler `frappe.new_doc(doctype, {field: value})` idiom used everywhere else.

**A real, pre-existing bug found while checking this: every `Invoice` form rendered completely blank.** `invoice.js`'s `setup()` called `frm.set_query("lines", "dispatch", ...)` to filter the `dispatch` picker inside the `lines` child table — but Frappe's `set_query()` for a child-table field takes `(field_inside_the_row, parent_table_fieldname, query)`, not the other way round. With the arguments swapped, Frappe looked for a top-level field called `dispatch` (there isn't one — it only exists inside the `lines` table), found nothing, and threw `TypeError: Cannot read properties of undefined (reading 'grid')` on every single form load — aborting the rest of that form's setup/refresh pipeline before any field could render. Confirmed with a headless-browser check (login, navigate, read the console) rather than guessing from a screenshot: the exact error and stack trace pointed straight at the swapped arguments, and re-checking after the one-line fix (`frm.set_query("dispatch", "lines", ...)`) showed every field, the lines table, the total, and both custom buttons rendering correctly with no console errors.

### Journey Log duplication (fixed)

A `Journey`'s Audit Trail used to log the same step multiple times — e.g. four "1. Shipment" rows for one `Oil Shipment` that only went through three real transitions (Draft → Vessel Arrived → Discharging → Received). The cause: `has_value_changed("workflow_state")` alone also returns `True` on a document's very first insert (there's nothing to compare the brand-new default value against - see `Document.has_value_changed`), so every doctype logging a step from `on_update()` was logging one extra, spurious entry for simply being *created*, on top of each genuine transition afterwards.

The obvious-looking fix, `is_new()`, turns out **not** to work here - confirmed by direct testing rather than assumed: Frappe has already cleared that flag by the time `on_update()` runs, even during the very first save. `self.flags.in_insert` is the flag that's actually still `True` at exactly that point (and `False`/unset on every later save) - that's the one that has to be used to tell "this on_update is happening as part of insert" apart from "this is a genuine subsequent save".

Fixed in six doctypes: `Oil Shipment`, `Quality Result`, `AI Recommendation`, `Variance`, and `Movement` (all guarded with `not self.flags.in_insert`), plus `Inventory Position`, which had no guard at all and would log a duplicate on *every* resave of an existing position (e.g. just editing `remarks`) - guarded with `self.flags.in_insert` instead, since each Inventory Position document is one snapshot in its own right and the only meaningful event is its creation. Verified with a 13-check live-data run: each doctype's creation now logs zero entries, each real transition logs exactly one, and resaving an existing Inventory Position adds nothing new - rolled back with no residue.

## Installation

```bash
bench get-app kpc <repo-url>   # or: already present under apps/kpc in this bench
bench --site <site> install-app kpc
```

A fresh `bench install-app kpc` does everything on its own — no separate `bench migrate` or manual seeding step needed. This is deliberate, and less obvious than it looks: `bench install-app` **does not run `patches.txt`** at all (Frappe's installer marks every one of an app's patches as already-applied the moment it's freshly installed, on the assumption a brand-new site has no pre-existing data for a patch to migrate against - see `kpc/install.py`'s docstring). Since most of this app's patches are really first-run setup, not data migration, `kpc.install.after_install` runs all of them directly, then seeds the demo Golden Thread if a default Company already exists (skipped, not aborted, if the ArcApps setup wizard hasn't run yet - see below). On a site the app was already installed on *before* this hook existed, none of that is retroactive - use `bench migrate` and the manual seeding command instead:

```bash
bench --site <site> migrate
bench --site <site> execute kpc.demo_data.create_demo_data
```

`bench migrate` runs the app's patches (`kpc/patches.txt`), which create the RBAC roles, the `Item`/`Sales Invoice`/`GL Entry`/`Delivery Note`/`Stock Entry`/`Stock Ledger Entry` custom fields, the `Kilolitre` UOM, the four Workflows, the `KPC` Workspace, and set `Accounts Settings.over_billing_allowance` — all idempotent and safe to re-run, on a fresh install or an existing one.

## Demo Data

`kpc/demo_data.py` seeds one complete Golden Thread through all 13 steps, deliberately routed through every control the app enforces — not a synthetic fixture, real records created via the same `insert()`/`submit()` calls a user would trigger from the UI. It runs automatically on a fresh install (see above); to run it by hand on a site that already has the app:

```bash
bench --site <site> execute kpc.demo_data.create_demo_data
```

It only assumes one thing that genuinely can't be faked - a Company with a Chart of Accounts (i.e. the ArcApps setup wizard has run) - and creates everything else itself if missing: root Item Group / Customer Group / Territory nodes, a "Standard Selling" Price List, and the global default currency (`frappe.db.set_default("currency", ...)`) aligned to the Company's, none of which a bare Company record actually guarantees. Then it creates two Terminals, two Oil Tanks (each with an auto-provisioned Warehouse), one petroleum Product, one Customer, one Tariff, and walks a single cargo (`MT African Pride`) through:

- **Step 1–4:** Shipment → Tank Measurement (posts a Material Receipt Stock Entry) → Quality Result (Accepted, logged to the Decision Ledger) → Inventory Position
- **Step 5–6:** Nomination → Capacity Assessment → Pipeline Batch
- **Step 7:** Movement with a deliberate telemetry breach (overpressure + high vibration) → full AI Alert → AI Prediction → AI Recommendation (Approved, logged to the Decision Ledger) → Maintenance Work Order (Completed, assigned to a certified Employee, against a Plant Asset) → Permit to Work (Issued, then Closed)
- **Step 8:** Terminal Receipt (posts a Material Transfer Stock Entry, origin tank → destination tank)
- **Step 9:** Reconciliation outside its auto-calculated combined-uncertainty tolerance (~0.42% at this demo's default 0.15% measurement uncertainty on each side, not a flat constant), justified and accepted (posts a Material Issue Stock Entry for the recognised loss, and a Decision Ledger entry for the override), then classified and approved as a Variance (also logged)
- **Step 10–11:** Allocation → two Dispatches, each creating and submitting a real Delivery Note (so Invoicing has more than one line, and more than one delivery, to prove itself against)
- **Step 12–13:** Invoice (two rated lines, billed against each Dispatch's own Delivery Note) → a real ArcApps Sales Invoice → two balanced GL Entries, both carrying `journey_ref` → Financial Posting

Alongside the Golden Thread, the script also seeds: two Employees for the Phase 5 certification gate (James Mwangi, fully certified and the one actually assigned to the demo Work Order/Permit; Peter Otieno, with a deliberately expired certification left as reference data for you to test the block against interactively) and one Plant Asset ("Pump Station KP2"). The Segregation of Duties gate (Phase 6) is *not* demonstrated by the seed script itself, since it runs entirely as Administrator, which is deliberately exempt from that gate (see Phase 6 above) - test it interactively as two different real users instead.

The script is idempotent — re-running it is a no-op once the Journey has genuinely reached Step 13 *with* every downstream feature's fields populated (not just the step number; see `_journey_is_fully_built`), so pulling a newer version of this app onto a bench with older demo data won't silently leave it half-upgraded.

If a demo Journey exists but never finished (a step failed partway, or it predates a feature added since), reset it before reseeding — `Oil Shipment` is immutable by design (see `OilShipment.on_trash`) so a reset always reuses it rather than recreating it:

```bash
bench --site <site> execute kpc.demo_data.reset_demo_data
bench --site <site> execute kpc.demo_data.create_demo_data
```

To force a rebuild of a journey that's already complete - e.g. after adding a feature (like the Decision Ledger) that an existing demo journey predates and would otherwise never exercise - pass `force=True`:

```bash
bench --site <site> execute kpc.demo_data.reset_demo_data --kwargs '{"force": true}'
bench --site <site> execute kpc.demo_data.create_demo_data
```

**A real bug this surfaced, now fixed:** `reset_demo_data()` already cancelled every KPC-side submittable doctype it deletes, but three of them - `Tank Measurement`, `Terminal Receipt`, and `Reconciliation` - never reversed the ArcApps Stock Entry their own `on_submit` had posted (unlike `Dispatch`/`Invoice`, which always correctly cancelled their Delivery Note/Sales Invoice). A `force=True` rebuild used to leave the old generation's Stock Entries active forever, silently doubling Warehouse quantities on every rebuild - this was a real, if narrow, production-relevant gap too: cancelling any of these three doctypes by hand in the desk had the exact same effect. All three now store the Stock Entry they posted (`stock_entry`, a new read-only field) and reverse it in their own `on_cancel`, the same pattern `Dispatch`/`Invoice` already used. Verified directly against the live site: a genuinely doubled Warehouse balance from an earlier `force=True` test run was traced to exactly this gap, the orphaned Stock Entries were reversed by hand in the correct order (Frappe's Stock Ledger reposting is chronological - reversing an old entry while newer ones still depend on it raises `NegativeStockError`, so cleanup has to run newest-first), and a fresh rebuild confirmed a single, correct generation with no residue.

Once seeded, open the result at `/app/journey/JNY-2026-00001`, or start from the **KPC** workspace in Desk, which groups every doctype into cards by phase with quick-access shortcuts to the most-used entry points.

## Known Simplifications

- **One `journey_ref` per cargo, start to finish.** Assumes segregated batch tracking (a shipment's product stays traceable as itself through to invoice); real operations sometimes commingle stock from multiple cargoes in one tank.
- **VCF is illustrative, not certified** — see Architecture Notes above.
- **AI scoring is rule-based, not a trained model** — explainable by design, and the documented integration point for a real one.
- **Tariffs are a flat rate per KL** — no tiered pricing, minimum volumes, or contract-specific overrides.
- **`Terminal.company` is required.** Added to resolve which Company's Warehouse tree an Oil Tank belongs to; existing Terminals from before this field existed are backfilled to the site's default Company by a patch, not left blank.
- **Valuation on the first stock movement is illustrative.** The very first `Stock Entry` (Material Receipt) for a product needs a `basic_rate` before it has any stock history — this app uses the Item's reference rate, not a landed-cost figure.
- **`Product Compatibility` adjacency is route-and-sequence scoped only.** `Pipeline Batch` checks immediate neighbours by `batch_sequence_no` on the same origin/destination route; there's no separate "pumping campaign/cycle" concept, so two unrelated batches on the same route months apart but with adjacent sequence numbers would still be compared. Sequence numbers are entered manually, not auto-assigned from the schedule.
- **RBAC/SoD hardening is complete: every submittable doctype has System Manager submit/cancel removed, and the global owner-can't-self-approve hook covers every submit plus the three workflow_state-based decision doctypes.** Real multi-user deployment now requires at least two collaborating users per doctype lifecycle - see Phase 6 above for the operational consequence.
- **Decision Ledger coverage is deliberately scoped to genuine decisions, not every possible workflow_state change.** `Oil Shipment`'s sequential status milestones aren't logged (they're operational progress, not approvals - see Phase 6); a Quality Result/Variance/AI Recommendation transition into a *non*-decision state (e.g. a re-save that doesn't change workflow_state) correctly logs nothing.
- **The certification-type category list is shared, not independently configurable.** `Employee Certification.certification_type`, `Permit to Work.permit_type`, and `Maintenance Work Order.required_certification_type` all use the identical hardcoded Select options so a straight string match works; a real deployment would likely want this as its own master doctype instead of three duplicated option lists.
- **No decommissioned-asset block yet.** `Plant Asset.status` can be set to `Decommissioned`, but nothing currently stops a new `Maintenance Work Order` from being raised against one - unlike Oil Tank's Maintenance/Quarantine block on transactions.
- **`OT Telemetry Log` readings are per-Movement, not per-instrument-stream.** There's no separate "SCADA tag registry" doctype — `source_tag` is a free-text label on each reading, not a validated link to a known instrument. A real integration would likely want that as its own master.
- **Combined measurement uncertainty compares the journey's two dip measurements, not a live in-pipeline meter.** `Reconciliation`'s auto-calculated tolerance combines the origin `Tank Measurement` and destination `Terminal Receipt` uncertainties, but `dispatched_quantity_kl` itself is still the Pipeline Batch's *planned* volume (see the ArcApps Stock integration note above) — this isn't yet a true origin-meter-vs-destination-meter custody comparison.

## License

MIT
