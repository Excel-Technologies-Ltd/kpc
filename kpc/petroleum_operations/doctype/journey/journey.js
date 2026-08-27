// Copyright (c) 2026, ArcApps and contributors
// For license information, please see license.txt

frappe.ui.form.on("Journey", {
	refresh(frm) {
		frm.disable_form();
		frm.dashboard.set_headline(
			__("Golden Thread record - system maintained. Every step of {0} is logged below.", [
				frm.doc.name,
			])
		);

		// Only doctypes where journey_ref is a real, directly-settable field
		// (not fetched from another link) belong here - the rest of the
		// 13 steps get their journey_ref from the document *before* them in
		// the chain, not from Journey directly, so a shortcut here would
		// just be overwritten or left blank.
		const creatable = [
			["Tank Measurement", "journey_ref"],
			["Quality Result", "journey_ref"],
			["Inventory Position", "journey_ref"],
			["Nomination", "journey_ref"],
			["Maintenance Work Order", "journey_ref"],
			["Invoice", "journey_ref"],
		];
		creatable.forEach(([doctype, fieldname]) => {
			frm.add_custom_button(__(doctype), () => {
				frappe.new_doc(doctype, { [fieldname]: frm.doc.name });
			}, __("Create"));
		});
	},
});
