# Copyright (c) 2026, ArcApps and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document

from kpc.petroleum_operations.utils import (
	assert_certification_current,
	assert_journey_ref_immutable,
	log_journey_step,
)


class MaintenanceWorkOrder(Document):
	def validate(self):
		assert_journey_ref_immutable(self)
		self.validate_recommendation_approved()
		self.validate_certification()

	def validate_certification(self):
		"""HSEQ gate from the brief: block Work Order assignment if the
		assigned employee's certification is expired. Only checked when
		Required Certification Type is actually set - not every Work Order
		(e.g. a routine visual Inspection) needs a specific certification."""
		if not self.required_certification_type:
			return
		assert_certification_current(
			self.assigned_employee, self.required_certification_type, _("be assigned this Work Order")
		)

	def validate_recommendation_approved(self):
		if not self.ai_recommendation:
			return
		state = frappe.db.get_value("AI Recommendation", self.ai_recommendation, "workflow_state")
		if state != "Approved":
			frappe.throw(
				_("AI Recommendation {0} must be Approved before a Work Order can be raised from it.").format(
					self.ai_recommendation
				)
			)

	def on_submit(self):
		log_journey_step(self.journey_ref, "7. Movement", self)
