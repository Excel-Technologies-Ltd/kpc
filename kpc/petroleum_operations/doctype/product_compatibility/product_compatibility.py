# Copyright (c) 2026, ArcApps and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document


class ProductCompatibility(Document):
	def validate(self):
		self.validate_distinct_products()
		self.validate_no_duplicate_pair()

	def validate_distinct_products(self):
		if self.product_a == self.product_b:
			frappe.throw(_("Product A and Product B must be different products."))

	def validate_no_duplicate_pair(self):
		"""A/B and B/A are the same relationship - block whichever ordering
		is entered second, rather than silently allowing two rows that
		could someday disagree with each other."""
		existing = frappe.db.exists(
			"Product Compatibility",
			{
				"name": ["!=", self.name or ""],
				"product_a": ["in", (self.product_a, self.product_b)],
				"product_b": ["in", (self.product_a, self.product_b)],
			},
		)
		if existing:
			frappe.throw(
				_("A compatibility rule for {0} / {1} already exists: {2}.").format(
					self.product_a, self.product_b, existing
				)
			)
