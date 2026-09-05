// Copyright (c) 2026, ArcApps and contributors
// For license information, please see license.txt
//
// An interactive dip-gauge dialog for Tank Measurement - a 3D-styled tank
// visual with a real liquid level that rises and falls, next to a
// draggable 2D ruler/handle the operator drags to set the dip reading,
// scaled against the actual selected tank's real reference height/
// capacity (never a hardcoded scale). "Apply" writes the chosen level
// (plus temperature/water dip/density, entered alongside it in the same
// dialog) straight into the real form fields via frm.set_value - this is
// a data-entry convenience, not a new data source; nothing here is saved
// on its own.

frappe.provide("kpc.dip_gauge");

// A real tank/cylinder glyph (top ellipse + curved sides + a mid band
// hinting at a liquid level) - frappe.utils.icon()/page.add_action_icon()
// can only reference an icon already baked into Frappe's own fixed SVG
// sprite sheet by name, which has no tank/gauge glyph to point at, so this
// is a small inline SVG instead, wired up the same way add_action_icon's
// own button markup/behaviour works (same classes, same Bootstrap
// tooltip), just with custom artwork in place of a sprite reference.
const TANK_ICON_SVG =
	'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" ' +
	'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
	'<ellipse cx="12" cy="5" rx="9" ry="3"/>' +
	'<path d="M3 5v14a9 3 0 0 0 18 0V5"/>' +
	'<path d="M3 12a9 3 0 0 0 18 0" opacity="0.55"/>' +
	"</svg>";

kpc.dip_gauge.add_toolbar_icon = function (frm) {
	// refresh() can fire more than once per form lifecycle (after a save,
	// a reload) - guard against stacking up a second/third icon each time,
	// same reason Frappe's own toolbar clears its icons before rebuilding.
	frm.page.icon_group.find(".kpc-dip-gauge-icon-btn").remove();
	const button = $(`<button class="text-muted btn btn-default icon-btn kpc-dip-gauge-icon-btn">${TANK_ICON_SVG}</button>`);
	button.appendTo(frm.page.icon_group.removeClass("hide"));
	button.click(() => kpc.dip_gauge.open(frm));
	button.attr("title", __("Interactive Dip Gauge")).tooltip({ delay: { show: 600, hide: 100 }, trigger: "hover" });
	return button;
};

kpc.dip_gauge.open = function (frm) {
	if (!frm.doc.tank) {
		frappe.msgprint({
			title: __("Select a Tank First"),
			indicator: "orange",
			message: __("Pick a Tank above, then open the dip gauge - it scales itself to that tank's real capacity."),
		});
		return;
	}

	frappe.db.get_value("Oil Tank", frm.doc.tank, ["tank_name", "capacity_kl", "reference_height_mm", "product"]).then((r) => {
		const tank = r.message || {};
		const maxHeightMm = flt(tank.reference_height_mm) || 20000;
		const capacityKl = flt(tank.capacity_kl) || 0;

		// The standard reference temperature is per-product (Item.reference_
		// temperature_c - the same field VCF calculations already use), not
		// a single constant across every product - fall back to 15C (the
		// universal petroleum-industry standard reference temperature, and
		// this field's own default when a product doesn't override it) only
		// when the product itself has nothing set.
		const productPromise = tank.product
			? frappe.db.get_value("Item", tank.product, "reference_temperature_c")
			: Promise.resolve({ message: {} });

		productPromise.then((pr) => {
			const standardTemperatureC = flt((pr.message || {}).reference_temperature_c) || 15;
			kpc.dip_gauge._show(frm, {
				tankName: tank.tank_name || frm.doc.tank,
				maxHeightMm: maxHeightMm,
				capacityKl: capacityKl,
				startMm: flt(frm.doc.observed_level_mm) || 0,
				standardTemperatureC: standardTemperatureC,
			});
		});
	});
};

