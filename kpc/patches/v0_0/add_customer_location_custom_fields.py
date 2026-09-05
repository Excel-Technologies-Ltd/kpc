# Copyright (c) 2026, ArcApps and contributors
# For license information, please see license.txt
"""Latitude/longitude on Customer, alongside Terminal and Oil Tank (their
own real fields, not custom fields, since both are this app's own
doctypes) - map-view plotting for a future custom dashboard, not used by
anything in this app itself. Customer is standard ArcApps, so this goes
through create_custom_fields rather than editing its own doctype JSON,
the same pattern already used for Sales Invoice/GL Entry (journey_ref) and
Item (petroleum properties) - editing ArcApps's own doctype file directly
would get silently overwritten on the next upgrade.
"""

import frappe
from frappe.custom.doctype.custom_field.custom_field import create_custom_fields

CUSTOM_FIELDS = {
	"Customer": [
		{
			"fieldname": "location_section_kpc",
			"fieldtype": "Section Break",
			"label": "Location",
			"insert_after": "territory",
			"collapsible": 1,
		},
		{
			"fieldname": "latitude",
			"fieldtype": "Float",
			"label": "Latitude",
			"precision": "6",
			"insert_after": "location_section_kpc",
			"description": "Decimal degrees, e.g. -1.286400 (south of the equator is negative). Used for map-view plotting only - not validated against any address.",
		},
		{
			"fieldname": "column_break_location_kpc",
			"fieldtype": "Column Break",
			"insert_after": "latitude",
		},
		{
			"fieldname": "longitude",
			"fieldtype": "Float",
			"label": "Longitude",
			"precision": "6",
			"insert_after": "column_break_location_kpc",
			"description": "Decimal degrees, e.g. 36.817200 (west of the prime meridian is negative).",
		},
	]
}


def execute():
	create_custom_fields(CUSTOM_FIELDS, ignore_validate=frappe.flags.in_patch)
