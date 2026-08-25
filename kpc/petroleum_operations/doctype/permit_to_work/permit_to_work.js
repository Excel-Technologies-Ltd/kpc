// Copyright (c) 2026, ArcApps and contributors
// For license information, please see license.txt

frappe.ui.form.on("Permit to Work", {
	refresh(frm) {
		const colors = { Draft: "grey", Issued: "blue", Closed: "green", Revoked: "red" };
		frm.page.clear_indicator();
		if (frm.doc.status) {
			frm.page.set_indicator(frm.doc.status, colors[frm.doc.status] || "blue");
		}

		if (frm.doc.docstatus === 1 && frm.doc.status === "Issued") {
			frm.add_custom_button(__("Close Permit"), () => {
				frm.call("close_permit").then(() => frm.reload_doc());
			});
		}

		if (frm.doc.work_order) {
			frm.add_custom_button(__("View Work Order"), () => {
				frappe.set_route("Form", "Maintenance Work Order", frm.doc.work_order);
			});
		}
	},
});
