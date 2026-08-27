# KPC Operations — Business Guide

This document assumes you know a standard ERP system (doctypes, submit, workflows) but have **no background in the petroleum industry**. It starts from scratch on the industry itself, then works down to what every field on every document actually means and why it's there. `README.md` is the technical build log of what was implemented and verified; this document is the "explain the business to me like I've never worked in oil & gas" one.

Read top to bottom the first time — each section leans on the one before it. After that, use it as a reference:

- **[Petroleum Industry 101](#petroleum-industry-101--the-business-before-the-software)** — no background assumed; what this industry is and why it works the way it does.
- **[From industry concept to actual field](#from-industry-concept-to-actual-field--how-the-fields-implement-what-you-just-read)** — the same ideas, pinned to exact field names.
- **[Setting up the business](#setting-up-the-business-first-master-data--set-up-once-reused-everywhere)** — the master data you configure once (Terminal, Oil Tank, Product, Tariff, ...).
- **[The Golden Thread: Journey](#the-golden-thread-journey)** — the ID that ties one cargo's whole story together.
- **[Walking through a sale, document by document](#walking-through-a-sale-document-by-document)** — all 13 steps, field by field, with the business reason for each.
- **[EAM, HSEQ & Human Capital](#eam-hseq--human-capital)** — equipment, certifications, and safety permits.
- **[AI, Decision Intelligence & Security](#ai-decision-intelligence--security)** — the predictive-maintenance cascade and the permanent decision record.
- **[Glossary](#glossary--quick-lookup-for-the-industry-terms-used-above)** — every industry term used above, one line each.

## Petroleum Industry 101 — the business before the software

### Where KPC sits in the bigger picture

The petroleum industry is usually split into three stages:

- **Upstream** — finding and pumping crude oil out of the ground. Not KPC.
- **Refining** — turning raw crude into the actual usable products: petrol (called PMS, Premium Motor Spirit), diesel (AGO, Automotive Gas Oil), jet fuel (Jet A-1), kerosene, and so on. Not KPC either — Kenya doesn't have a working crude refinery, so these finished products arrive already refined, by ship.
- **Midstream — this is KPC's whole business.** Once refined product exists, midstream is everything involved in getting it from where it entered the country to where it's actually sold: receive it from the ship, store it safely, prove it's really the quality it's supposed to be, sell it to fuel distributors under a commercial contract, physically move it hundreds of kilometres inland by pipeline, hand it over, and bill for it.

That midstream chain — **receive → store → certify → sell → transport → deliver → bill** — is exactly the 13 steps this app models. Nothing here is about drilling or refining; it's all about the safe, accountable, fiscally-correct movement of already-refined fuel.

### If you know a standard ERP sales flow, here's the bridge

The familiar ERP commercial tail — Sales Order → Delivery Note → Sales Invoice — maps almost directly onto the *back half* of this app:

| The ERP flow you already know | This app's equivalent |
|---|---|
| Sales Order (credit-checked customer order) | `Nomination` |
| Reserving/confirming stock against an order | `Allocation` |
| Delivery Note | `Dispatch` (and genuinely creates a real ArcApps Delivery Note) |
| Sales Invoice | `Invoice` (and genuinely creates a real ArcApps Sales Invoice) |

What's actually new to you is everything **before** that commercial tail: `Oil Shipment → Tank Measurement → Quality Result → Movement → Terminal Receipt → Reconciliation`. A typical sales-and-inventory system doesn't need any of this, because most goods people sell through one don't physically expand with temperature, don't need to survive an independent lab test before they're even allowed to be listed for sale, and don't lose a small, expected percentage of themselves in transit every single time. Petroleum does all three — that's the entire reason this half of the app exists.

### Why this industry is so obsessed with precise measurement

Two reasons, both very concrete:

1. **The volumes are enormous, so a tiny percentage is real money.** A single parcel in this app's own demo data is 2,000 KL (2 million litres). A "small" 0.5% discrepancy on that is 10,000 litres — nobody would call that a rounding error if it showed up as a shortfall on an invoice.
2. **"Custody transfer" is a legal and financial moment, not just a stock movement.** Custody transfer is the industry's term for the exact point where legal ownership and risk pass from one party to another — vessel to KPC at the coast, KPC to the customer at delivery. Whatever gets measured *at that moment* is what gets paid for, insured, and argued over if a dispute ever happens. That's why a measurement in this app isn't just "type in a number" — it has to be defensible enough to survive a commercial dispute, which is why it's built from a calibrated instrument reading, a documented correction formula, a tracked uncertainty, and (once submitted) a record nobody can quietly go back and edit.

Because oil physically expands when warm and contracts when cold, two people measuring the exact same batch of oil at different temperatures would get different readings — neither one "wrong," just measured under different conditions. The whole industry agrees to always convert every reading to what it would be at one fixed reference temperature (15°C) using a published, standardised formula (from API — the American Petroleum Institute — and ASTM), so a vessel's own numbers and KPC's own numbers can actually be compared fairly. That converted number is called **standard volume**, and it's the only volume that ever gets paid for, billed, or reconciled anywhere in this app.

### Why quality is a hard gate, not a QA nicety

Different grades of the same fuel — or, far worse, an entirely different fuel — can ruin an engine, void a warranty, or in aviation fuel's case, be genuinely dangerous. So a parcel isn't just "in the tank and ready to sell" the moment it's received; an independent lab result has to formally confirm it actually meets the specification for what it's labelled as. Selling unqualified fuel isn't just bad practice in this industry, it's the kind of thing that ends up in a lawsuit or a plane not taking off — which is why this app makes it structurally impossible to nominate (sell) product against a cargo whose Quality Result isn't Accepted.

### Why one pipe carries many different products

Building a dedicated pipeline for every single product would need an absurd amount of steel in the ground, so real pipelines instead pump different products one after another through the same pipe — like pouring different coloured liquids one after another into the same hose. Wherever two different products touch inside the pipe, they mix a little at the boundary; the industry calls that mixed boundary **transmix**, or an **interface**. Pipeline operators plan around this on purpose: some product pairs are fine to sit next to each other (the mixed boundary gets blended back in later without any real problem); others genuinely can't touch (imagine jet fuel picking up contamination from a dirtier product) and need either a large deliberate buffer slug pumped between them, or aren't allowed to be sequenced together at all. That planning is `Product Compatibility` and the `interface_cut_kl` field on `Pipeline Batch`.

### Why there's always a small "loss," and why that's not automatically a red flag

Oil evaporates a little in transit. Temperature swings genuinely change what the same physical oil reads as at each end. No metering instrument in the world is perfectly precise. Every pipeline company on earth reconciles a small percentage of "missing" product on every single movement as completely normal — physics and instrument tolerance, not theft. The actual red flag is a variance *bigger* than what the measurement uncertainty of both ends combined can honestly explain — which is exactly what "outside tolerance" means in this app, and why it demands a written explanation rather than either ignoring it or panicking over it.

### Who does what — the real jobs behind this app's roles

| Role in this app | What that person actually does, physically |
|---|---|
| Terminal Operator | On-site at the tank farm: takes dip readings, watches the physical tanks, records receipts and dispatches as they happen. |
| Quality Analyst | Runs the actual lab tests on a product sample and records the raw numbers. |
| Quality Manager | A more senior, *different* person who reviews those numbers against spec and makes the formal Accept/Quarantine call — deliberately not the same person who ran the test. |
| Scheduler & Operations Controller | Plans pipeline capacity and the pumping sequence, watches a Movement's live telemetry for problems. |
| Commercial Officer | Takes customer orders, allocates confirmed stock to them, arranges delivery. |
| Finance Officer | Reconciles transit losses, handles invoicing and the accounting side. |
| Maintenance Manager | Owns equipment reliability — reviews AI-flagged anomalies, approves the resulting maintenance work, issues safety permits before hazardous repairs. |

### The business, in one paragraph (now that the context is there)

Kenya Pipeline Company (KPC) receives petroleum products from a vessel at a coastal terminal, stores it in tanks, certifies its quality, sells it to customers under a commercial order, physically moves it inland by pipeline, accounts honestly for the small losses that are unavoidable at that scale, hands it over to the customer, and bills them for exactly what was delivered. Every one of those handoffs — vessel to tank, tank to pipeline, pipeline to destination tank, tank to customer — produces one document in this app, and every one of those documents shares a single ID (`journey_ref`, the "Golden Thread") so the whole chain, from the ship arriving to the invoice being paid, can always be traced as one story.

## From industry concept to actual field — how the fields implement what you just read

Same ideas as Industry 101 above, now pinned to the exact field names you'll see on screen — this is the layer to come back to while you're actually filling a form in.

### 1. "Standard volume" — the three fields that do the temperature correction

Recap: raw dip readings aren't trustworthy on their own because oil's volume changes with temperature (see Industry 101). Every measurement gets converted to a **standard volume at a fixed reference temperature (15°C)** using a **Volume Correction Factor (VCF)** — API MPMS 11.1 / ASTM D1250, the industry-standard table for this.

Three raw numbers go in, one trustworthy number comes out:

- `observed_level_mm` — how high the liquid actually reads on a dip stick/gauge (the raw physical measurement).
- `observed_temperature_c` — the oil's temperature at that moment (it needs correcting *to* 15°C).
- `density_at_15c` — how dense this specific product is at the reference temperature (denser products correct differently than lighter ones).

...and the app calculates `volume_correction_factor` and `net_standard_volume_kl` from those three automatically. **`net_standard_volume_kl` is the number that matters** — it's what feeds every downstream calculation (inventory, reconciliation, billing). The raw dip reading never does.

### 2. Free water — why there's a separate field for it

Every real storage tank accumulates a thin layer of water at the very bottom, below the oil (condensation, minor contamination over time). That water is not product — it isn't being bought or sold — so before the standard-volume calculation runs, `water_dip_mm` is subtracted off the total observed level. Skip this field (leave it at its default of 0) and you'd be measuring, and potentially billing, water as if it were oil.

### 3. Why every Product needs a density on file

The VCF calculation needs a density to work at all. Rather than typing it in fresh on every single measurement, each **Product** (a standard ArcApps `Item`, extended — see below) carries a reference `density_at_15c` that every new Tank Measurement or Terminal Receipt defaults to. A lab can still override it on a specific reading with an actual tested density; the master value is just the sensible starting point. `api_gravity` is the same density expressed on the industry's other common scale (higher API = a lighter product) — it's informational, nothing calculates from it.

### 4. Pipeline batching and interface cuts — the fields that implement the "cushion slug" idea

Recap: different products pumped back-to-back through one pipe mix a little at the boundary (transmix/interface — see Industry 101). `Product Compatibility` is the master record of which pairs are fine, which need a cut (and how big — `minimum_interface_cut_kl`), and which are forbidden outright. `Pipeline Batch.interface_cut_kl` is where a Scheduler proves, in numbers, that they planned for it — checked automatically against whichever batch is scheduled immediately before/after it on the same route (via `batch_sequence_no`).

### 5. Transit loss and "tolerance" — the calculation, not just the concept

Recap: a small, expected variance is normal (evaporation, temperature, instrument precision — see Industry 101); the question is always whether a specific variance is bigger than that. The defensible answer comes from **metrology, not policy**: every dip measurement carries its own uncertainty (how precise that instrument's calibration actually is), and the acceptable disagreement between two *independent* measurements is the statistical combination of both their uncertainties — not a flat number someone picked once and never revisited. `Reconciliation.tolerance_percent` is calculated this way automatically. A variance that falls outside that calculated tolerance either gets a written explanation (`justification`) before it can be accepted, or gets investigated as a real `Variance`.

### 6. Credit and stock ownership — the two questions every sale has to answer honestly

Before KPC accepts a customer's order (a `Nomination`), two independent things have to actually be true, not assumed:

- **Can this customer afford it?** — checked against their credit limit in the accounting system (`credit_status`).
- **Does KPC actually have that much of that exact, already quality-certified product sitting in tank right now?** — checked against real Inventory Position records (`ownership_status`).

Either one failing blocks the order outright. The app deliberately won't let anyone promise stock that doesn't exist, or bill a customer past their limit, no matter how the request came in.

### 7. Tariffs — how a physical delivery becomes a price

A `Tariff` is simply a rate card: *this* product, on *this* route, costs *this much* per KL, valid from a certain date. Invoicing always looks one up per delivery rather than ever letting someone type a price in by hand — the price a customer pays is always traceable to a rate card that existed before the delivery happened, not decided after the fact.

## Setting up the business first (master data — set up once, reused everywhere)

These aren't part of the 13-step sale itself; they're the physical/commercial facts you configure once so every sale afterwards can reference them.

### Terminal — a physical site (a coastal jetty, an inland depot)

| Field | What it means |
|---|---|
| `terminal_code` / `terminal_name` | The site's short code and full name, e.g. `MSA-01` / "Mombasa Terminal". |
| `terminal_type` | Loading, Discharge, Storage, or Multi-Purpose — what kind of activity happens here. |
| `company` | Which ArcApps Company this terminal belongs to — this is what lets every Oil Tank at this terminal resolve the right Warehouse/accounting context automatically. |
| `is_active` | Turn a decommissioned terminal off without deleting its history. |

### Oil Tank — one physical storage tank at a Terminal

| Field | What it means |
|---|---|
| `tank_code` | Its physical ID, e.g. `TK-101`. |
| `product` | Leave blank for a segregated/multi-product tank; set it if the tank is dedicated to one product. |
| `warehouse` | Auto-created, one-to-one, the moment the tank is saved — this is the real ArcApps Warehouse every stock movement against this tank actually posts to. You never set this by hand. |
| `current_state` | **Active / Maintenance / Quarantine / Decommissioned.** This is a real operational lock, not just a label — while a tank is in Maintenance or Quarantine, the app refuses to record a receipt or dispatch against it, full stop. |
| `capacity_kl` / `reference_height_mm` | The tank's calibration: how many KL it holds at its full/reference dip height. Every standard-volume calculation for this tank is a straight-line ratio against these two numbers — get them wrong and every measurement against this tank is wrong. |
| `safe_fill_capacity_kl` / `dead_stock_kl` | Operational limits — the safe practical fill level, and the unusable volume below the outlet that never actually gets drawn down. The tank record itself won't save if these are inconsistent with `capacity_kl` (e.g. a safe-fill above shell capacity); a specific Tank Measurement reading isn't currently blocked from implying a fill above the safe level. |

### Product — not a separate doctype

"Product" is the standard ArcApps **Item**, with four extra fields (`density_at_15c`, `reference_temperature_c`, `api_gravity`, `is_petroleum_product`) added under a "Petroleum Properties" tab — see Concept 3 above. Set these once per product (e.g. AGO-DIESEL, PMS-PETROL) and every downstream measurement, batch, and tariff references this same Item.

### Tariff — a rate card

| Field | What it means |
|---|---|
| `product` / `origin_terminal` / `destination_terminal` | Which product, on which specific route, this rate applies to. |
| `rate_per_kl` / `currency` | The price. |
| `effective_from` / `effective_to` | The validity window — a Tariff can expire and be superseded without deleting the old one (needed for audit: what rate applied when a past delivery was billed). |
| `is_active` | A manual on/off switch independent of the date window. |

### Capacity Assessment — how much of a pipeline route is already spoken for

| Field | What it means |
|---|---|
| `origin_terminal` / `destination_terminal` / `period_start` / `period_end` | The route and the time window being planned. |
| `pipeline_capacity_kl_per_day` | The physical throughput limit of that route. |
| `committed_kl` / `available_capacity_kl` | Auto-calculated — the sum of every *approved* Pipeline Batch on this route whose schedule overlaps this period, and what's left. You never type these in; they recompute automatically whenever a Batch on this route is submitted or cancelled. |

A `Pipeline Batch` can optionally check itself against a Capacity Assessment before it's allowed to schedule more volume than the route can actually carry.

### Product Compatibility — the interface-cut rulebook

| Field | What it means |
|---|---|
| `product_a` / `product_b` | The pair. Order doesn't matter — entering B/A after A/B is blocked as a duplicate of the same rule. |
| `compatibility` | **Compatible** (default — an unlisted pair is assumed fine), **Requires Interface Cut**, or **Incompatible**. |
| `minimum_interface_cut_kl` | Only meaningful for "Requires Interface Cut" — the smallest buffer slug volume that's considered safe between these two products. |

## The Golden Thread: `Journey`

You never create this by hand — saving the first `Oil Shipment` for a new cargo creates it automatically, and every subsequent document in the chain fetches its `journey_ref` from the one before it (or, for a few doctypes, has it entered directly and then locked — see `README.md`'s write-once notes).

| Field | What it means |
|---|---|
| `current_step` | Which of the 13 steps this cargo has most recently reached — advances automatically as each document is created/submitted, never moves backwards. |
| `journey_log` | The full, ordered audit trail: every document raised against this cargo, in order. Open a Journey record to see the entire story of one cargo end to end. |
| `status` | Active / Completed / Cancelled / On Hold — the journey's own overall state. |

## Walking through a sale, document by document

Each heading below is one document in the 13-step chain (see `README.md` for the plain-English walkthrough of *what happens* at each step and *who* normally does it). This section is about the fields specifically: what each one represents in the real world, and why the app asks for it.

### 1. Shipment (`Oil Shipment`)

| Field | Why it's there |
|---|---|
| `vessel_name` / `vessel_imo_number` / `bill_of_lading_no` | Identify the actual ship and its shipping paperwork — the legal/commercial record of what's arriving. |
| `supplier` | Who KPC bought this cargo from. |
| `product` / `terminal` | What's arriving, and where — the terminal this cargo will be discharged at. |
| `planned_quantity_kl` / `planned_quantity_mt` | The quantity per the shipping documents — this is the *expected* figure; the *actual* received figure comes later, from Tank Measurement (Step 2), and the two are never assumed to be the same. |
| `eta` / `ata` / `discharge_start` / `discharge_end` | The vessel's real-world timeline — when it was expected, when it actually arrived, and when discharge (pumping the cargo ashore) started/finished. The last three fill in automatically as the Shipment's status moves through its workflow. |

### 2. Receipt (`Tank Measurement`)

This is where a **standard volume** first gets calculated for this cargo (see Concept 1). The same fields, same formula, are reused verbatim at Step 8 (Terminal Receipt).

| Field | Why it's there |
|---|---|
| `tank` | Which physical tank this reading was taken in. |
| `measurement_type` | **Opening / Closing / Interim / Daily Gauge.** Only a **Closing** reading is treated as "the parcel has now genuinely been received" — it's the only type that posts a real stock receipt. The others are informational monitoring readings and don't move any stock. |
| `observed_level_mm` / `water_dip_mm` / `observed_temperature_c` / `density_at_15c` | The four raw inputs to the standard-volume calculation — see Concepts 1 and 2. |
| `measurement_uncertainty_percent` | How precise *this particular instrument's* calibration is. This feeds Reconciliation's auto-calculated tolerance at Step 9 — it isn't just documentation, it's a real input to a later calculation. |
| `volume_correction_factor` / `gross_observed_volume_kl` / `net_standard_volume_kl` | Calculated, not entered — see Concept 1. `net_standard_volume_kl` is the number everything downstream actually uses. |

### 3. Quality Result (`Quality Result`)

| Field | Why it's there |
|---|---|
| `parameters` | A table of individual lab tests (e.g. density, sulphur content) each against its own min/max specification — the actual quality certificate, broken into checkable rows rather than one pass/fail opinion. |
| `overall_result` | Calculated automatically from the rows above — Pass only if every parameter is within its own spec. |
| `workflow_state` | **Pending → Accepted / Quarantined.** This is the actual go/no-go decision, and it's separated from data entry on purpose (see Concept in `README.md`'s SoD notes) — one person records the numbers, a different person with the Quality Manager role reviews and decides. |
| `approved_by` / `approved_on` | Who made that Accept/Quarantine call, and when — filled in automatically. |

Nothing can be sold (Nomination, Step 5) against a cargo whose Quality Result isn't Accepted.

### 4. Inventory Position (`Inventory Position`)

A running ledger entry for one tank, at one point in time — think of it as one line of a bank statement for that tank.

| Field | Why it's there |
|---|---|
| `opening_volume_kl` | What was in the tank before this movement (carried forward from the previous position's closing balance, for every position after the first). |
| `receipts_kl` / `dispatches_kl` / `adjustments_kl` | What moved in, what moved out, and any unattributed gain/loss (e.g. a physical stocktake correction) since the last position. |
| `closing_volume_kl` | Calculated: opening + receipts − dispatches + adjustments. This is the figure Nomination checks before accepting an order (Concept 6) and Reconciliation compares against. |
| `stock_owner` | Blank means KPC-owned custody stock; set once Allocation (Step 10) assigns it to a specific customer. |

### 5. Nomination (`Nomination`)

The commercial order. See Concept 6 — this is where credit and stock-ownership are actually checked, not assumed.

| Field | Why it's there |
|---|---|
| `journey_ref` | Entered directly here (not fetched) — this is where a Commercial Officer picks *which* already-received, quality-released cargo this order is against. |
| `customer` / `company` | Who's buying, and which KPC entity is selling — `company` is specifically what the credit-limit check is evaluated against. |
| `origin_terminal` / `destination_terminal` | The route this order needs to travel. |
| `nominated_quantity_kl` | How much the customer wants. |
| `credit_status` / `ownership_status` | The two automatic checks from Concept 6 — calculated the moment you try to submit ("accept") the order, not editable by hand. |

### 6. Batch (`Pipeline Batch`)

Turns an accepted order into an actual scheduled slug in the pipeline's pumping sequence. See Concept 4.

| Field | Why it's there |
|---|---|
| `nomination` | Which accepted order this batch is fulfilling. |
| `batch_sequence_no` | This batch's position in the pumping order on its route — required, because interface-cut checking (Concept 4) only works if the system knows what's scheduled immediately before/after it. |
| `planned_volume_kl` | How much of this batch will be pumped — checked against both the Nomination's remaining quantity and the route's remaining Capacity Assessment. |
| `interface_cut_kl` | Only needed when the Product Compatibility rule against a neighbouring batch says "Requires Interface Cut" — the buffer volume actually planned for that boundary. |
| `capacity_assessment` | Optional link to the route-capacity plan this batch is being validated against. |

### 7. Movement (`Movement`) and telemetry (`OT Telemetry Log`)

The actual pumping run, and the safety-monitoring layer around it.

| Field | Why it's there |
|---|---|
| `movement_status` | Draft → In Transit → Completed/Halted — the physical run's own state. |
| `pipeline_route` | Which physical line this is running on. |
| `monitored_pressure_bar` / `monitored_flow_rate_m3h` / `monitored_vibration_mm_s` | Live pipeline telemetry, either typed in directly here or arriving automatically via `OT Telemetry Log` (a secure, read-only ingest record from field instrumentation — see `README.md`'s OT Safety Boundary notes; it carries the identical three readings plus `source_tag`, the instrument's ID, and `ingest_channel`, where the reading came from). |
| `anomaly_score` / `anomaly_severity` / `alert_triggered` | Automatically scored against a documented safe-operating envelope — not a trained black box, a rule you can read in `utils.assess_pipeline_anomaly`. A genuinely dangerous reading raises an `AI Alert` (and, from there, an `AI Prediction` of failure risk and an `AI Recommendation` for what to do about it — none of which can act on the equipment without a human explicitly approving it; see `README.md` Phase 6). |

### 8. Terminal Receipt (`Terminal Receipt`)

The arrival at the destination — the exact same standard-volume fields and formula as Step 2 (Tank Measurement), just at the other end of the pipe.

| Field | Why it's there |
|---|---|
| `destination_tank` | Which tank is receiving this batch. |
| `observed_level_mm` / `water_dip_mm` / `observed_temperature_c` / `density_at_15c` / `measurement_uncertainty_percent` | Same meaning as Step 2 — see Concepts 1 and 2. |
| `dispatched_quantity_kl` | Fetched from the originating Pipeline Batch's planned volume — this is the "what left the origin" figure that Reconciliation (Step 9) compares against what actually arrived here. |

### 9. Reconciliation (`Reconciliation`) and Variance (`Variance`)

The honest accounting of the difference between what left and what arrived. See Concept 5.

| Field | Why it's there |
|---|---|
| `dispatched_quantity_kl` / `received_quantity_kl` | The two figures being compared. |
| `variance_kl` / `variance_percent` | Calculated: dispatched minus received. Positive means a loss in transit; negative means more arrived than left (a measurement quirk, recorded honestly either way, not "corrected" to zero). |
| `coverage_factor` | How statistically conservative the tolerance calculation should be (k=2 ≈ 95% confidence is the sensible default — see Concept 5); raise it for a wider, more forgiving tolerance band. |
| `origin_measurement_uncertainty_percent` / `destination_measurement_uncertainty_percent` / `combined_uncertainty_percent` / `tolerance_percent` | The actual metrology calculation from Concept 5 — all calculated, not entered. |
| `justification` | Mandatory, in writing, before an out-of-tolerance variance can be accepted — this becomes a permanent audit record (Decision Ledger), not a silent override. |

If there's a genuine recognised loss, a separate `Variance` record classifies *why*:

| Field | Why it's there |
|---|---|
| `loss_category` | Evaporation, Measurement Tolerance, Temperature Variation, Line Fill Change, Theft/Pilferage, Operational Loss, Unexplained, Other — forces every loss to be categorised, not just written off. |
| `workflow_state` | Pending Approval → Approved/Rejected — a second person has to sign off on the classification, same self-approval rule as Quality Result. |

### 10. Allocation (`Allocation`)

The moment KPC-custody stock becomes a specific customer's stock, on paper.

| Field | Why it's there |
|---|---|
| `nomination` / `reconciliation` | Which order is being fulfilled, from which reconciled (confirmed-actual) parcel. |
| `allocated_quantity_kl` | Checked against both the Nomination's remaining unfulfilled quantity and the Reconciliation's actually-received quantity — can't allocate more than either allows. |
| `allocation_basis` | How the quantity was decided — a straight Nomination match, pro-rata (if multiple customers share one parcel), or a manual override. |

### 11. Dispatch (`Dispatch`)

The physical delivery.

| Field | Why it's there |
|---|---|
| `dispatch_mode` | Truck, Rail, or Ex-Pipeline — how the product physically left KPC's custody. |
| `dispatched_quantity_kl` | Checked against the Allocation's own quantity — can't dispatch more than was allocated. |
| `vehicle_or_vessel_ref` / `driver_or_agent` | The delivery's own paper trail — truck plate, rail wagon number, who took custody. |
| `delivery_note` | Not something you fill in — a real ArcApps Delivery Note is created and submitted automatically the moment you submit this Dispatch. This *is* the delivery chalan. |

### 12. Invoice (`Invoice`)

| Field | Why it's there |
|---|---|
| `lines` | One row per Dispatch being billed, each priced against an active Tariff (Concept 7) — the quantity on each line is fetched from the Dispatch itself, never typed in, so you cannot bill more than was physically delivered. |
| `grand_total` | Calculated from the lines. |
| `sales_invoice` | Not something you fill in — a real ArcApps Sales Invoice is created and submitted automatically, and this is what actually posts to the General Ledger. |

### 13. Financial Posting (`Financial Posting`)

Nothing to fill in here at all — this record is created automatically the instant the Invoice is submitted, purely to give the Golden Thread a visible record that the GL posting happened (`gl_entry_count`, `total_amount`) and to flip to **Reversed** automatically if the Invoice is ever cancelled.

## EAM, HSEQ & Human Capital

Not part of the numbered 13 steps — these support the *equipment and people* side of running a pipeline safely, triggered mainly out of Step 7's AI cascade.

### Plant Asset — the physical equipment register

| Field | Why it's there |
|---|---|
| `asset_type` | Pipeline Segment, Pump Station, Storage Tank, Valve, Meter — what kind of equipment this is. |
| `status` | Operational / Under Maintenance / Decommissioned. |
| `criticality` | How much it would hurt if this specific piece of equipment failed — informs maintenance prioritisation. |

This is deliberately separate from ArcApps's own `Asset` doctype, which is a financial/depreciation record for accounting purposes — this one is for maintenance and reliability, not the balance sheet.

### Employee Certification — who's qualified to do what

| Field | Why it's there |
|---|---|
| `certification_type` | A fixed category list (Pipeline Operations, Confined Space Entry, Hot Work, Working at Height, Electrical Isolation, Excavation, Crane Operation, General HSEQ, Other) — deliberately the *same* list `Permit to Work.permit_type` uses, so the two can be matched by a straight string comparison. |
| `expiry_date` | The one field that actually matters operationally — `status` (Valid/Expired) is only a display convenience recalculated from this on save; anything that gates work against a certification re-checks `expiry_date` directly, live, every time, so a certification that quietly lapses is never accidentally treated as still valid. |

### Maintenance Work Order — the actual repair/inspection job

| Field | Why it's there |
|---|---|
| `ai_recommendation` | If this job came from the AI cascade, which recommendation triggered it — and that recommendation must already be Approved by a human (never auto-executed) before this Work Order can even be raised. |
| `asset` | Which piece of equipment this job is against. |
| `assigned_employee` / `required_certification_type` | Who's doing the work, and — if this job needs a specific HSEQ qualification (leave blank if it doesn't) — the system checks that person's `Employee Certification` for that exact type, and blocks the assignment outright if it's missing or expired. |

### Permit to Work — the safety sign-off for hazardous jobs

| Field | Why it's there |
|---|---|
| `permit_type` | Same category list as above — this is what gets matched against the assigned person's certifications. |
| `issued_to` | The person actually doing the hazardous work — checked against their certifications the same way as Maintenance Work Order, before the permit can even be issued. |
| `issued_by` | The HSEQ authorizer signing off — defaults to whoever is logged in. |
| `valid_from` / `valid_until` | The permit's time window — hazardous-work permits are never open-ended. |
| `precautions` | The specific control measures agreed for this job (e.g. lockout, gas monitoring, standby attendant). |

## AI, Decision Intelligence & Security

### AI Alert → AI Prediction → AI Recommendation

Three linked records, each narrower than the last: an Alert says *something* breached the safe envelope; a Prediction estimates *how likely* that leads to an actual failure and *over what timeframe* (`failure_risk_percent`, `risk_horizon`); a Recommendation proposes *what to do about it* (`recommended_action`) and sits in `Pending Approval` until a human with the Maintenance Manager role explicitly Approves or Rejects it — nothing acts on real equipment on its own.

### Decision Ledger — the permanent record of every judgment call

Not something you create by hand — one entry is written automatically the moment a real decision happens (a Quality Result Accept/Quarantine, a Variance Approve/Reject, an AI Recommendation Approve/Reject, or a Reconciliation tolerance override).

| Field | Why it's there |
|---|---|
| `decision_type` / `decision_outcome` | What kind of decision this was, and what was decided. |
| `is_ai_assisted` | Distinguishes a pure human judgment call (Quality Result, Variance classification) from a decision that's either approving an AI-generated suggestion or overriding an algorithmically-calculated figure (an AI Recommendation, or a Reconciliation tolerance override — the tolerance itself is calculated, so accepting past it is overriding a calculation, not a policy). |
| `decided_by` / `decided_on` / `rationale` | Who made the call, when, and — for anything that needed one — their written reasoning (e.g. a Reconciliation's justification). |

This record can never be edited or deleted by anyone, including a System Manager — that's the point of an audit ledger.

## Glossary — quick lookup for the industry terms used above

| Term | Plain-English meaning |
|---|---|
| **Midstream** | The part of the oil industry between refining and the fuel pump: storage, pipeline transport, and wholesale distribution of already-refined product. This is KPC's whole business. |
| **Custody transfer** | The specific legal/financial moment ownership and risk of a quantity of product pass from one party to another (vessel → KPC, KPC → customer). Whatever is measured at that moment is what gets paid for and disputed over. |
| **Standard volume** | A volume that's been mathematically corrected to a fixed reference temperature (15°C), so it can be fairly compared/traded regardless of what temperature it was actually measured at. |
| **VCF (Volume Correction Factor)** | The multiplier, looked up from a standardised industry table (API MPMS 11.1 / ASTM D1250), that converts an observed volume at its actual temperature into standard volume at 15°C. |
| **Dip / gauging** | Physically measuring how full a tank is — historically by lowering a graduated tape or rod ("dipping") through a hatch; the reading is the **dip** or **gauge**. |
| **Free water** | A layer of water that settles at the bottom of a storage tank, below the oil — not product, and excluded from every volume calculation. |
| **API Gravity** | An alternative scale (from the American Petroleum Institute) for expressing how dense a product is — the higher the number, the lighter the product. |
| **Transmix / interface (cut)** | The mixed boundary layer that forms where two different products touch inside a pipeline that's carrying them back-to-back. |
| **Batch / slug** | One contiguous quantity of a single product being pumped through a pipeline as part of a sequence of different products. |
| **Nomination** | The industry's term (borrowed directly into this app's doctype name) for a customer formally declaring/booking the quantity of product they want, against a specific available parcel. |
| **Allocation** | Formally assigning a confirmed, reconciled quantity of product to a specific customer's order — the moment KPC-custody stock becomes that customer's stock on paper. |
| **Reconciliation** | Comparing what was dispatched against what actually arrived, to confirm (or explain) any difference. |
| **Variance** | The actual numeric difference found during reconciliation, once it's being investigated/classified rather than just calculated. |
| **Tolerance** | The variance big enough to still be considered normal measurement noise rather than a real loss — calculated from measurement uncertainty, not a fixed policy number. |
| **Line fill** | The volume of product already sitting inside the pipeline itself at any given time (a long pipeline is never empty) — one of the normal, non-alarming reasons a small variance shows up during reconciliation. |
| **HSEQ** | Health, Safety, Environment, Quality — the umbrella term for the safety/compliance side of operations (permits, certifications, quality gates all sit under this). |
| **Permit to Work (PTW)** | A formal, time-boxed authorisation required before hazardous work (e.g. entering a confined space, hot work near flammable product) can begin, naming exactly who is authorised and what precautions are required. |
| **SCADA** | Supervisory Control and Data Acquisition — the industrial systems that monitor and (in a full deployment) control pipeline/plant equipment in real time. This app only ever *reads* from a SCADA-style source (`OT Telemetry Log`) — see `README.md`'s OT Safety Boundary notes for why it deliberately never writes back to one. |
| **Tariff** | A published rate card: a fixed price per unit volume for moving/selling a specific product over a specific route, valid for a specific period. |
| **Terminal** | A physical site where product is received, stored, and/or dispatched — a coastal discharge jetty or an inland depot, in this app's terms. |
| **Bill of Lading** | The vessel's own shipping document proving what cargo it's carrying and for whom — the shipment's legal paper trail, independent of anything KPC measures itself. |
