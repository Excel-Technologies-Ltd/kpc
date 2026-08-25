# Copyright (c) 2026, ArcApps and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils import now_datetime

from kpc.petroleum_operations.utils import (
	assert_certification_current,
	assert_journey_ref_immutable,
	log_journey_step,
)


class PermittoWork(Document):
	def validate(self):
		assert_journey_ref_immutable(self)
		self.validate_validity_window()
		self.validate_certification()

	def validate_validity_window(self):
		if self.valid_from and self.valid_until and self.valid_until <= self.valid_from:
			frappe.throw(_("Valid Until must be after Valid From."))

	def validate_certification(self):
		"""OT/HSEQ boundary: a permit for hazardous work cannot be issued to
		someone whose certification for that exact hazard category is
		missing or expired - this is the 'block Permit to Work assignment
		if employee certification expired' rule from the brief."""
		assert_certification_current(self.issued_to, self.permit_type, _("be issued this Permit to Work"))

	def before_submit(self):
		self.status = "Issued"

	def on_submit(self):
		log_journey_step(self.journey_ref, "7. Movement", self)

	def on_cancel(self):
		self.status = "Revoked"

	@frappe.whitelist()
	def close_permit(self):
		"""The work covered by this permit is done - close it out. A
		separate action from cancel/revoke, which means the permit was
		withdrawn, not that the work finished normally."""
		if self.docstatus != 1:
			frappe.throw(_("Only an Issued permit can be closed."))
		self.status = "Closed"
		self.closed_by = frappe.session.user
		self.closed_on = now_datetime()
		self.save()
