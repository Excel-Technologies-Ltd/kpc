# Copyright (c) 2026, ArcApps and contributors
# For license information, please see license.txt
"""Phase 6: the single choke point every AI-assisted decision and manual
override in this app writes through. Kept separate from
kpc.petroleum_operations.utils (which is a general grab-bag) because this
is specifically the Decision Ledger's own write path, mirroring how
integrations/ is a dedicated home for the Accounts/Stock integration code.
"""

import frappe


def log_decision(
	decision_type: str,
	reference_doctype: str,
	reference_name: str,
	decision_outcome: str,
	rationale: str = "",
	is_ai_assisted: bool = False,
	journey_ref: str | None = None,
) -> str:
	"""Append one entry to the immutable Decision Ledger. Call this at the
	exact moment a human decision is made - not retroactively - so
	``decided_by``/``decided_on`` always reflect who was actually logged in
	when the decision happened, not whoever a later script runs as.
	"""
	entry = frappe.get_doc(
		{
			"doctype": "Decision Ledger",
			"decision_type": decision_type,
			"reference_doctype": reference_doctype,
			"reference_name": reference_name,
			"journey_ref": journey_ref,
			"decision_outcome": decision_outcome,
			"decided_by": frappe.session.user,
			"decided_on": frappe.utils.now_datetime(),
			"rationale": rationale or "",
			"is_ai_assisted": 1 if is_ai_assisted else 0,
		}
	)
	entry.insert(ignore_permissions=True)
	return entry.name
