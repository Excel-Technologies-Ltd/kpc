# Copyright (c) 2026, ArcApps and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils import now_datetime

from kpc.petroleum_operations.decision_ledger import log_decision
from kpc.petroleum_operations.sod import assert_not_self_approving
from kpc.petroleum_operations.utils import assert_journey_ref_immutable, log_journey_step


class QualityResult(Document):
	def validate(self):
		assert_journey_ref_immutable(self)
		self.evaluate_parameters()
		self.stamp_approval()

	def evaluate_parameters(self):
		if not self.parameters:
			frappe.throw(_("At least one quality parameter result is required."))

		all_within_spec = True
		for row in self.parameters:
			row.is_within_spec = self.is_row_within_spec(row)
			if not row.is_within_spec:
				all_within_spec = False

		self.overall_result = "Pass" if all_within_spec else "Fail"

	@staticmethod
	def is_row_within_spec(row) -> bool:
		if row.specification_min not in (None, 0) and row.result_value < row.specification_min:
			return False
		if row.specification_max not in (None, 0) and row.result_value > row.specification_max:
			return False
		return True

	def stamp_approval(self):
		"""Approval is a workflow transition (Pending -> Accepted/Quarantined),
		restricted to the Quality Manager role by the Workflow definition -
		but role membership alone doesn't stop one specific person from both
		recording the raw lab result (as owner) and then approving their own
		reading, so assert_not_self_approving closes that gap. This also
		records who/when for audit, and writes to the immutable Decision
		Ledger (Phase 6)."""
		if self.has_value_changed("workflow_state") and self.workflow_state in ("Accepted", "Quarantined"):
			assert_not_self_approving(self, action=self.workflow_state.lower())
			self.approved_by = frappe.session.user
			self.approved_on = now_datetime()
			log_decision(
				decision_type="Quality Result Decision",
				reference_doctype="Quality Result",
				reference_name=self.name,
				decision_outcome=self.workflow_state,
				rationale=self.remarks,
				is_ai_assisted=False,
				journey_ref=self.journey_ref,
			)

	def on_update(self):
		if self.journey_ref and self.has_value_changed("workflow_state"):
			log_journey_step(self.journey_ref, "3. Quality Result", self)

		# Quarantine feeds back to the physical asset: a Fail/Quarantined
		# result must stop further receipts into the sampled tank.
		if self.workflow_state == "Quarantined" and self.tank:
			frappe.db.set_value("Oil Tank", self.tank, "current_state", "Quarantine")
