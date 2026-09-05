// Copyright (c) 2026, ArcApps and contributors
// For license information, please see license.txt

frappe.ui.form.on("Dispatch", {
	setup(frm) {
		frm.set_query("allocation", () => ({ filters: { docstatus: 1 } }));
		frm.set_query("destination_tank", () => ({ filters: { current_state: "Active" } }));
	},

	refresh(frm) {
		kpc.workflow_progress.render(frm);

		if (frm.doc.docstatus === 1) {
			frm.add_custom_button(__("Invoice"), () => {
				// Invoice references Dispatch from inside its "lines" child
				// table (Invoice Line.dispatch), not a direct field on
				// Invoice itself - so this needs a pre-populated child row,
				// not just a top-level field default.
				frappe.model.with_doctype("Invoice", () => {
					const doc = frappe.model.get_new_doc("Invoice");
					doc.journey_ref = frm.doc.journey_ref;
					doc.customer = frm.doc.customer;
					const row = frappe.model.add_child(doc, "Invoice Line", "lines");
					row.dispatch = frm.doc.name;
					frappe.set_route("Form", "Invoice", doc.name);
				});
			}, __("Create"));
		}
	},
});