kpc.dip_gauge._show = function (frm, ctx) {
	const dialog = new frappe.ui.Dialog({
		title: __("Interactive Dip Gauge - {0}", [ctx.tankName]),
		size: "small",
		fields: [
			{ fieldtype: "HTML", fieldname: "gauge_html" },
			{ fieldtype: "Section Break", label: __("Other Readings") },
			{
				fieldtype: "Float",
				fieldname: "observed_temperature_c",
				label: __("Observed Temperature (°C)"),
				// Standard reference temperature (per-product where set,
				// else 15C) if the operator hasn't already recorded a real
				// one on the form - a genuine starting point to overwrite
				// when it's actually different, not a placeholder.
				default: frm.doc.observed_temperature_c || ctx.standardTemperatureC,
				description: __("Defaults to the standard reference temperature ({0}°C) - change it if the real observed reading differs.", [ctx.standardTemperatureC]),
			},
			{ fieldtype: "Column Break" },
			{
				fieldtype: "Float",
				fieldname: "water_dip_mm",
				label: __("Free Water Dip (mm)"),
				// Standard assumption is no free water unless one was
				// actually observed and already recorded on the form.
				default: frm.doc.water_dip_mm || 0,
				description: __("Defaults to 0 (no free water) - change it if water was actually observed."),
			},
			{
				fieldtype: "Float",
				fieldname: "density_at_15c",
				label: __("Density at 15°C (kg/L)"),
				default: frm.doc.density_at_15c,
				precision: 4,
			},
		],
		primary_action_label: __("Apply to Form"),
		primary_action: (values) => {
			frm.set_value("observed_level_mm", Math.round(dialog.$wrapper[0]._kpc_level_mm || 0));
			if (values.observed_temperature_c !== undefined && values.observed_temperature_c !== null && values.observed_temperature_c !== "") {
				frm.set_value("observed_temperature_c", values.observed_temperature_c);
			}
			if (values.water_dip_mm !== undefined && values.water_dip_mm !== null && values.water_dip_mm !== "") {
				frm.set_value("water_dip_mm", values.water_dip_mm);
			}
			if (values.density_at_15c !== undefined && values.density_at_15c !== null && values.density_at_15c !== "") {
				frm.set_value("density_at_15c", values.density_at_15c);
			}
			dialog.hide();
			frappe.show_alert({ message: __("Dip reading applied."), indicator: "green" });
		},
	});

	dialog.fields_dict.gauge_html.$wrapper.html(kpc.dip_gauge._html());
	dialog.show();

	// Deferred to the next tick - the dialog's own DOM needs to exist
	// before wiring pointer events to elements inside it.
	setTimeout(() => kpc.dip_gauge._wire(dialog, ctx), 0);
};

kpc.dip_gauge._html = function () {
	return `
	<style>
		.kpc-dg { display: flex; gap: 22px; align-items: flex-start; padding: 6px 2px 14px; user-select: none; }
		.kpc-dg-readout { font-size: 13px; margin-bottom: 10px; line-height: 1.6; }
		.kpc-dg-readout b { font-size: 20px; color: var(--ai-primary, #2563eb); }
		.kpc-dg-visual { display: flex; gap: 26px; }
		.kpc-dg-tank-wrap { display: flex; flex-direction: column; align-items: center; }
		.kpc-dg-tank-cap-top {
			width: 130px; height: 26px; border-radius: 50%;
			background: linear-gradient(180deg, #e2e8f0, #94a3b8);
			box-shadow: inset 0 -3px 6px rgba(0,0,0,0.15);
			position: relative; z-index: 2;
		}
		.kpc-dg-tank-body {
			width: 130px; height: 260px; margin-top: -13px;
			background: linear-gradient(90deg, #cbd5e1 0%, #f1f5f9 18%, #e2e8f0 45%, #f8fafc 60%, #b6c2d1 100%);
			position: relative; overflow: hidden;
			box-shadow: inset 6px 0 10px rgba(0,0,0,0.08), inset -6px 0 10px rgba(0,0,0,0.08);
			border-left: 1px solid #94a3b8; border-right: 1px solid #94a3b8;
		}
		.kpc-dg-tank-cap-bottom {
			width: 130px; height: 22px; border-radius: 50%; margin-top: -11px;
			background: linear-gradient(180deg, #94a3b8, #64748b);
			position: relative; z-index: 1;
		}
		.kpc-dg-liquid {
			position: absolute; bottom: 0; left: 0; width: 100%; height: 0%;
			background: linear-gradient(180deg, rgba(255,255,255,0.35) 0%, transparent 12%),
			            linear-gradient(90deg, #b45309 0%, #f59e0b 30%, #fbbf24 50%, #f59e0b 70%, #92400e 100%);
			transition: height 0.18s ease-out;
		}
		.kpc-dg-liquid-surface {
			position: absolute; top: 0; left: 0; width: 100%; height: 6px;
			background: linear-gradient(90deg, rgba(255,255,255,0.7), rgba(255,255,255,0.15), rgba(255,255,255,0.7));
			background-size: 200% 100%;
			animation: kpc-dg-shimmer 2.4s linear infinite;
		}
		@keyframes kpc-dg-shimmer { 0% { background-position: 0% 0; } 100% { background-position: -200% 0; } }
		.kpc-dg-tank-label { font-size: 11px; color: #64748b; margin-top: 6px; }
		.kpc-dg-ruler {
			position: relative; width: 46px; height: 260px; margin-top: 13px;
			border-left: 2px solid #cbd5e1; cursor: pointer;
		}
		.kpc-dg-tick { position: absolute; left: 0; width: 8px; height: 1px; background: #cbd5e1; }
		.kpc-dg-tick.major { width: 14px; background: #94a3b8; }
		.kpc-dg-tick-label { position: absolute; left: 18px; font-size: 10px; color: #94a3b8; transform: translateY(-50%); white-space: nowrap; }
		.kpc-dg-handle {
			position: absolute; left: -3px; width: 40px; height: 22px; margin-top: -11px;
			background: var(--ai-primary, #2563eb); color: white; border-radius: 5px;
			display: flex; align-items: center; justify-content: center;
			font-size: 13px; cursor: grab; box-shadow: 0 2px 6px rgba(37,99,235,0.5);
			touch-action: none;
		}
		.kpc-dg-handle:active { cursor: grabbing; }
		.kpc-dg-hint { font-size: 11px; color: #94a3b8; margin-top: 10px; }
	</style>
	<div class="kpc-dg">
		<div>
			<div class="kpc-dg-readout">
				<b class="kpc-dg-level">0</b> mm &nbsp; <span class="kpc-dg-pct">(0.0% full)</span><br>
				<span class="kpc-dg-vol">≈ 0.0 KL</span>
			</div>
			<div class="kpc-dg-visual">
				<div class="kpc-dg-tank-wrap">
					<div class="kpc-dg-tank-cap-top"></div>
					<div class="kpc-dg-tank-body">
						<div class="kpc-dg-liquid"><div class="kpc-dg-liquid-surface"></div></div>
					</div>
					<div class="kpc-dg-tank-cap-bottom"></div>
					<div class="kpc-dg-tank-label">${__("Tank")}</div>
				</div>
				<div class="kpc-dg-ruler">
					<div class="kpc-dg-handle">📏</div>
				</div>
			</div>
			<div class="kpc-dg-hint">${__("Drag the handle, or click anywhere on the ruler, to set the dip level.")}</div>
		</div>
	</div>`;
};

