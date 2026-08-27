# Copyright (c) 2026, ArcApps and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils import now_datetime

from kpc.petroleum_operations.decision_ledger import log_decision
from kpc.petroleum_operations.sod import assert_not_self_approving
from kpc.petroleum_operations.utils import log_journey_step


class Variance(Document):
	def validate(self):
		self.validate_reconciliation_accepted()
		if self.has_value_changed("workflow_state") and self.workflow_state in ("Approved", "Rejected"):
			# SoD: whoever classified the loss (this doc's owner) cannot also
			# be the one approving/rejecting their own classification.
			assert_not_self_approving(self, action=self.workflow_state.lower())
			self.approved_by = frappe.session.user
			self.approved_on = now_datetime()
			log_decision(
				decision_type="Variance Classification Decision",
				reference_doctype="Variance",
				reference_name=self.name,
				decision_outcome=self.workflow_state,
				rationale=self.classification_notes,
				is_ai_assisted=False,
				journey_ref=self.journey_ref,
			)

	def validate_reconciliation_accepted(self):
		if frappe.db.get_value("Reconciliation", self.reconciliation, "docstatus") != 1:
			frappe.throw(
				_("Reconciliation {0} must be accepted before its variance can be classified.").format(
					self.reconciliation
				)
			)

	def on_update(self):
		# flags.in_insert guard, not is_new() - see Oil Shipment for why.
		if not self.flags.in_insert and self.has_value_changed("workflow_state"):
			log_journey_step(self.journey_ref, "9. Reconciliation", self)
