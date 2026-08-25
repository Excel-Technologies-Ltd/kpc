# Copyright (c) 2026, ArcApps and contributors
# For license information, please see license.txt
"""Seed data for a complete, end-to-end demonstration of the KPC Operations
Golden Thread - one cargo, walked through all 13 steps, deliberately
routed through the AI predictive-maintenance cascade and the
variance/tolerance controls along the way so every rule built across all 5
phases has at least one real, persisted example to point to.

Run once with:

    bench --site <site> execute kpc.demo_data.create_demo_data

Safe to re-run: every record is created only if it doesn't already exist,
keyed on the demo's fixed business identifiers (vessel name, terminal
codes, etc.) rather than autoname counters. If an earlier run left an
*incomplete* journey (e.g. it predates a feature added since, or a step
failed partway), re-running create_demo_data() will not touch it - use
reset_demo_data() first:

    bench --site <site> execute kpc.demo_data.reset_demo_data

This cancels and deletes everything downstream of the demo's Oil Shipment
(which is immutable by design - see OilShipment.on_trash - so it is always
reused, never recreated) and rewinds the Journey back to Step 1, so the
next create_demo_data() rebuilds Steps 2-13 from scratch.
"""

from __future__ import annotations

import frappe
from frappe.utils import add_days, add_to_date, now_datetime, today

COMPANY = "Kenya Pipeline Company"
CUSTOMER = "Savannah Fuels Distributors"

# Doctypes carrying journey_ref directly, in the order they must be
# *cancelled* (most-downstream/last-created first) before they can be
# deleted. Financial Posting isn't submittable, so it's just deleted.
_SUBMITTABLE_DOWNSTREAM_DOCTYPES = [
	"Invoice",
	"Dispatch",
	"Allocation",
	"Reconciliation",
	"Permit to Work",
	"Maintenance Work Order",
	"Terminal Receipt",
	"Pipeline Batch",
	"Nomination",
	"Tank Measurement",
]
_NON_SUBMITTABLE_DOWNSTREAM_DOCTYPES = [
	"Financial Posting",
	# Decision Ledger entries are otherwise immutable and undeletable through
	# the desk (see decision_ledger.json's permissions) - deleted here only
	# via force=True, so a demo reset doesn't leave orphaned entries pointing
	# at Variance/Quality Result/AI Recommendation/Reconciliation records
	# that reset_demo_data is about to delete too.
	"Decision Ledger",
	"Variance",
	"AI Recommendation",
	"AI Prediction",
	"AI Alert",
	"Movement",
	"Quality Result",
	"Inventory Position",
]


def _journey_is_fully_built(journey_ref: str) -> bool:
	"""'Complete' means more than reaching Step 13 - a journey built by an
	older version of this script can be at Step 13 while still missing a
	feature added since (e.g. Dispatch.delivery_note, added when the
	ERPNext Stock integration was introduced). Check for that explicitly
	rather than trusting current_step alone."""
	if frappe.db.get_value("Journey", journey_ref, "current_step") != "13. Financial Posting":
		return False

	dispatches = frappe.get_all("Dispatch", filters={"journey_ref": journey_ref}, pluck="delivery_note")
	return bool(dispatches) and all(dispatches)


def create_demo_data():
	frappe.set_user("Administrator")

	_ensure_erpnext_prerequisites()
	terminals = _create_terminals()
	product = _create_product()
	tanks = _create_tanks(terminals, product)
	customer = _create_customer()
	tariff = _create_tariff(terminals, product)
	maintenance_crew = _create_maintenance_crew()
	plant_asset = _create_plant_asset(terminals)

	journey_ref = _run_golden_thread(terminals, product, tanks, customer, tariff, maintenance_crew, plant_asset)

	frappe.db.commit()
	_print_summary(journey_ref)
	return journey_ref


