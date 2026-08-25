// Copyright (c) 2026, ArcApps and contributors
// For license information, please see license.txt

frappe.ui.form.on("Decision Ledger", {
	refresh(frm) {
		frm.page.clear_indicator();
		if (frm.doc.is_ai_assisted) {
			frm.page.set_indicator(__("AI-Assisted"), "blue");
		}
		// Immutable ledger: nothing is ever editable after creation.
		if (!frm.is_new()) {
			frm.disable_save();
		}
		if (frm.doc.reference_doctype && frm.doc.reference_name) {
			frm.add_custom_button(__("View Reference"), () => {
				frappe.set_route("Form", frm.doc.reference_doctype, frm.doc.reference_name);
			});
		}
	},
});
