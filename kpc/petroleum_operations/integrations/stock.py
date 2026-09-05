# Copyright (c) 2026, ArcApps and contributors
# For license information, please see license.txt
"""Integration with standard ArcApps Stock.

Same philosophy as integrations.accounts: this module never edits a Stock
Ledger Entry itself. It maps each Oil Tank to a dedicated ArcApps Warehouse
and posts standard Stock Entries / a standard Delivery Note at the exact
points physical custody actually changes hands in the Golden Thread -

- Tank Measurement (Receipt from vessel)  -> Material Receipt
- Terminal Receipt (arrival at destination) -> Material Transfer
- Reconciliation (recognised transit loss)  -> Material Issue
- Dispatch (delivery to customer)           -> a real Delivery Note

- and lets ArcApps's own Stock Ledger do everything it already does well
(valuation, Bin quantities, Delivery Note -> Sales Invoice billing) instead
of a second, parallel accounting of the same physical stock.
"""

from __future__ import annotations

import frappe
from frappe import _
from frappe.utils import flt, today

from kpc.compat import patch_get_desk_link

patch_get_desk_link()

TANK_WAREHOUSE_GROUP = "Petroleum Tanks"


def _insert_and_submit(doc, *, item_code, warehouse, qty, action):
	"""Insert+submit a stock voucher, replacing ArcApps TypeError / negative
	stock noise with an operator-facing shortage message."""
	try:
		doc.insert()
		doc.submit()
		return doc
	except Exception as exc:
		_rethrow_as_readable_stock_error(
			exc, item_code, warehouse, qty, action
		)


def cancel_stock_voucher(doctype: str, name: str | None):
	"""Cancel a submitted Stock Entry / Delivery Note with the same readable
	shortage message used on submit. No-op if the voucher is missing or
	already cancelled."""
	if not name:
		return
	if frappe.db.get_value(doctype, name, "docstatus") != 1:
		return
	doc = frappe.get_doc(doctype, name)
	try:
		doc.cancel()
	except Exception as exc:
		item, warehouse, qty, action = voucher_shortage_context(doc)
		_rethrow_as_readable_stock_error(exc, item, warehouse, qty, action)


def wrap_stock_method(doc, method):
	"""Run Stock Entry / Delivery Note submit or cancel; rewrite shortage
	and get_desk_link TypeErrors into an operator-facing message."""
	from kpc.compat import patch_get_desk_link

	patch_get_desk_link()
	try:
		return method()
	except Exception as exc:
		item, warehouse, qty, action = voucher_shortage_context(doc)
		_rethrow_as_readable_stock_error(exc, item, warehouse, qty, action)


def voucher_shortage_context(doc):
	"""Best-effort item / tank / qty / action from a stock voucher."""
	row = doc.items[0] if getattr(doc, "items", None) else None
	if doc.doctype == "Delivery Note":
		return (
			row.item_code if row else None,
			row.warehouse if row else None,
			flt(row.qty) if row else 0,
			_("dispatch"),
		)

	purpose = doc.get("purpose") or doc.get("stock_entry_type") or ""
	action = {
		"Material Issue": _("write off as transit loss"),
		"Material Transfer": _("transfer"),
		"Material Receipt": _("receive"),
	}.get(purpose, _("post"))
	warehouse = None
	if row:
		warehouse = row.get("s_warehouse") or row.get("t_warehouse")
	return (
		row.item_code if row else None,
		warehouse,
		flt(row.qty) if row else 0,
		action,
	)


def _rethrow_as_readable_stock_error(exc, item_code, warehouse, qty, action):
	if _already_readable_shortage(exc) or not _is_stock_shortage(exc):
		raise

	frappe.clear_last_message()
	location = _tank_label(warehouse) or warehouse or _("the selected tank")
	frappe.throw(
		_(
			"Not enough stock of {0} in {1} to {2} {3} KL. "
			"Confirm the tank has sufficient volume before retrying."
		).format(
			frappe.bold(item_code or _("this product")),
			frappe.bold(location),
			action,
			flt(qty),
		),
		title=_("Insufficient Stock"),
	)


def _already_readable_shortage(exc: BaseException) -> bool:
	return (
		isinstance(exc, frappe.ValidationError)
		and "Confirm the tank has sufficient volume" in str(exc)
	)


def _is_stock_shortage(exc: BaseException) -> bool:
	message = str(exc)
	if isinstance(exc, TypeError) and (
		"show_title_with_name" in message or "get_desk_link" in message
	):
		return True

	try:
		from erpnext.stock.stock_ledger import NegativeStockError
	except ImportError:
		NegativeStockError = ()

	if isinstance(exc, NegativeStockError):
		return True

	if isinstance(exc, frappe.ValidationError) and (
		"needed in" in message or "Insufficient Stock" in message
	):
		return True

	return False