def seed_if_ready():
	"""Called from kpc.install.after_install, once the app's own structural
	setup (roles, custom fields, Kilolitre UOM, Workflows, Workspace - see
	kpc.install) has already run. Never called directly by hooks.py.

	Still deliberately defensive on top of that: create_demo_data() also
	assumes a Company with a Chart of Accounts, a Cost Center, an Item
	Group, a Customer Group, a Territory, and a Selling Price List already
	exist - true once ERPNext's setup wizard has run, not necessarily true
	the instant an app installs. A raised exception here would abort the
	*entire app installation*, not just the seeding, so failures are caught
	and reported, never raised - worst case, demo data doesn't appear and
	it's created the same way as on any other site:
	`bench execute kpc.demo_data.create_demo_data`.
	"""
	if not frappe.defaults.get_global_default("company"):
		print(
			"kpc: skipping demo data - no default Company found yet (run the ERPNext setup wizard "
			"first, then `bench execute kpc.demo_data.create_demo_data` whenever you're ready)."
		)
		return

	try:
		create_demo_data()
	except Exception:
		frappe.db.rollback()
		frappe.log_error(title="KPC demo data seeding failed during after_install")
		print(
			"kpc: demo data seeding failed during install (see Error Log) - the app itself installed "
			"fine. Fix the underlying issue, then run `bench execute kpc.demo_data.create_demo_data` "
			"manually; if it left a partial Journey, run `bench execute kpc.demo_data.reset_demo_data` first."
		)


def reset_demo_data(vessel_name: str = "MT African Pride", force: bool = False):
	"""Cancel and delete everything downstream of the demo Oil Shipment so
	create_demo_data() can rebuild Steps 2-13 cleanly. The Oil Shipment and
	Journey themselves are kept (Oil Shipment cannot be deleted by design);
	the Journey's audit log is rewound to just its Step 1 entry.

	Pass force=True to rebuild an already-complete journey anyway. The
	"already complete, nothing to reset" check exists so a routine
	create_demo_data() call is a cheap no-op on a healthy site, not to
	protect a journey someone is deliberately rebuilding - which is exactly
	what's needed the first time this runs after a feature is added that the
	existing demo journey predates and never exercised (e.g. the Decision
	Ledger, added in Phase 6: a journey built before that code existed has
	no Decision Ledger entries and never will unless rebuilt)."""
	frappe.set_user("Administrator")

	journey_ref = frappe.db.get_value("Oil Shipment", {"vessel_name": vessel_name}, "journey_ref")
	if not journey_ref:
		print(f"No demo journey found for vessel '{vessel_name}' - nothing to reset.")
		return

	journey = frappe.get_doc("Journey", journey_ref)
	if _journey_is_fully_built(journey_ref) and not force:
		print(f"Journey {journey_ref} is already complete - nothing to reset. Pass force=True to rebuild anyway.")
		return

	capacity_assessment = frappe.db.get_value(
		"Pipeline Batch", {"journey_ref": journey_ref}, "capacity_assessment"
	)

	for doctype in _SUBMITTABLE_DOWNSTREAM_DOCTYPES:
		for name in frappe.get_all(doctype, filters={"journey_ref": journey_ref}, pluck="name"):
			doc = frappe.get_doc(doctype, name)
			if doc.docstatus == 1:
				doc.cancel()
			frappe.delete_doc(doctype, name, ignore_permissions=True, force=True)

	for doctype in _NON_SUBMITTABLE_DOWNSTREAM_DOCTYPES:
		for name in frappe.get_all(doctype, filters={"journey_ref": journey_ref}, pluck="name"):
			frappe.delete_doc(doctype, name, ignore_permissions=True, force=True)

	if capacity_assessment:
		frappe.delete_doc("Capacity Assessment", capacity_assessment, ignore_permissions=True, force=True)

	journey.reload()
	journey.journey_log = [row for row in journey.journey_log if row.reference_doctype == "Oil Shipment"]
	journey.current_step = "1. Shipment"
	journey.save(ignore_permissions=True)

	frappe.db.commit()
	print(f"Reset {journey_ref} back to Step 1. Run create_demo_data() to rebuild Steps 2-13.")


