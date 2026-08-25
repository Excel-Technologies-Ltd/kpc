// Copyright (c) 2026, ArcApps and contributors
// For license information, please see license.txt

frappe.ui.form.on("Product Compatibility", {
	refresh(frm) {
		const colors = { Compatible: "green", "Requires Interface Cut": "orange", Incompatible: "red" };
		frm.page.clear_indicator();
		if (frm.doc.compatibility) {
			frm.page.set_indicator(frm.doc.compatibility, colors[frm.doc.compatibility] || "blue");
		}
	},
});
