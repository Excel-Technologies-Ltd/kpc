# Copyright (c) 2026, ArcApps and contributors
# For license information, please see license.txt

import frappe
from frappe.utils import flt, today


@frappe.whitelist()
def get_stock_movement(terminal=None, date=None, tank=None):
	"""Returns actual stock movement data from Frappe without any artificial padding:
	Opening, Receipts, Deliveries, Losses, and Closing volume in m³ / KL.
	"""
	date = date or today()

	filters = {}
	if date:
		filters["position_date"] = date
	if tank:
		filters["tank"] = tank

	# 1. Primary Source: Inventory Position documents
	positions = frappe.get_all(
		"Inventory Position",
		filters=filters,
		fields=[
			"opening_volume_kl",
			"receipts_kl",
			"dispatches_kl",
			"adjustments_kl",
			"closing_volume_kl",
			"tank",
		],
	)

	opening = 0.0
	receipts = 0.0
	deliveries = 0.0
	losses = 0.0
	closing = 0.0

	if positions:
		for pos in positions:
			opening += flt(pos.get("opening_volume_kl"))
			receipts += flt(pos.get("receipts_kl"))
			deliveries += flt(pos.get("dispatches_kl"))
			losses += flt(pos.get("adjustments_kl"))
			closing += flt(pos.get("closing_volume_kl"))
	else:
		# 2. Derive from operational documents (Terminal Receipts, Dispatches, Measurements)
		doc_filters = {}
		if terminal:
			doc_filters["terminal"] = terminal

		# Actual receipts from Terminal Receipt
		receipt_records = frappe.get_all(
			"Terminal Receipt",
			filters=doc_filters,
			fields=["net_standard_volume_kl", "gross_observed_volume_kl"],
		)
		for r in receipt_records:
			receipts += flt(r.get("net_standard_volume_kl") or r.get("gross_observed_volume_kl"))

		# Actual deliveries from Dispatch
		dispatch_records = frappe.get_all(
			"Dispatch",
			filters=doc_filters,
			fields=["actual_quantity_kl", "planned_quantity_kl"],
		)
		for d in dispatch_records:
			deliveries += flt(d.get("actual_quantity_kl") or d.get("planned_quantity_kl"))

		# Actual losses/adjustments from Reconciliation
		recon_records = frappe.get_all(
			"Reconciliation",
			fields=["variance_kl"],
		)
		for rec in recon_records:
			losses += flt(rec.get("variance_kl"))

		# Actual tank stock measurements
		meas_filters = {}
		if tank:
			meas_filters["tank"] = tank

		measurements = frappe.get_all(
			"Tank Measurement",
			filters=meas_filters,
			fields=["net_standard_volume_kl", "gross_observed_volume_kl", "measurement_type"],
			order_by="creation desc",
		)
		if measurements:
			# Opening measurements or total measured volume
			for m in measurements:
				if m.get("measurement_type") in ("Opening", "Pre-Transfer", "Morning Dip"):
					opening += flt(m.get("net_standard_volume_kl") or m.get("gross_observed_volume_kl"))

		# If no specific opening measurements, calculate opening from current balance
		closing = flt(opening + receipts - deliveries + losses)

	net_change = flt(closing - opening)
	net_change_pct = flt((net_change / opening * 100.0) if opening > 0 else 0.0)
	turnover_pct = flt(((receipts + deliveries) / opening * 100.0) if opening > 0 else 0.0)

	return {
		"unit": "m³",
		"period": "today",
		"date": str(date),
		"opening": round(opening, 2),
		"receipts": round(receipts, 2),
		"deliveries": round(deliveries, 2),
		"losses": round(losses, 2),
		"closing": round(closing, 2),
		"summary": {
			"net_change": round(net_change, 2),
			"net_change_percent": round(net_change_pct, 2),
			"turnover_rate_percent": round(turnover_pct, 2),
		},
	}