# ---------------------------------------------------------------------------
# Masters
# ---------------------------------------------------------------------------


def _ensure_erpnext_prerequisites():
	"""Root nodes (Item Group / Customer Group / Territory) and a default
	Selling Price List are normally seeded by ERPNext's setup wizard, which
	a Company existing doesn't actually guarantee happened - the wizard is
	a manual, human-driven step (see kpc.install for the analogous problem
	with `bench install-app` and patches.txt). Rather than assume, create
	whatever's missing so this script only ever depends on the one thing
	that genuinely can't be faked: a Company with a Chart of Accounts.

	Also aligns System Settings.currency to the Company's currency: it's a
	site-wide global that Frappe otherwise leaves at its own default (INR)
	until someone changes it, and several ERPNext controllers fall back to
	it when a document's own currency isn't explicit enough for them -
	setting it explicitly on each document (Invoice, Delivery Note, ...)
	isn't sufficient on its own to avoid a spurious cross-currency Exchange
	Rate requirement everywhere that global default disagrees.
	"""
	company_currency = frappe.db.get_value("Company", COMPANY, "default_currency")

	if not frappe.get_all("Item Group", filters={"is_group": 1, "parent_item_group": ""}, limit=1):
		frappe.get_doc({"doctype": "Item Group", "item_group_name": "All Item Groups", "is_group": 1}).insert()

	if not frappe.db.exists("Customer Group", "All Customer Groups"):
		frappe.get_doc(
			{"doctype": "Customer Group", "customer_group_name": "All Customer Groups", "is_group": 1}
		).insert()

	if not frappe.db.exists("Territory", "All Territories"):
		frappe.get_doc({"doctype": "Territory", "territory_name": "All Territories", "is_group": 1}).insert()

	if frappe.db.exists("Price List", "Standard Selling"):
		frappe.db.set_value("Price List", "Standard Selling", "currency", company_currency)
	else:
		frappe.get_doc(
			{
				"doctype": "Price List",
				"price_list_name": "Standard Selling",
				"selling": 1,
				"currency": company_currency,
			}
		).insert()
	if not frappe.db.get_single_value("Selling Settings", "selling_price_list"):
		frappe.db.set_single_value("Selling Settings", "selling_price_list", "Standard Selling")

	# Not a System Settings field - Frappe's global "currency" default lives
	# in the generic key/value defaults store (frappe.db.get_default /
	# set_default), separate from any single doctype.
	if frappe.db.get_default("currency") != company_currency:
		frappe.db.set_default("currency", company_currency)


def _create_terminals():
	defs = {
		"MSA-01": {
			"terminal_name": "Mombasa Terminal",
			"terminal_type": "Discharge",
			"location": "Mombasa, Kenya",
			"company": COMPANY,
		},
		"NBO-01": {
			"terminal_name": "Nairobi Terminal (Embakasi)",
			"terminal_type": "Loading",
			"location": "Nairobi, Kenya",
			"company": COMPANY,
		},
	}
	terminals = {}
	for code, fields in defs.items():
		if not frappe.db.exists("Terminal", code):
			frappe.get_doc({"doctype": "Terminal", "terminal_code": code, **fields}).insert()
		terminals[code] = code
	return terminals


def _create_product():
	# Not a standard ERPNext fixture - it's normally seeded by the setup
	# wizard's demo data, which a fresh install may never have run. Create
	# it directly rather than assuming it's there, same as the Kilolitre
	# UOM (see patches/v0_0/add_stock_custom_fields.py).
	item_group = "Products"
	if not frappe.db.exists("Item Group", item_group):
		frappe.get_doc(
			{
				"doctype": "Item Group",
				"item_group_name": item_group,
				"parent_item_group": frappe.db.get_value("Item Group", {"is_group": 1, "parent_item_group": ""}),
				"is_group": 0,
			}
		).insert()

	item_code = "AGO-DIESEL"
	if not frappe.db.exists("Item", item_code):
		frappe.get_doc(
			{
				"doctype": "Item",
				"item_code": item_code,
				"item_name": "Automotive Gas Oil (Diesel)",
				"item_group": item_group,
				"stock_uom": "Kilolitre",
				"density_at_15c": 0.8300,
				"reference_temperature_c": 15,
				"is_petroleum_product": 1,
				"standard_rate": 120,
			}
		).insert()
	return item_code