def _tank_label(warehouse: str) -> str | None:
	if not warehouse:
		return None
	tank = frappe.db.get_value(
		"Oil Tank", {"warehouse": warehouse}, "tank_code"
	)
	return tank or warehouse


def get_or_create_tank_warehouse(oil_tank) -> str:
	"""Ensure a dedicated Warehouse exists for this Oil Tank (1:1) and
	return its name. Called from Oil Tank.validate() on insert."""
	if oil_tank.warehouse:
		return oil_tank.warehouse

	company = frappe.db.get_value("Terminal", oil_tank.terminal, "company")
	if not company:
		frappe.throw(
			_("Terminal {0} has no Company set - required to provision a Warehouse.").format(oil_tank.terminal)
		)

	group = _get_or_create_warehouse_group(company)

	warehouse_name = f"{oil_tank.tank_code} - {frappe.db.get_value('Company', company, 'abbr')}"
	if not frappe.db.exists("Warehouse", warehouse_name):
		frappe.get_doc(
			{
				"doctype": "Warehouse",
				"warehouse_name": oil_tank.tank_code,
				"company": company,
				"parent_warehouse": group,
				"is_group": 0,
			}
		).insert(ignore_permissions=True)

	return warehouse_name


def _get_or_create_warehouse_group(company: str) -> str:
	abbr = frappe.db.get_value("Company", company, "abbr")
	group_name = f"{TANK_WAREHOUSE_GROUP} - {abbr}"
	if not frappe.db.exists("Warehouse", group_name):
		root = frappe.db.get_value("Warehouse", {"company": company, "is_group": 1, "parent_warehouse": ""})
		frappe.get_doc(
			{
				"doctype": "Warehouse",
				"warehouse_name": TANK_WAREHOUSE_GROUP,
				"company": company,
				"is_group": 1,
				"parent_warehouse": root,
			}
		).insert(ignore_permissions=True)
	return group_name


def resolve_origin_tank(journey_ref: str) -> str:
	"""The Tank Measurement (Step 2) is where a journey's product first
	enters a specific Oil Tank - that tank is the 'origin' every later
	stock movement (Terminal Receipt, Reconciliation) transfers out of."""
	tank = frappe.db.get_value("Tank Measurement", {"journey_ref": journey_ref}, "tank")
	if not tank:
		frappe.throw(
			_("No Tank Measurement found for Journey {0}; cannot resolve the origin tank.").format(journey_ref)
		)
	return tank


def post_material_receipt(
	warehouse: str, item_code: str, qty: float, journey_ref: str, rate: float | None = None
):
	"""Stock Entry: product entering the Golden Thread for the first time
	(vessel -> origin tank), at Tank Measurement."""
	entry = frappe.get_doc(
		{
			"doctype": "Stock Entry",
			"stock_entry_type": "Material Receipt",
			"purpose": "Material Receipt",
			"company": frappe.db.get_value("Warehouse", warehouse, "company"),
			"posting_date": today(),
			"journey_ref": journey_ref,
			"items": [
				{
					"item_code": item_code,
					"qty": flt(qty),
					"uom": "Kilolitre",
					"conversion_factor": 1,
					"t_warehouse": warehouse,
					"basic_rate": flt(rate) or None,
				}
			],
		}
	)
	return _insert_and_submit(
		entry,
		item_code=item_code,
		warehouse=warehouse,
		qty=qty,
		action=_("receive"),
	)


def post_material_transfer(
	source_warehouse: str, target_warehouse: str, item_code: str, qty: float, journey_ref: str
):
	"""Stock Entry: product moving tank-to-tank through the pipeline, at
	Terminal Receipt."""
	entry = frappe.get_doc(
		{
			"doctype": "Stock Entry",
			"stock_entry_type": "Material Transfer",
			"purpose": "Material Transfer",
			"company": frappe.db.get_value("Warehouse", source_warehouse, "company"),
			"posting_date": today(),
			"journey_ref": journey_ref,
			"items": [
				{
					"item_code": item_code,
					"qty": flt(qty),
					"uom": "Kilolitre",
					"conversion_factor": 1,
					"s_warehouse": source_warehouse,
					"t_warehouse": target_warehouse,
				}
			],
		}
	)
	return _insert_and_submit(
		entry,
		item_code=item_code,
		warehouse=source_warehouse,
		qty=qty,
		action=_("transfer"),
	)


