// Copyright (c) 2026, ArcApps and contributors
// For license information, please see license.txt

frappe.ui.form.on("OT Telemetry Log", {
	setup(frm) {
		frm.set_query("movement", () => ({ filters: { movement_status: ["!=", "Completed"] } }));
	},

	refresh(frm) {
		const colors = { Nominal: "green", Low: "yellow", Medium: "orange", High: "red", Critical: "red" };
		frm.page.clear_indicator();
		if (frm.doc.anomaly_severity) {
			frm.page.set_indicator(frm.doc.anomaly_severity, colors[frm.doc.anomaly_severity] || "blue");
		}

		// Read-only ingest record: nothing is ever editable after creation.
		if (!frm.is_new()) {
			frm.disable_save();
		}

		if (frm.doc.movement) {
			frm.add_custom_button(__("View Movement"), () => {
				frappe.set_route("Form", "Movement", frm.doc.movement);
			});
		}
	},
});
