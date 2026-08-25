# Copyright (c) 2026, ArcApps and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import now_datetime

from kpc.petroleum_operations.decision_ledger import log_decision
from kpc.petroleum_operations.sod import assert_not_self_approving
from kpc.petroleum_operations.utils import log_journey_step


class AIRecommendation(Document):
	def validate(self):
		if self.has_value_changed("workflow_state") and self.workflow_state in ("Approved", "Rejected"):
			# SoD: whoever's telemetry/Movement triggered the AI Alert ->
			# Prediction -> Recommendation cascade (this doc's owner) cannot
			# also be the one approving/rejecting it - a human other than
			# the one who raised the alert must make the call. AI
			# Recommendation cannot execute (a Work Order cannot be raised
			# from it - see MaintenanceWorkOrder.validate_recommendation_approved)
			# without exactly this approval.
			assert_not_self_approving(self, action=self.workflow_state.lower())
			self.approved_by = frappe.session.user
			self.approved_on = now_datetime()

	def on_update(self):
		if self.has_value_changed("workflow_state"):
			log_journey_step(self.journey_ref, "7. Movement", self)
			if self.workflow_state in ("Approved", "Rejected"):
				decision_type = (
					"AI Recommendation Approval" if self.workflow_state == "Approved" else "AI Recommendation Rejection"
				)
				log_decision(
					decision_type=decision_type,
					reference_doctype="AI Recommendation",
					reference_name=self.name,
					decision_outcome=self.workflow_state,
					rationale=self.details,
					is_ai_assisted=True,
					journey_ref=self.journey_ref,
				)
