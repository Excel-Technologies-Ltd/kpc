// Copyright (c) 2026, ArcApps and contributors
// For license information, please see license.txt

frappe.ui.form.on("Movement", {
	setup(frm) {
		frm.set_query("pipeline_batch", () => ({ filters: { docstatus: 1 } }));
	},

	refresh(frm) {
		const status_colors = { Draft: "grey", "In Transit": "blue", Completed: "green", Halted: "red" };
		frm.page.clear_indicator();
		if (frm.doc.movement_status) {
			frm.page.set_indicator(frm.doc.movement_status, status_colors[frm.doc.movement_status] || "blue");
		}

		if (frm.doc.anomaly_severity && frm.doc.anomaly_severity !== "Nominal") {
			const colors = { Low: "yellow", Medium: "orange", High: "red", Critical: "red" };
			frm.dashboard.set_headline_alert(
				__("Anomaly detected: {0} (score {1}/100).{2}", [
					frm.doc.anomaly_severity,
					frm.doc.anomaly_score,
					frm.doc.alert_triggered ? __(" AI Alert raised.") : "",
				]),
				colors[frm.doc.anomaly_severity] || "orange"
			);
		}

		if (frm.doc.journey_ref) {
			frm.add_custom_button(__("View Golden Thread"), () => {
				frappe.set_route("Form", "Journey", frm.doc.journey_ref);
			});
		}

		// AI Alert/Prediction/Recommendation are deliberately not offered
		// here - the anomaly cascade creates those automatically (see
		// utils.raise_ai_alert); a manual "Create" shortcut would just
		// invite duplicates alongside the real ones.
		frm.add_custom_button(__("Terminal Receipt"), () => {
			frappe.new_doc("Terminal Receipt", { movement: frm.doc.name });
		}, __("Create"));
	},
});
