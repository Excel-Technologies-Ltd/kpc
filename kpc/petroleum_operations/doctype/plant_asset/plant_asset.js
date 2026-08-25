// Copyright (c) 2026, ArcApps and contributors
// For license information, please see license.txt

frappe.ui.form.on("Plant Asset", {
	refresh(frm) {
		const colors = { Operational: "green", "Under Maintenance": "orange", Decommissioned: "grey" };
		frm.page.clear_indicator();
		if (frm.doc.status) {
			frm.page.set_indicator(frm.doc.status, colors[frm.doc.status] || "blue");
		}
	},
});