def _create_tanks(terminals, product):
	defs = {
		"TK-101": {
			"tank_name": "Mombasa Tank 101",
			"terminal": terminals["MSA-01"],
			"capacity_kl": 10000,
			"reference_height_mm": 15000,
		},
		"TK-201": {
			"tank_name": "Nairobi Tank 201",
			"terminal": terminals["NBO-01"],
			"capacity_kl": 8000,
			"reference_height_mm": 12000,
		},
	}
	tanks = {}
	for code, fields in defs.items():
		if not frappe.db.exists("Oil Tank", code):
			frappe.get_doc(
				{
					"doctype": "Oil Tank",
					"tank_code": code,
					"product": product,
					"current_state": "Active",
					"safe_fill_capacity_kl": fields["capacity_kl"] * 0.95,
					"dead_stock_kl": fields["capacity_kl"] * 0.02,
					**fields,
				}
			).insert()
		elif not frappe.db.get_value("Oil Tank", code, "warehouse"):
			# Tank predates the Warehouse-provisioning feature - before_insert
			# only fires on creation, so backfill it explicitly here.
			from kpc.petroleum_operations.integrations.stock import get_or_create_tank_warehouse

			tank = frappe.get_doc("Oil Tank", code)
			tank.db_set("warehouse", get_or_create_tank_warehouse(tank), update_modified=False)
		tanks[code] = code
	return tanks


def _create_customer():
	if not frappe.db.exists("Customer", CUSTOMER):
		frappe.get_doc(
			{
				"doctype": "Customer",
				"customer_name": CUSTOMER,
				"customer_group": "All Customer Groups",
				"territory": "All Territories",
				# Explicit rather than inherited from System Settings.currency,
				# which defaults to INR on a fresh site until someone changes
				# it - leaving this blank forces an INR/KES Exchange Rate
				# lookup (which won't exist) the moment Invoice bills in KES.
				"default_currency": "KES",
			}
		).insert()
	return CUSTOMER


def _create_tariff(terminals, product):
	"""Created here, alongside the other masters, rather than at Invoice
	time - a Tariff is a rate card that exists ahead of any specific
	delivery, not something decided per-invoice. This also means Dispatch
	(Step 11) can bill Delivery Notes at the real commercial rate instead
	of a rough Item reference price - see integrations.stock.resolve_delivery_rate."""
	filters = {
		"product": product,
		"origin_terminal": terminals["MSA-01"],
		"destination_terminal": terminals["NBO-01"],
	}
	name = frappe.db.get_value("Tariff", filters)
	if name:
		return name

	tariff = frappe.get_doc({"doctype": "Tariff", "rate_per_kl": 3500, "currency": "KES", **filters}).insert()
	return tariff.name


