# Copyright (c) 2026, ArcApps and contributors
# For license information, please see license.txt

from frappe.model.document import Document

from kpc.petroleum_operations.utils import assert_document_immutable


class DecisionLedger(Document):
	"""Immutable Audit (Phase 6): every AI-assisted decision and manual
	override in this app writes one append-only entry here - never edited,
	never deleted, by anyone, including System Manager (see the permissions
	in decision_ledger.json: no role has write or delete). Entries are
	created exclusively by kpc.petroleum_operations.decision_ledger.log_decision,
	called from the exact point each source doctype detects its own decision
	transition - never created or edited by hand."""

	def validate(self):
		assert_document_immutable(self)
