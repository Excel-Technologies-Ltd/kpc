# Copyright (c) 2026, ArcApps and contributors
# For license information, please see license.txt
from frappe import _


def get_data():
	"""Connections tab for Journey: every doctype in the Golden Thread that
	carries this Journey's journey_ref, grouped by phase - the same 5-phase
	structure the app was built in."""
	return {
		"fieldname": "journey_ref",
		"transactions": [
			{
				"label": _("Inbound Logistics & Storage"),
				"items": ["Oil Shipment", "Tank Measurement", "Quality Result", "Inventory Position"],
			},
			{"label": _("Commercial Planning"), "items": ["Nomination", "Pipeline Batch"]},
			{
				"label": _("Pipeline Operations & AI"),
				"items": ["Movement", "AI Alert", "AI Prediction", "AI Recommendation", "Maintenance Work Order"],
			},
			{
				"label": _("Reconciliation & Outbound"),
				"items": ["Terminal Receipt", "Reconciliation", "Variance", "Allocation", "Dispatch"],
			},
			{"label": _("Billing & Financials"), "items": ["Invoice", "Financial Posting"]},
		],
	}