def _create_maintenance_crew():
	"""Two Employees, illustrating both sides of the HSEQ certification gate
	(Phase 5): James holds current certifications and is the one actually
	assigned to the demo Work Order and Permit to Work below; Peter's
	Confined Space Entry certification is deliberately expired and left
	untouched as reference data - open his record, or try assigning him to
	a Work Order requiring that certification, to see assert_certification_current
	block it."""
	if not frappe.db.exists("Company", COMPANY):
		return None, None

	def _employee(first_name, last_name):
		existing = frappe.db.get_value("Employee", {"first_name": first_name, "last_name": last_name})
		if existing:
			return existing
		employee = frappe.get_doc(
			{
				"doctype": "Employee",
				"first_name": first_name,
				"last_name": last_name,
				"gender": "Male",
				"date_of_birth": add_days(today(), -365 * 30),
				"date_of_joining": add_days(today(), -365 * 3),
				"company": COMPANY,
			}
		).insert()
		return employee.name

	def _certification(employee, certification_type, expiry_date):
		if frappe.db.exists("Employee Certification", {"employee": employee, "certification_type": certification_type}):
			return
		frappe.get_doc(
			{
				"doctype": "Employee Certification",
				"employee": employee,
				"certification_type": certification_type,
				"certificate_number": f"{certification_type[:3].upper()}-{employee}",
				"issuing_authority": "KPC HSEQ Department",
				"issue_date": add_days(expiry_date, -365 * 2),
				"expiry_date": expiry_date,
			}
		).insert()

	james = _employee("James", "Mwangi")
	_certification(james, "Pipeline Operations", add_days(today(), 365))
	_certification(james, "Confined Space Entry", add_days(today(), 365))

	peter = _employee("Peter", "Otieno")
	_certification(peter, "Confined Space Entry", add_days(today(), -30))  # deliberately expired

	return james, peter


def _create_plant_asset(terminals):
	asset_tag = "PMP-KP2"
	if frappe.db.exists("Plant Asset", asset_tag):
		return asset_tag
	frappe.get_doc(
		{
			"doctype": "Plant Asset",
			"asset_tag": asset_tag,
			"asset_name": "Line 1 Pump Station KP2",
			"asset_type": "Pump Station",
			"terminal": terminals["MSA-01"],
			"status": "Operational",
			"criticality": "High",
			"commissioning_date": add_days(today(), -365 * 5),
		}
	).insert()
	return asset_tag


# ---------------------------------------------------------------------------
# The Golden Thread - one journey, all 13 steps
# ---------------------------------------------------------------------------


