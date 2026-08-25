// Copyright (c) 2026, ArcApps and contributors
// For license information, please see license.txt

frappe.ui.form.on("Employee Certification", {
	refresh(frm) {
		const colors = { Valid: "green", Expired: "red" };
		frm.page.clear_indicator();
		if (frm.doc.status) {
			frm.page.set_indicator(frm.doc.status, colors[frm.doc.status] || "blue");
		}
	},
});
