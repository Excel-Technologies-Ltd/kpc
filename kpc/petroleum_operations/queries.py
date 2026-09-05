# Copyright (c) 2026, ArcApps and contributors
# For license information, please see license.txt
"""Link-field search queries (``hooks.py``'s ``standard_queries``) - the one
place a DocType's own default awesomplete/Link-field dropdown behaviour can
be overridden globally, for every Link field pointing at it across every
doctype in the system, with no per-field ``frm.set_query`` client script
needed anywhere.
"""

from __future__ import annotations

import frappe


@frappe.whitelist()
@frappe.validate_and_sanitize_search_inputs
def active_terminal_query(doctype, txt, searchfield, start, page_len, filters):
	"""Terminal's own default search query - excludes inactive terminals from
	every Terminal Link-field dropdown app-wide (Nomination, Movement, Oil
	Shipment, Oil Tank, Pipeline Batch, Capacity Assessment, Tariff, Plant
	Asset, ...) without a client script per field. A decommissioned/inactive
	terminal is still a real, readable record (existing documents that
	already reference it keep displaying it fine) - it just should never be
	*offered* as a choice for a new one."""
	doctype = "Terminal"
	list_filters = {"is_active": 1}
	if filters:
		list_filters.update(filters)

	return frappe.get_list(
		doctype,
		filters=list_filters,
		# name (terminal_code, e.g. "TERM-001") + terminal_name - the same
		# id + human-label pair core's own user_query returns, so the
		# dropdown shows something readable, not just the bare code.
		fields=["name", "terminal_name"],
		limit_start=start,
		limit_page_length=page_len,
		order_by="name asc",
		or_filters=[[searchfield, "like", f"%{txt}%"]],
		as_list=True,
	)