def _run_golden_thread(terminals, product, tanks, customer, tariff, maintenance_crew, plant_asset) -> str:
	"""Steps 2-13 below assume nothing downstream of the Oil Shipment exists
	yet - true on a first run, and true again after reset_demo_data() has
	cancelled/deleted everything downstream of an incomplete journey (Oil
	Shipment itself is immutable by design - see OilShipment.on_trash - so
	a reset can never delete it; it can only be reused)."""
	vessel_name = "MT African Pride"
	existing = frappe.db.get_value(
		"Oil Shipment", {"vessel_name": vessel_name}, ["name", "journey_ref"], as_dict=True
	)

	if existing:
		if _journey_is_fully_built(existing.journey_ref):
			return existing.journey_ref
		shipment = frappe.get_doc("Oil Shipment", existing.name)
		journey_ref = existing.journey_ref
	else:
		# Step 1: Shipment
		shipment = frappe.get_doc(
			{
				"doctype": "Oil Shipment",
				"vessel_name": vessel_name,
				"vessel_imo_number": "IMO9876543",
				"bill_of_lading_no": "BL-KPC-2026-0417",
				"product": product,
				"terminal": terminals["MSA-01"],
				"planned_quantity_kl": 5000,
				"eta": now_datetime(),
			}
		).insert()
		journey_ref = shipment.journey_ref

		for state in ("Vessel Arrived", "Discharging", "Received"):
			shipment.reload()
			shipment.workflow_state = state
			shipment.save()

	# Step 2: Receipt (Tank Measurement)
	tank_measurement = frappe.get_doc(
		{
			"doctype": "Tank Measurement",
			"journey_ref": journey_ref,
			"shipment": shipment.name,
			"tank": tanks["TK-101"],
			"measurement_type": "Closing",
			"observed_level_mm": 6000,
			"observed_temperature_c": 28,
			"density_at_15c": 0.8300,
		}
	).insert()
	tank_measurement.submit()

	# Step 3: Quality Result - Accepted
	quality_result = frappe.get_doc(
		{
			"doctype": "Quality Result",
			"journey_ref": journey_ref,
			"shipment": shipment.name,
			"tank": tanks["TK-101"],
			"product": product,
			"lab_reference_no": "LAB-2026-0417",
			"parameters": [
				{
					"parameter": "Density @ 15C",
					"specification_min": 0.82,
					"specification_max": 0.845,
					"result_value": 0.83,
					"uom": "kg/L",
				},
				{
					"parameter": "Water Content",
					"specification_min": 0,
					"specification_max": 0.05,
					"result_value": 0.01,
					"uom": "% vol",
				},
				{
					"parameter": "Flash Point",
					"specification_min": 55,
					"specification_max": 0,
					"result_value": 62,
					"uom": "C",
				},
			],
		}
	).insert()
	quality_result.workflow_state = "Accepted"
	quality_result.save()

	# Step 4: Inventory Position (origin receipt)
	frappe.get_doc(
		{
			"doctype": "Inventory Position",
			"journey_ref": journey_ref,
			"tank": tanks["TK-101"],
			"position_date": today(),
			"opening_volume_kl": 0,
			"receipts_kl": tank_measurement.net_standard_volume_kl,
		}
	).insert()

	# Step 5: Nomination
	nomination = frappe.get_doc(
		{
			"doctype": "Nomination",
			"journey_ref": journey_ref,
			"customer": customer,
			"company": COMPANY,
			"origin_terminal": terminals["MSA-01"],
			"destination_terminal": terminals["NBO-01"],
			"nominated_quantity_kl": 2000,
			"requested_delivery_date": add_days(today(), 3),
		}
	).insert()
	nomination.submit()

	# Step 6: Capacity Assessment + Pipeline Batch
	capacity = frappe.get_doc(
		{
			"doctype": "Capacity Assessment",
			"origin_terminal": terminals["MSA-01"],
			"destination_terminal": terminals["NBO-01"],
			"period_start": today(),
			"period_end": add_days(today(), 6),
			"pipeline_capacity_kl_per_day": 1000,
		}
	).insert()

	pipeline_batch = frappe.get_doc(
		{
			"doctype": "Pipeline Batch",
			"nomination": nomination.name,
			"batch_sequence_no": 1,
			"planned_volume_kl": 2000,
			"capacity_assessment": capacity.name,
			"scheduled_start": now_datetime(),
			"scheduled_end": add_to_date(now_datetime(), hours=8),
		}
	).insert()
	pipeline_batch.submit()

	# Step 7: Movement - deliberately breached telemetry, to demonstrate the
	# full AI Alert -> Prediction -> Recommendation -> Approval -> Work Order
	# cascade with real, persisted records.
	movement = frappe.get_doc(
		{
			"doctype": "Movement",
			"pipeline_batch": pipeline_batch.name,
			"pipeline_route": "Mombasa-Nairobi (Line 1)",
			"movement_status": "In Transit",
			"start_datetime": now_datetime(),
			"monitored_pressure_bar": 60,  # over the 15-45 bar normal range
			"monitored_flow_rate_m3h": 500,
			"monitored_vibration_mm_s": 10.0,  # over the 7.1 mm/s alarm threshold
		}
	).insert()

	ai_recommendation_name = frappe.get_all(
		"AI Recommendation", filters={"movement": movement.name}, pluck="name"
	)[0]
	ai_recommendation = frappe.get_doc("AI Recommendation", ai_recommendation_name)
	ai_recommendation.details = (
		"Vibration and pressure both elevated on Line 1 pump station KP2 - dispatched inspection team."
	)
	ai_recommendation.workflow_state = "Approved"
	ai_recommendation.save()

	james, _peter = maintenance_crew
	work_order = frappe.get_doc(
		{
			"doctype": "Maintenance Work Order",
			"ai_recommendation": ai_recommendation.name,
			"journey_ref": journey_ref,
			"asset": plant_asset,
			"work_order_type": "Corrective Maintenance",
			"description": "Inspect and calibrate Line 1 pump station KP2 following pressure/vibration alert.",
			"scheduled_date": add_days(today(), 1),
			"assigned_employee": james,
			"required_certification_type": "Pipeline Operations",
			"execution_status": "Completed",
			"completion_notes": "Pump seal replaced; vibration back within normal range on re-test.",
		}
	).insert()
	work_order.submit()

	# Step 7 (HSEQ): Permit to Work - the pump seal replacement required
	# opening the pump housing, a Confined Space Entry job. James holds a
	# current certification for it (see _create_maintenance_crew), so the
	# permit issues cleanly; closed once the work order's own execution was
	# marked Completed above.
	permit = frappe.get_doc(
		{
			"doctype": "Permit to Work",
			"work_order": work_order.name,
			"permit_type": "Confined Space Entry",
			"issued_to": james,
			"valid_from": now_datetime(),
			"valid_until": add_to_date(now_datetime(), hours=8),
			"precautions": "Isolate and lock out pump motor; continuous gas monitoring; standby attendant at all times.",
		}
	).insert()
	permit.submit()
	permit.close_permit()

	movement.reload()
	movement.movement_status = "Completed"
	movement.end_datetime = now_datetime()
	movement.save()

	# Step 8: Terminal Receipt
	terminal_receipt = frappe.get_doc(
		{
			"doctype": "Terminal Receipt",
			"movement": movement.name,
			"destination_tank": tanks["TK-201"],
			"observed_level_mm": 3000,
			"observed_temperature_c": 26,
			"density_at_15c": 0.8300,
		}
	).insert()
	terminal_receipt.submit()

	# Step 9: Reconciliation - deliberately over the default 0.5% tolerance,
	# to demonstrate the justification gate, then Variance classification
	# and approval.
	reconciliation = frappe.get_doc(
		{"doctype": "Reconciliation", "terminal_receipt": terminal_receipt.name}
	).insert()
	reconciliation.justification = (
		f"Variance of {reconciliation.variance_percent}% is within expected VCF temperature "
		"correction for an 11C swing between origin and destination gauging; no physical loss "
		"indicators observed. Approved for acceptance by Finance."
	)
	reconciliation.save()
	reconciliation.submit()

	variance = frappe.get_doc(
		{
			"doctype": "Variance",
			"reconciliation": reconciliation.name,
			"loss_category": "Temperature Variation",
			"classification_notes": "Consistent with VCF correction; no corrective action required.",
		}
	).insert()
	variance.workflow_state = "Approved"
	variance.save()

	# Step 10: Allocation
	allocation = frappe.get_doc(
		{
			"doctype": "Allocation",
			"nomination": nomination.name,
			"reconciliation": reconciliation.name,
			"allocated_quantity_kl": reconciliation.received_quantity_kl,
		}
	).insert()
	allocation.submit()

	# Step 11: Dispatch - two consignments, to show a multi-line Invoice later
	dispatch_1 = frappe.get_doc(
		{
			"doctype": "Dispatch",
			"allocation": allocation.name,
			"destination_tank": tanks["TK-201"],
			"dispatch_mode": "Truck",
			"dispatched_quantity_kl": 1200,
			"vehicle_or_vessel_ref": "KDA 214C",
			"driver_or_agent": "J. Mwangi",
		}
	).insert()
	dispatch_1.submit()

	dispatch_2 = frappe.get_doc(
		{
			"doctype": "Dispatch",
			"allocation": allocation.name,
			"destination_tank": tanks["TK-201"],
			"dispatch_mode": "Truck",
			"dispatched_quantity_kl": 700,
			"vehicle_or_vessel_ref": "KDB 552F",
			"driver_or_agent": "S. Otieno",
		}
	).insert()
	dispatch_2.submit()

	# Step 12: Invoice (Tariff was already created as a master, above - see
	# _create_tariff) -> rated lines -> real Sales Invoice on submit
	invoice = frappe.get_doc(
		{
			"doctype": "Invoice",
			"journey_ref": journey_ref,
			"customer": customer,
			"company": COMPANY,
			"lines": [
				{"dispatch": dispatch_1.name, "tariff": tariff},
				{"dispatch": dispatch_2.name, "tariff": tariff},
			],
		}
	).insert()
	invoice.submit()

	# Step 13: Financial Posting is created automatically by Invoice.on_submit.

	return journey_ref


