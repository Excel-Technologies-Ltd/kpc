# Copyright (c) 2026, ArcApps and contributors
# For license information, please see license.txt

from frappe.model.document import Document
from frappe.utils import getdate, today


class EmployeeCertification(Document):
	def validate(self):
		self.update_status()

	def update_status(self):
		"""Auto-calculated, not user-set - a certification's validity is a
		fact derived from its expiry date, not an opinion. Re-evaluated on
		every save so a certification that lapses while nothing else about
		the record changes still reads correctly the next time anyone (or
		assert_certification_current) looks at it."""
		self.status = "Expired" if self.expiry_date and getdate(self.expiry_date) < getdate(today()) else "Valid"