def post_material_issue(warehouse: str, item_code: str, qty: float, journey_ref: str):
	"""Stock Entry: recognised transit loss, at Reconciliation - only
	called when a Reconciliation's variance_kl is positive (product
	dispatched but never arrived)."""
	entry = frappe.get_doc(
		{
			"doctype": "Stock Entry",
			"stock_entry_type": "Material Issue",
			"purpose": "Material Issue",
			"company": frappe.db.get_value("Warehouse", warehouse, "company"),
			"posting_date": today(),
			"journey_ref": journey_ref,
			"items": [
				{
					"item_code": item_code,
					"qty": flt(qty),
					"uom": "Kilolitre",
					"conversion_factor": 1,
					"s_warehouse": warehouse,
				}
			],
		}
	)
	return _insert_and_submit(
		entry,
		item_code=item_code,
		warehouse=warehouse,
		qty=qty,
		action=_("write off as transit loss"),
	)


def create_and_submit_delivery_note(dispatch) -> frappe.model.document.Document:
	"""Build and submit a standard Delivery Note for a Dispatch - this *is*
	the customer-facing delivery document (a 'delivery chalan'), and it's
	what posts the actual Stock Ledger Entry reducing the destination
	tank's Warehouse. Kept separate from Invoice/Sales Invoice: Dispatch
	(Step 11) happens before Invoice (Step 12), exactly like real delivery
	precedes billing.
	"""
	# The item actually being delivered is whatever the customer nominated
	# (Step 5) - not the destination tank's own "Designated Product" field.
	# That field is informational metadata about what a tank is normally
	# dedicated to, and its own description says it's deliberately left
	# blank for a multi-product/segregated tank - so a dispatch through
	# one of those tanks got item_code=None on its Delivery Note Item,
	# which ArcApps then rejects as an invalid Item at submit. Every other
	# stock voucher in this app already resolves its item the same way -
	# traced back through the real document chain (see Terminal Receipt's
	# post_stock_transfer(), which reads it off Movement, never off a
	# tank) - this brings Dispatch in line with that same pattern.
	warehouse = frappe.db.get_value("Oil Tank", dispatch.destination_tank, "warehouse")
	nomination = frappe.get_doc(
		"Nomination", frappe.db.get_value("Allocation", dispatch.allocation, "nomination")
	)
	product = nomination.product

	delivery_note = frappe.get_doc(
		{
			"doctype": "Delivery Note",
			"customer": dispatch.customer,
			"company": nomination.company,
			# Explicit rather than left to fall back through Customer/System
			# Settings defaults - a fresh site's System Settings.currency is
			# INR until someone changes it, which trips ArcApps's exchange
			# rate check the instant it disagrees with the Company/Price List.
			"currency": frappe.db.get_value("Company", nomination.company, "default_currency"),
			"posting_date": dispatch.dispatch_datetime,
			"journey_ref": dispatch.journey_ref,
			"items": [
				{
					"item_code": product,
					"qty": flt(dispatch.dispatched_quantity_kl),
					"uom": "Kilolitre",
					"conversion_factor": 1,
					"warehouse": warehouse,
					"rate": resolve_delivery_rate(product, nomination.origin_terminal, nomination.destination_terminal),
				}
			],
		}
	)
	return _insert_and_submit(
		delivery_note,
		item_code=product,
		warehouse=warehouse,
		qty=dispatch.dispatched_quantity_kl,
		action=_("dispatch"),
	)


def resolve_delivery_rate(product: str, origin_terminal: str, destination_terminal: str) -> float:
	"""The commercial Tariff (Step 12/Invoice's actual billing rate) if one
	is already on file for this route, else the Item's reference rate.

	Getting this right matters beyond cosmetics: ArcApps's Sales Invoice
	blocks billing a Delivery Note line for meaningfully more than that
	line's own amount (over-billing protection). If the two rates are
	wildly different - a raw reference rate vs. a real commercial tariff
	can easily be off by 10-30x for a bulk commodity - Invoice submission
	fails downstream with a confusing "Cannot overbill" error. Tariffs are
	rate cards that normally exist before a delivery happens, not decided
	per-invoice, so preferring one here reflects how this actually runs in
	practice, not just papering over the ArcApps check.
	"""
	tariff_rate = frappe.db.get_value(
		"Tariff",
		{
			"product": product,
			"origin_terminal": origin_terminal,
			"destination_terminal": destination_terminal,
			"is_active": 1,
		},
		"rate_per_kl",
	)
	if tariff_rate:
		return flt(tariff_rate)

	return flt(frappe.db.get_value("Item", product, "standard_rate"))


def propagate_journey_ref_to_stock_ledger(doc, method=None):
	"""doc_events hook: Stock Entry / Delivery Note on_submit.

	Mirrors integrations.accounts.propagate_journey_ref_to_gl_entries: runs
	after ArcApps has already created the Stock Ledger Entries, purely to
	stamp journey_ref onto rows that already exist.
	"""
	journey_ref = doc.get("journey_ref")
	if not journey_ref:
		return

	frappe.db.set_value(
		"Stock Ledger Entry", {"voucher_type": doc.doctype, "voucher_no": doc.name}, "journey_ref", journey_ref
	)
