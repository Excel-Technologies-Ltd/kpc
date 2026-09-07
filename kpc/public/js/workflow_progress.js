// Copyright (c) 2026, ArcApps and contributors
// For license information, please see license.txt
//
// A "Golden Thread" progression strip shown on every step document's form
// (Oil Shipment, Tank Measurement, ..., Financial Posting) - which of the
// 13 canonical steps are done, which one this document is part of, and
// what the real next step is, with a direct link to it if that document
// already exists.
//
// Most step doctypes have no direct link field chaining them to the next
// step's own doctype - each one links back to Oil Shipment/Oil Tank/
// Journey instead (see kpc.petroleum_operations.utils.get_workflow_
// progress's own docstring), so Frappe's native per-doctype "Connections"
// tab can't be built for all 13 steps without a schema change. This reads
// the same real, already-logged Journey audit-trail data (journey_log)
// that mechanism itself is built from, just rendered directly on the
// step's own form instead of requiring a click-through to the Journey.

frappe.provide("kpc.workflow_progress");

kpc.workflow_progress.render = function (frm) {
	// refresh(frm) fires more than once per form lifecycle (load, after
	// save, reload) and this callback is async, so without removing our own
	// previous section first, a second refresh() before/after the first
	// frappe.call resolves stacks up a duplicate "Workflow Progress" panel -
	// frm.dashboard.add_section() has no built-in dedup the way
	// frm.add_custom_button()'s container gets from Frappe's own
	// clear_custom_buttons() before every doctype refresh.
	if (frm.dashboard.$kpc_workflow_progress_section) {
		frm.dashboard.$kpc_workflow_progress_section.remove();
		frm.dashboard.$kpc_workflow_progress_section = null;
	}

	if (!frm.doc.journey_ref || frm.is_new()) {
		return;
	}

	frappe.call({
		method: "kpc.petroleum_operations.utils.get_workflow_progress",
		args: { journey_ref: frm.doc.journey_ref },
		callback: function (r) {
			// A later refresh() may have already fired (and removed/rebuilt
			// this section again) by the time this call comes back - remove
			// whatever's there right now too, not just what was there when
			// this call started, so an out-of-order response can't stack a
			// second copy alongside the newer one.
			if (frm.dashboard.$kpc_workflow_progress_section) {
				frm.dashboard.$kpc_workflow_progress_section.remove();
				frm.dashboard.$kpc_workflow_progress_section = null;
			}
			if (!r.message || !r.message.steps || !r.message.steps.length) {
				return;
			}
			kpc.workflow_progress._show(frm, r.message);
		},
	});
};

const STATUS_STYLE = {
	done: { background: "#eafaf1", color: "#0f7a4d", border: "#b7ecd0" },
	current: { background: "#eaf1fd", color: "#1d4ed8", border: "#a9c6f7", weight: "600" },
	upcoming: { background: "#f3f4f6", color: "#6b7280", border: "#e5e7eb" },
};

kpc.workflow_progress._show = function (frm, data) {
	const chips = data.steps
		.map(function (s) {
			const style = STATUS_STYLE[s.status] || STATUS_STYLE.upcoming;
			const isNext = s.step === data.next_step;
			const record = (s.records || [])[0];
			let inner = frappe.utils.escape_html(s.step);
			if (s.status === "done" && record) {
				inner =
					'<a href="/app/' +
					encodeURIComponent(frappe.router.slug(record.reference_doctype)) +
					"/" +
					encodeURIComponent(record.reference_name) +
					'" style="color: inherit; text-decoration: none;" title="' +
					frappe.utils.escape_html(record.reference_doctype + " " + record.reference_name) +
					'">' +
					inner +
					"</a>";
			} else if (isNext && record) {
				inner =
					'<a href="/app/' +
					encodeURIComponent(frappe.router.slug(record.reference_doctype)) +
					"/" +
					encodeURIComponent(record.reference_name) +
					'" style="color: inherit; text-decoration: none;" title="' +
					frappe.utils.escape_html(record.reference_doctype + " " + record.reference_name) +
					'">' +
					inner +
					" →</a>";
			}
			return (
				'<span style="display: inline-block; padding: 3px 10px; margin: 2px; border-radius: 999px;' +
				"background:" +
				style.background +
				"; color:" +
				style.color +
				"; border: 1px solid " +
				style.border +
				"; font-size: 12px; font-weight:" +
				(style.weight || "400") +
				(isNext ? "; box-shadow: 0 0 0 2px " + style.border : "") +
				';">' +
				inner +
				"</span>"
			);
		})
		.join("");

	const summary = data.next_step
		? __("Next: {0}", [frappe.utils.escape_html(data.next_step)]) +
		  (data.next_step_records.length ? " " + __("(already logged)") : "")
		: __("Final step of the Golden Thread - nothing further to do.");

	const html =
		'<div style="padding: 6px 0 2px;">' +
		'<div style="font-size: 11px; color: #7a869a; margin-bottom: 4px;">' +
		__("Golden Thread progress") +
		"</div>" +
		'<div style="line-height: 2.1;">' +
		chips +
		"</div>" +
		'<div style="font-size: 12px; margin-top: 2px;">' +
		summary +
		"</div>" +
		"</div>";

	// add_section() returns the section's body element, not the row that
	// also holds its header - .closest(".row") is what render() above
	// actually needs to remove to take the whole panel (heading included)
	// out cleanly next time, not just its contents.
	const $body = frm.dashboard.add_section(html, __("Workflow Progress"));
	frm.dashboard.$kpc_workflow_progress_section = $body.closest(".row");
};
