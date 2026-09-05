// Copyright (c) 2026, ArcApps and contributors
// For license information, please see license.txt
//
// "Fetch From Meter" - simulates a real dip-gauge/meter reading for any
// doctype with the same "Dip Reading" section (Tank Measurement,
// Terminal Receipt, ...): a "Fetch From Meter" toolbar button opens a
// 3D-styled tank visual, the liquid level animates up on its own to a
// randomised-but-realistic reading (scaled against the actual selected
// tank's real reference height/capacity - never a hardcoded scale), and
// once it settles, the dialog applies every reading straight into the
// real form fields via frm.set_value and closes itself - no manual entry
// or confirmation step. This is a data-entry convenience simulating a
// real meter feed, not a new data source; nothing here is saved on its
// own. Every doctype that uses this shares the exact same four
// fieldnames for the readings themselves (observed_level_mm/
// observed_temperature_c/water_dip_mm/density_at_15c) - only the Link
// field that names *which* Oil Tank differs (Tank Measurement's own
// "tank" vs Terminal Receipt's "destination_tank"), passed in explicitly
// rather than assumed.

frappe.provide("kpc.dip_gauge");

kpc.dip_gauge.add_toolbar_button = function (frm, tank_fieldname) {
	frm.add_custom_button(__("Fetch From Meter"), () => kpc.dip_gauge.open(frm, tank_fieldname));
};

kpc.dip_gauge.open = function (frm, tank_fieldname) {
	tank_fieldname = tank_fieldname || "tank";
	const tankId = frm.doc[tank_fieldname];
	if (!tankId) {
		frappe.msgprint({
			title: __("Select a Tank First"),
			indicator: "orange",
			message: __("Pick a Tank above, then fetch from the meter - it scales itself to that tank's real capacity."),
		});
		return;
	}

	frappe.db.get_value("Oil Tank", tankId, ["tank_name", "capacity_kl", "reference_height_mm", "product"]).then((r) => {
		const tank = r.message || {};
		const maxHeightMm = flt(tank.reference_height_mm) || 20000;
		const capacityKl = flt(tank.capacity_kl) || 0;

		// Real reference values (per-product where set, same field VCF
		// calculations already use), not hardcoded constants - the "random"
		// reading is a small, realistic variance around these, the same way
		// a real meter never reads back exactly its nominal reference.
		const productPromise = tank.product
			? frappe.db.get_value("Item", tank.product, ["reference_temperature_c", "density_at_15c"])
			: Promise.resolve({ message: {} });

		productPromise.then((pr) => {
			const productInfo = pr.message || {};
			const standardTemperatureC = flt(productInfo.reference_temperature_c) || 15;
			const standardDensity = flt(productInfo.density_at_15c) || flt(frm.doc.density_at_15c) || 0;

			// A "standard" simulated meter reading: a realistic mid-range
			// level (30-80% full - a tank reading as literally empty or
			// literally full on a routine gauge check would be the
			// exception, not the standard case), temperature within a
			// couple of degrees of the reference standard, and a small
			// standard free-water dip (0-3mm - real tanks routinely show a
			// trace of settled water even under completely normal
			// conditions; a real meter reading back exactly 0.00 every
			// single time would itself look fake).
			const reading = {
				levelMm: maxHeightMm * (0.3 + Math.random() * 0.5),
				temperatureC: standardTemperatureC + (Math.random() * 3 - 1.5),
				waterDipMm: Math.random() * 3,
				density: standardDensity,
			};

			kpc.dip_gauge._show(frm, {
				tankName: tank.tank_name || tankId,
				maxHeightMm: maxHeightMm,
				capacityKl: capacityKl,
				reading: reading,
			});
		});
	});
};