def _print_summary(journey_ref: str):
	journey = frappe.get_doc("Journey", journey_ref)
	print("\n" + "=" * 72)
	print("KPC OPERATIONS - DEMO DATA SEEDED")
	print("=" * 72)
	print(f"Golden Thread: {journey_ref}  (status={journey.status}, step={journey.current_step})")
	print(f"Audit trail: {len(journey.journey_log)} entries")
	print("-" * 72)
	for row in journey.journey_log:
		print(f"  {row.step:<26} {row.reference_doctype:<22} {row.reference_name}")

	print("-" * 72)
	print("EAM, HSEQ & Human Capital (Phase 5):")
	for row in frappe.get_all("Plant Asset", fields=["asset_tag", "asset_name", "status"]):
		print(f"  Plant Asset          {row.asset_tag:<22} {row.asset_name} ({row.status})")
	for row in frappe.get_all(
		"Employee Certification", fields=["employee", "certification_type", "status"], order_by="creation"
	):
		employee_name = frappe.db.get_value("Employee", row.employee, "employee_name") or row.employee
		print(f"  Certification        {employee_name:<22} {row.certification_type} ({row.status})")

	print("-" * 72)
	print("ERPNext Stock & Accounts (created alongside the KPC records above):")
	tank_names = ("TK-101", "TK-201")
	warehouses = frappe.get_all("Warehouse", filters={"warehouse_name": ["in", tank_names]}, pluck="name")
	for name in warehouses:
		qty = frappe.db.get_value("Bin", {"warehouse": name, "item_code": "AGO-DIESEL"}, "actual_qty") or 0
		print(f"  Warehouse            {name:<22} {qty} KL on hand")

	# docstatus=1 only: a journey rebuilt via reset_demo_data(force=True)
	# leaves its earlier generation's Stock Entries/Delivery Notes on the
	# books as cancelled history (correctly reversed, not deleted - that's
	# real accounting/stock-ledger practice), but this summary is about what
	# currently backs the journey, not its full edit history.
	stock_entries = frappe.get_all(
		"Stock Entry",
		filters={"journey_ref": journey_ref, "docstatus": 1},
		fields=["name", "stock_entry_type"],
		order_by="creation",
	)
	for row in stock_entries:
		print(f"  Stock Entry          {row.stock_entry_type:<22} {row.name}")
	for row in frappe.get_all(
		"Delivery Note",
		filters={"journey_ref": journey_ref, "docstatus": 1},
		fields=["name", "grand_total"],
		order_by="creation",
	):
		print(f"  Delivery Note        {row.name:<22} KES {row.grand_total:,.2f}")
	invoice = frappe.db.get_value("Invoice", {"journey_ref": journey_ref}, "sales_invoice")
	if invoice and frappe.db.get_value("Sales Invoice", invoice, "docstatus") == 1:
		si = frappe.db.get_value("Sales Invoice", invoice, "grand_total")
		print(f"  Sales Invoice        {invoice:<22} KES {si:,.2f}")

	decisions = frappe.get_all(
		"Decision Ledger",
		filters={"journey_ref": journey_ref},
		fields=["name", "decision_type", "decision_outcome", "is_ai_assisted"],
		order_by="creation",
	)
	if decisions:
		print("-" * 72)
		print("Decision Ledger (Phase 6 - immutable, one entry per decision below):")
		for row in decisions:
			flag = "AI-assisted" if row.is_ai_assisted else "manual"
			print(f"  {row.name:<10} {row.decision_type:<34} {row.decision_outcome:<20} ({flag})")

	print("=" * 72)
	print(f"Open the KPC workspace in Desk, or go straight to /app/journey/{journey_ref}")
	print("=" * 72 + "\n")
