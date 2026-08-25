# Copyright (c) 2026, ArcApps and contributors
# For license information, please see license.txt

from frappe.model.document import Document

from kpc.petroleum_operations.utils import assert_journey_ref_immutable


class FinancialPosting(Document):
	"""System-generated only, like Journey - created exclusively from
	Invoice.on_submit (kpc.petroleum_operations.doctype.invoice.invoice) and
	flipped to Reversed by the Sales Invoice on_cancel hook
	(kpc.petroleum_operations.integrations.accounts). Not meant to be
	created or edited by hand."""

	def validate(self):
		assert_journey_ref_immutable(self)
