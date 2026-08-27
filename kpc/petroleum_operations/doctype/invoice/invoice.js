// Copyright (c) 2026, ArcApps and contributors
// For license information, please see license.txt

frappe.ui.form.on("Invoice", {
	setup(frm) {
		// set_query(<field inside the child row>, <parent's fieldname for
		// that child table>, query) - "dispatch" first, "lines" second, not
		// the other way round. Getting this backwards makes Frappe look for
		// a top-level field called "dispatch" (there isn't one - it only
		// exists inside the "lines" child table), find nothing, and throw
		// on the very first form load, aborting the rest of the form's
		// setup/refresh pipeline - which is why the whole form used to
		// render blank instead of just the dispatch filter silently not
		// applying.
		frm.set_query("dispatch", "lines", () => ({ filters: { docstatus: 1 } }));
	},

	refresh(frm) {
		if (frm.doc.sales_invoice) {
			frm.add_custom_button(__("View Sales Invoice"), () => {
				frappe.set_route("Form", "Sales Invoice", frm.doc.sales_invoice);
			});
		}
		if (frm.doc.journey_ref) {
			frm.add_custom_button(__("View Golden Thread"), () => {
				frappe.set_route("Form", "Journey", frm.doc.journey_ref);
			});
		}
	},
});

frappe.ui.form.on("Invoice Line", {
	dispatch(frm, cdt, cdn) {
		const row = locals[cdt][cdn];
		if (!row.dispatch) return;
		frappe.db.get_value("Dispatch", row.dispatch, "dispatched_quantity_kl").then((r) => {
			if (r.message) {
				frappe.model.set_value(cdt, cdn, "quantity_kl", r.message.dispatched_quantity_kl);
			}
		});
	},

	tariff(frm, cdt, cdn) {
		const row = locals[cdt][cdn];
		if (!row.tariff) return;
		frappe.db.get_value("Tariff", row.tariff, ["product", "rate_per_kl"]).then((r) => {
			if (r.message) {
				frappe.model.set_value(cdt, cdn, "product", r.message.product);
				frappe.model.set_value(cdt, cdn, "rate_per_kl", r.message.rate_per_kl);
			}
		});
	},
});
