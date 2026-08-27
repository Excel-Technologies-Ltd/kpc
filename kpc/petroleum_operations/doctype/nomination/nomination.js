// Copyright (c) 2026, ArcApps and contributors
// For license information, please see license.txt

frappe.ui.form.on("Nomination", {
	onload(frm) {
		if (frm.is_new() && !frm.doc.company) {
			frm.set_value("company", frappe.defaults.get_default("company"));
		}
	},

	setup(frm) {
		// Only journeys that have reached at least Inventory Position carry
		// stock that could plausibly be nominated.
		frm.set_query("journey_ref", () => ({ filters: { status: "Active" } }));
	},

	refresh(frm) {
		if (frm.doc.journey_ref) {
			frm.add_custom_button(__("View Golden Thread"), () => {
				frappe.set_route("Form", "Journey", frm.doc.journey_ref);
			});
		}

		if (frm.doc.docstatus === 1) {
			frm.add_custom_button(__("Pipeline Batch"), () => {
				frappe.new_doc("Pipeline Batch", { nomination: frm.doc.name });
			}, __("Create"));
			frm.add_custom_button(__("Allocation"), () => {
				frappe.new_doc("Allocation", { nomination: frm.doc.name });
			}, __("Create"));
		}
	},
});
