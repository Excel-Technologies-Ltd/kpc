// Copyright (c) 2026, ArcApps and contributors
// For license information, please see license.txt

frappe.ui.form.on("Reconciliation", {
	refresh(frm) {
		if (frm.doc.docstatus === 1) {
			frm.add_custom_button(__("Variance"), () => {
				frappe.new_doc("Variance", { reconciliation: frm.doc.name });
			}, __("Create"));
			frm.add_custom_button(__("Allocation"), () => {
				frappe.new_doc("Allocation", { reconciliation: frm.doc.name });
			}, __("Create"));
		}

		if (frm.doc.variance_percent && !frm.doc.within_tolerance) {
			frm.dashboard.set_headline_alert(
				__("Variance of {0}% exceeds the {1}% tolerance - a justification is required to accept this Reconciliation.", [
					frm.doc.variance_percent,
					frm.doc.tolerance_percent,
				]),
				"red"
			);
		}
	},
});
