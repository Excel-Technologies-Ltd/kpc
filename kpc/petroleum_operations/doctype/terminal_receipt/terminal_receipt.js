// Copyright (c) 2026, ArcApps and contributors
// For license information, please see license.txt

frappe.ui.form.on("Terminal Receipt", {
	setup(frm) {
		frm.set_query("movement", () => ({ filters: { movement_status: ["in", ["In Transit", "Completed"]] } }));
	},

	refresh(frm) {
		kpc.workflow_progress.render(frm);

		// Same "Dip Reading" section, same four fieldnames, as Tank
		// Measurement - only the tank Link field's own name differs here
		// ("destination_tank", not "tank").
		kpc.dip_gauge.add_toolbar_button(frm, "destination_tank");

		if (frm.doc.docstatus === 1) {
			frm.add_custom_button(__("Reconciliation"), () => {
				frappe.new_doc("Reconciliation", { terminal_receipt: frm.doc.name });
			}, __("Create"));
		}
	},

	movement(frm) {
		if (!frm.doc.movement) return;
		frappe.db.get_value("Movement", frm.doc.movement, "destination_terminal").then((r) => {
			if (!r.message || !r.message.destination_terminal) return;
			frm.set_query("destination_tank", () => ({
				filters: { terminal: r.message.destination_terminal, current_state: "Active" },
			}));
		});
	},
});