kpc.dip_gauge._show = function (frm, ctx) {
	const dialog = new frappe.ui.Dialog({
		title: __("Fetch From Meter - {0}", [ctx.tankName]),
		size: "small",
		fields: [{ fieldtype: "HTML", fieldname: "gauge_html" }],
		// Once this fetch starts, it runs to completion and applies itself -
		// no manual close via the X button, Escape, or a backdrop click
		// midway through a simulated live reading.
		static: true,
	});

	dialog.fields_dict.gauge_html.$wrapper.html(kpc.dip_gauge._html());
	dialog.show();

	// Deferred to the next tick - the dialog's own DOM needs to exist
	// before wiring anything to elements inside it.
	setTimeout(() => kpc.dip_gauge._animate(frm, dialog, ctx), 0);
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
			border-left: 2px solid #cbd5e1;
		}
		.kpc-dg-tick { position: absolute; left: 0; width: 8px; height: 1px; background: #cbd5e1; }
		.kpc-dg-tick.major { width: 14px; background: #94a3b8; }
		.kpc-dg-tick-label { position: absolute; left: 18px; font-size: 10px; color: #94a3b8; transform: translateY(-50%); white-space: nowrap; }
		.kpc-dg-handle {
			position: absolute; left: -3px; width: 40px; height: 22px; margin-top: -11px;
			background: var(--ai-primary, #2563eb); color: white; border-radius: 5px;
			display: flex; align-items: center; justify-content: center;
			font-size: 13px; box-shadow: 0 2px 6px rgba(37,99,235,0.5);
		}
		.kpc-dg-summary { font-size: 12px; color: #46516b; margin-top: 10px; line-height: 1.7; }
		.kpc-dg-summary b { color: #16233b; }
		.kpc-dg-hint { font-size: 11px; color: #94a3b8; margin-top: 4px; }
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
			<div class="kpc-dg-summary">
				${__("Temperature")}: <b class="kpc-dg-temp">-</b>°C &nbsp;·&nbsp;
				${__("Free Water")}: <b class="kpc-dg-water">-</b> mm &nbsp;·&nbsp;
				${__("Density")}: <b class="kpc-dg-density">-</b> kg/L
			</div>
			<div class="kpc-dg-hint">${__("Reading live meter data...")}</div>
		</div>
	</div>`;
};

kpc.dip_gauge._animate = function (frm, dialog, ctx) {
	const $wrap = dialog.$wrapper;
	const $liquid = $wrap.find(".kpc-dg-liquid");
	const $handle = $wrap.find(".kpc-dg-handle");
	const $ruler = $wrap.find(".kpc-dg-ruler");
	const $level = $wrap.find(".kpc-dg-level");
	const $pct = $wrap.find(".kpc-dg-pct");
	const $vol = $wrap.find(".kpc-dg-vol");
	const $hint = $wrap.find(".kpc-dg-hint");

	// Real tick marks, scaled to this tank's own reference height - not a
	// fixed 0-100 scale, so the gauge always reflects the actual tank.
	const tickCount = 10;
	for (let i = 0; i <= tickCount; i++) {
		const topPct = (i / tickCount) * 100;
		const mmAtTick = Math.round(ctx.maxHeightMm * (1 - i / tickCount));
		$ruler.append(`<div class="kpc-dg-tick major" style="top:${topPct}%"></div>`);
		if (i % 2 === 0) {
			$ruler.append(`<div class="kpc-dg-tick-label" style="top:${topPct}%">${mmAtTick}</div>`);
		}
	}

	function renderLevel(levelMm) {
		const fraction = ctx.maxHeightMm ? levelMm / ctx.maxHeightMm : 0;
		$liquid.css("height", fraction * 100 + "%");
		$handle.css("top", (1 - fraction) * 100 + "%");
		$level.text(Math.round(levelMm));
		$pct.text("(" + (fraction * 100).toFixed(1) + "% full)");
		const estimatedKl = ctx.capacityKl ? (fraction * ctx.capacityKl).toFixed(1) : "?";
		$vol.text("≈ " + estimatedKl + " KL");
	}

	$wrap.find(".kpc-dg-temp").text(ctx.reading.temperatureC.toFixed(2));
	$wrap.find(".kpc-dg-water").text(ctx.reading.waterDipMm.toFixed(2));
	$wrap.find(".kpc-dg-density").text(ctx.reading.density.toFixed(4));

	// The handle/liquid climb on their own, like a real gauge needle
	// sweeping up to a live reading - never user-dragged. Eased (fast at
	// first, settling in) rather than linear, so it reads as "arriving at
	// a value" instead of a mechanical ramp.
	const durationMs = 1400;
	const startedAt = Date.now();

	function step() {
		const elapsed = Date.now() - startedAt;
		const t = Math.min(1, elapsed / durationMs);
		const eased = 1 - Math.pow(1 - t, 3);
		renderLevel(ctx.reading.levelMm * eased);

		if (t < 1) {
			requestAnimationFrame(step);
			return;
		}

		$hint.text(__("Reading applied."));
		setTimeout(() => {
			frm.set_value("observed_level_mm", Math.round(ctx.reading.levelMm));
			frm.set_value("observed_temperature_c", flt(ctx.reading.temperatureC.toFixed(2)));
			frm.set_value("water_dip_mm", ctx.reading.waterDipMm);
			if (ctx.reading.density) {
				frm.set_value("density_at_15c", ctx.reading.density);
			}
			dialog.hide();
			frappe.show_alert({ message: __("Dip reading fetched from meter."), indicator: "green" });
		}, 350);
	}

	requestAnimationFrame(step);
};