kpc.dip_gauge._wire = function (dialog, ctx) {
	const $wrap = dialog.$wrapper;
	const $liquid = $wrap.find(".kpc-dg-liquid");
	const $handle = $wrap.find(".kpc-dg-handle");
	const $ruler = $wrap.find(".kpc-dg-ruler");
	const $level = $wrap.find(".kpc-dg-level");
	const $pct = $wrap.find(".kpc-dg-pct");
	const $vol = $wrap.find(".kpc-dg-vol");

	// Real tick marks, scaled to this tank's own reference height - not a
	// fixed 0-100 scale, so the gauge always reflects the actual tank.
	const tickCount = 10;
	for (let i = 0; i <= tickCount; i++) {
		const topPct = (i / tickCount) * 100;
		const mmAtTick = Math.round(ctx.maxHeightMm * (1 - i / tickCount));
		const $tick = $(`<div class="kpc-dg-tick major" style="top:${topPct}%"></div>`);
		$ruler.append($tick);
		if (i % 2 === 0) {
			$ruler.append(`<div class="kpc-dg-tick-label" style="top:${topPct}%">${mmAtTick}</div>`);
		}
	}

	function setLevel(levelMm) {
		levelMm = Math.max(0, Math.min(ctx.maxHeightMm, levelMm));
		const fraction = ctx.maxHeightMm ? levelMm / ctx.maxHeightMm : 0;
		$liquid.css("height", fraction * 100 + "%");
		$handle.css("top", (1 - fraction) * 100 + "%");
		$level.text(Math.round(levelMm));
		$pct.text("(" + (fraction * 100).toFixed(1) + "% full)");
		const estimatedKl = ctx.capacityKl ? (fraction * ctx.capacityKl).toFixed(1) : "?";
		$vol.text("≈ " + estimatedKl + " KL");
		dialog.$wrapper[0]._kpc_level_mm = levelMm;
	}

	function levelFromClientY(clientY) {
		const rect = $ruler[0].getBoundingClientRect();
		let fraction = 1 - (clientY - rect.top) / rect.height;
		fraction = Math.max(0, Math.min(1, fraction));
		return fraction * ctx.maxHeightMm;
	}

	let dragging = false;
	$handle.on("pointerdown", (e) => {
		dragging = true;
		e.preventDefault();
	});
	$ruler.on("pointerdown", (e) => {
		if (e.target === $handle[0]) return;
		setLevel(levelFromClientY(e.clientY));
		dragging = true;
	});
	$(document).on("pointermove.kpc-dip-gauge", (e) => {
		if (!dragging) return;
		setLevel(levelFromClientY(e.clientY));
	});
	$(document).on("pointerup.kpc-dip-gauge", () => {
		dragging = false;
	});
	dialog.onhide = () => {
		$(document).off("pointermove.kpc-dip-gauge pointerup.kpc-dip-gauge");
	};

	setLevel(ctx.startMm);
};
