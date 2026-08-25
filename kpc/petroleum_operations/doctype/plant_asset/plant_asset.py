# Copyright (c) 2026, ArcApps and contributors
# For license information, please see license.txt

from frappe.model.document import Document


class PlantAsset(Document):
	"""Standing equipment register for EAM (Enterprise Asset Management)
	purposes - pipeline segments, pump stations, valves, meters. Distinct
	from ERPNext's own core ``Asset`` doctype, which is a financial fixed-
	asset/depreciation record; this is a maintenance/reliability register
	for the same physical equipment and is never posted to the GL. Master
	data like Oil Tank/Terminal, so it carries no journey_ref."""
