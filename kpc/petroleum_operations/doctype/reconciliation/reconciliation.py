# Copyright (c) 2026, ArcApps and contributors
# For license information, please see license.txt

import math

import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils import flt, now_datetime

from kpc.petroleum_operations.decision_ledger import log_decision
from kpc.petroleum_operations.integrations.stock import (
	cancel_stock_voucher,
	post_material_issue,
	resolve_origin_tank,
)
from kpc.petroleum_operations.utils import assert_journey_ref_immutable, log_journey_step


class Reconciliation(Document):
	def validate(self):
		assert_journey_ref_immutable(self)
		self.calculate_combined_uncertainty()
		self.calculate_variance()

	def calculate_combined_uncertainty(self):
		"""Auto-calculate the acceptance tolerance from measurement
		uncertainty (GUM-style), instead of a flat policy constant. Combines
		the two real dip measurements that bracket this parcel's journey:
		the Tank Measurement that established its volume of record entering
		KPC custody (Step 2), and this Reconciliation's own Terminal Receipt
		measurement at the pipeline's destination (Step 8).

		Independent uncertainty sources combine as root-sum-square, not by
		simple addition - that's the standard GUM combined-standard-
		uncertainty rule, and it's why two 0.15%-uncertainty measurements
		don't imply a 0.3% combined figure. The result is then multiplied by
		a coverage factor (k, default 2, ~95% confidence for a normally
		distributed combined uncertainty) to get the actual accept/reject
		band - a wider band than either single measurement's own uncertainty,
		which is the point: two independently-uncertain readings disagreeing
		by less than that band isn't evidence of a real physical loss.

		Note: dispatched_quantity_kl (used in calculate_variance below) is
		the Pipeline Batch's *planned* volume, not a live in-line meter
		reading - see README Known Simplifications. This still combines the
		two best available real measurements in this model.
		"""
		origin = frappe.get_all(
			"Tank Measurement",
			filters={"journey_ref": self.journey_ref, "docstatus": 1},
			fields=["measurement_uncertainty_percent"],
			order_by="measurement_datetime desc, creation desc",
			limit=1,
		)
		self.origin_measurement_uncertainty_percent = flt(origin[0].measurement_uncertainty_percent) if origin else 0.0
		self.destination_measurement_uncertainty_percent = flt(
			frappe.db.get_value("Terminal Receipt", self.terminal_receipt, "measurement_uncertainty_percent")
		)

		self.combined_uncertainty_percent = flt(
			math.sqrt(
				self.origin_measurement_uncertainty_percent**2 + self.destination_measurement_uncertainty_percent**2
			),
			3,
		)
		coverage_factor = flt(self.coverage_factor) or 2.0
		self.tolerance_percent = flt(coverage_factor * self.combined_uncertainty_percent, 3)

	def calculate_variance(self):
		"""Auto-calculate loss/variance, as the brief requires. Positive
		variance_kl = less arrived than left (a loss); negative = more
		arrived than dispatched (a metrology quirk, not necessarily a gain
		to celebrate, but recorded honestly either way)."""
		dispatched = flt(self.dispatched_quantity_kl)
		received = flt(self.received_quantity_kl)

		self.variance_kl = flt(dispatched - received, 3)
		self.variance_percent = flt((self.variance_kl / dispatched) * 100, 3) if dispatched else 0.0
		self.within_tolerance = abs(self.variance_percent) <= flt(self.tolerance_percent)

	def before_submit(self):
		"""'Accepting' a Reconciliation = submitting it. Block outright if the
		variance is outside tolerance and nobody has explained why."""
		if not self.within_tolerance and not (self.justification or "").strip():
			frappe.throw(
				_(
					"Variance of {0}% exceeds the {1}% tolerance. A justification is required before this "
					"Reconciliation can be accepted."
				).format(self.variance_percent, self.tolerance_percent)
			)
		self.reconciled_by = frappe.session.user
		self.reconciled_on = now_datetime()

	def on_submit(self):
		log_journey_step(self.journey_ref, "9. Reconciliation", self)
		self.post_transit_loss()
		self.log_tolerance_override()

	def log_tolerance_override(self):
		"""Only an actual override - accepting a variance the auto-calculated
		combined-uncertainty tolerance (Phase 4) would otherwise have
		rejected - is worth a Decision Ledger entry; an ordinary
		within-tolerance acceptance isn't a decision anyone overrode."""
		if self.within_tolerance:
			return
		log_decision(
			decision_type="Reconciliation Tolerance Override",
			reference_doctype="Reconciliation",
			reference_name=self.name,
			decision_outcome=f"Accepted at {self.variance_percent}% (tolerance {self.tolerance_percent}%)",
			rationale=self.justification,
			is_ai_assisted=True,
			journey_ref=self.journey_ref,
		)

	def post_transit_loss(self):
		"""A positive variance is a real physical loss - now that it's
		fiscally recognised (accepted, with justification if it needed
		one), recognise it in the Stock Ledger too, drawn from the origin
		tank it left. Gains (negative variance) aren't posted here - a
		metrology quirk isn't stock a KPC tank actually gained."""
		if self.variance_kl <= 0:
			return

		origin_tank_name = resolve_origin_tank(self.journey_ref)
		origin_tank = frappe.get_doc("Oil Tank", origin_tank_name)
		movement = frappe.db.get_value("Terminal Receipt", self.terminal_receipt, "movement")
		product = frappe.db.get_value("Movement", movement, "product")

		entry = post_material_issue(origin_tank.warehouse, product, self.variance_kl, self.journey_ref)
		self.db_set("stock_entry", entry.name, update_modified=False)

	def on_cancel(self):
		"""Reverse the Material Issue this Reconciliation posted, if any (a
		positive variance doesn't always create one - see post_transit_loss) -
		same reasoning as Tank Measurement/Terminal Receipt/Dispatch/Invoice."""
		if self.stock_entry:
			cancel_stock_voucher("Stock Entry", self.stock_entry)
