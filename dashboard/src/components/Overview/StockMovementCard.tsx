import Chart from "chart.js/auto";
import { useFrappeGetCall, useFrappeGetDocList } from "frappe-react-sdk";
import React, { useEffect, useMemo, useRef, useState } from "react";

interface StockMovementResponse {
  unit: string;
  period: string;
  date: string;
  opening: number;
  receipts: number;
  deliveries: number;
  losses: number;
  closing: number;
  summary?: {
    net_change: number;
    net_change_percent: number;
    turnover_rate_percent: number;
  };
}

export const StockMovementCard: React.FC = () => {
  const chartRef = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showTooltipInfo, setShowTooltipInfo] = useState(false);

  // 1. Fetch via Frappe Whitelisted API
  const { data: apiData } =
    useFrappeGetCall<StockMovementResponse>(
      "kpc.petroleum_operations.api.get_stock_movement",
    );

  // 2. Direct DocList fallback
  const { data: positions } = useFrappeGetDocList("Inventory Position", {
    fields: [
      "opening_volume_kl",
      "receipts_kl",
      "dispatches_kl",
      "adjustments_kl",
      "closing_volume_kl",
    ],
    limit: 100,
  });

  const { data: receipts } = useFrappeGetDocList("Terminal Receipt", {
    fields: ["net_standard_volume_kl", "gross_observed_volume_kl"],
    limit: 100,
  });

  const { data: dispatches } = useFrappeGetDocList("Dispatch", {
    fields: ["actual_quantity_kl", "planned_quantity_kl"],
    limit: 100,
  });

  // Calculate live movement numbers
  const movement = useMemo(() => {
    if (apiData && apiData.opening !== undefined) {
      return {
        unit: apiData.unit || "m³",
        period: apiData.period || "today",
        opening: apiData.opening,
        receipts: apiData.receipts,
        deliveries: apiData.deliveries,
        losses: apiData.losses,
        closing: apiData.closing,
      };
    }

    if (positions && positions.length > 0) {
      const op = positions.reduce(
        (acc: number, p: any) => acc + (Number(p.opening_volume_kl) || 0),
        0,
      );
      const rec = positions.reduce(
        (acc: number, p: any) => acc + (Number(p.receipts_kl) || 0),
        0,
      );
      const disp = positions.reduce(
        (acc: number, p: any) => acc + (Number(p.dispatches_kl) || 0),
        0,
      );
      const adj = positions.reduce(
        (acc: number, p: any) => acc + (Number(p.adjustments_kl) || 0),
        0,
      );
      const cl = positions.reduce(
        (acc: number, p: any) => acc + (Number(p.closing_volume_kl) || 0),
        0,
      );

      return {
        unit: "m³",
        period: "today",
        opening: op,
        receipts: rec,
        deliveries: disp,
        losses: adj,
        closing: cl || (op + rec - disp + adj),
      };
    }

    // Dynamic aggregation from terminal receipts & dispatches
    let totalReceipts = 0;
    if (receipts && receipts.length > 0) {
      totalReceipts = receipts.reduce(
        (sum: number, r: any) =>
          sum +
          (Number(r.net_standard_volume_kl) ||
            Number(r.gross_observed_volume_kl) ||
            0),
        0,
      );
    }
    let totalDispatches = 0;
    if (dispatches && dispatches.length > 0) {
      totalDispatches = dispatches.reduce(
        (sum: number, d: any) =>
          sum +
          (Number(d.actual_quantity_kl) ||
            Number(d.planned_quantity_kl) ||
            0),
        0,
      );
    }

    const opening = 0;
    const rec = totalReceipts;
    const del = totalDispatches;
    const loss = 0;
    const closing = opening + rec - del + loss;

    return {
      unit: "m³",
      period: "today",
      opening,
      receipts: rec,
      deliveries: del,
      losses: loss,
      closing,
    };
  }, [apiData, positions, receipts, dispatches]);

  // Waterfall Chart.js instantiation
  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const { opening, receipts, deliveries, losses, closing } = movement;

    // Floating bar steps:
    // 1. Opening: [0, opening]
    // 2. Receipts: [opening, opening + receipts]
    // 3. Deliveries: [opening + receipts - deliveries, opening + receipts]
    // 4. Losses: [closing, closing + Math.abs(losses)]
    // 5. Closing: [0, closing]
    const peakVolume = opening + receipts;
    const deliveryBottom = peakVolume - deliveries;
    const lossBottom = closing;
    const lossTop = closing + Math.abs(losses);

    const labels = ["Opening", "Receipts", "Deliveries", "Losses", "Closing"];
    const barRanges = [
      [0, opening],
      [opening, peakVolume],
      [deliveryBottom, peakVolume],
      losses !== 0 ? [lossBottom, lossTop] : [closing, closing],
      [0, closing],
    ];

    const colors = [
      "#8E9EB5", // Opening: Slate/Gray
      "#00BA7C", // Receipts: Emerald Green
      "#F43F5E", // Deliveries: Coral Red
      "#F59E0B", // Losses: Amber
      "#386BF6", // Closing: Vibrant Royal Blue
    ];

    const hoverColors = [
      "#A2B0C4",
      "#10C98C",
      "#FB5B77",
      "#FBBF24",
      "#4E7DFF",
    ];

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            data: barRanges as any,
            backgroundColor: colors,
            hoverBackgroundColor: hoverColors,
            borderRadius: 6,
            borderSkipped: false,
            barPercentage: 0.62,
            categoryPercentage: 0.78,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 24,
            bottom: 16,
            left: 10,
            right: 20,
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(15, 23, 40, 0.95)",
            titleColor: "#EAF1FA",
            bodyColor: "#8AA0C0",
            borderColor: "#233252",
            borderWidth: 1,
            padding: 12,
            boxPadding: 6,
            usePointStyle: true,
            callbacks: {
              title: (items) => `${items[0].label} Volume`,
              label: (context) => {
                const idx = context.dataIndex;
                let val = 0;
                let prefix = "";
                if (idx === 0) val = opening;
                else if (idx === 1) {
                  val = receipts;
                  prefix = "+";
                } else if (idx === 2) {
                  val = deliveries;
                  prefix = "-";
                } else if (idx === 3) {
                  val = Math.abs(losses);
                  prefix = losses < 0 ? "-" : "+";
                } else if (idx === 4) val = closing;

                return ` Volume: ${prefix}${val.toLocaleString("en-US", {
                  maximumFractionDigits: 1,
                })} ${movement.unit}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: "#8AA0C0",
              font: { family: "Inter", size: 12.5, weight: 500 },
              padding: 14,
            },
          },
          y: {
            min: 0,
            suggestedMax: 160000,
            grid: {
              color: "rgba(35, 50, 82, 0.35)",
            },
            ticks: {
              stepSize: 20000,
              color: "#5A6D8C",
              font: { family: "IBM Plex Mono", size: 11 },
              callback: (value) => {
                const num = Number(value);
                return num === 0 ? "0k" : `${num / 1000}k`;
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [movement]);


  return (
    <div className="bg-[#0f1728] border border-[#233252] rounded-2xl p-7 sm:p-9 shadow-xl backdrop-blur-md relative overflow-hidden transition-all duration-300 hover:border-[#33c9b7]/40 mb-12 sm:mb-14">
      {/* Subtle background ambient glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#386bf6]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#00ba7c]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 sm:mb-7">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="font-['Space_Grotesk'] text-xl sm:text-2xl font-bold text-[#eaf1fa] tracking-tight">
              Stock movement
            </h3>
            <button
              type="button"
              onClick={() => setShowTooltipInfo(!showTooltipInfo)}
              onMouseEnter={() => setShowTooltipInfo(true)}
              onMouseLeave={() => setShowTooltipInfo(false)}
              className="w-5 h-5 rounded-full bg-[#182746] border border-[#233252] flex items-center justify-center text-[#8aa0c0] hover:text-[#33c9b7] text-xs font-mono transition-colors focus:outline-none cursor-pointer"
              title="Stock Bridge Info"
            >
              i
            </button>
          </div>
          <p className="text-xs sm:text-sm text-[#8aa0c0] mt-1.5 font-normal">
            Opening balance walked through receipts, deliveries and losses to closing.
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-xs sm:text-sm font-medium text-[#8aa0c0] font-['IBM_Plex_Mono'] bg-[#141f35] px-3 py-1.5 rounded-lg border border-[#233252]/70 shadow-inner">
            {movement.unit}, {movement.period}
          </span>
        </div>
      </div>

      {/* Info popover badge */}
      {showTooltipInfo && (
        <div className="mb-6 p-3.5 bg-[#141f35] border border-[#33c9b7]/30 rounded-xl text-xs text-[#8aa0c0] flex items-center justify-between animate-fadeIn">
          <span>
            Real-time bridge formula:{" "}
            <code className="text-[#33c9b7] font-mono font-semibold">
              Opening + Receipts - Deliveries ± Losses = Closing
            </code>
          </span>
          <span className="font-mono text-emerald-400">
            Live API: kpc.petroleum_operations.api.get_stock_movement
          </span>
        </div>
      )}

      {/* Chart Canvas Viewport */}
      <div className="w-full h-80 sm:h-96 relative my-2 px-1">
        <canvas ref={canvasRef} id="stockMovementCanvas" />
      </div>

      {/* Summary KPI Footnotes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#1a2540]">
        <div className="bg-[#141f35]/70 rounded-xl p-4 sm:p-5 border border-[#233252]/50 shadow-sm">
          <div className="text-[11px] font-medium text-[#8aa0c0] uppercase tracking-wider">
            Opening Stock
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-[#eaf1fa] mt-1.5">
            {movement.opening.toLocaleString("en-US", {
              maximumFractionDigits: 0,
            })}{" "}
            <span className="text-xs font-normal text-[#5a6d8c]">
              {movement.unit}
            </span>
          </div>
        </div>

        <div className="bg-[#141f35]/70 rounded-xl p-4 sm:p-5 border border-[#233252]/50 shadow-sm">
          <div className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider">
            + Receipts (In)
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-emerald-400 mt-1.5">
            +{movement.receipts.toLocaleString("en-US", { maximumFractionDigits: 0 })}{" "}
            <span className="text-xs font-normal text-emerald-500/70">
              {movement.unit}
            </span>
          </div>
        </div>

        <div className="bg-[#141f35]/70 rounded-xl p-4 sm:p-5 border border-[#233252]/50 shadow-sm">
          <div className="text-[11px] font-medium text-rose-400 uppercase tracking-wider">
            - Deliveries (Out)
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-rose-400 mt-1.5">
            -{movement.deliveries.toLocaleString("en-US", { maximumFractionDigits: 0 })}{" "}
            <span className="text-xs font-normal text-rose-500/70">
              {movement.unit}
            </span>
          </div>
        </div>

        <div className="bg-[#141f35]/70 rounded-xl p-4 sm:p-5 border border-[#233252]/50 shadow-sm">
          <div className="text-[11px] font-medium text-blue-400 uppercase tracking-wider">
            = Closing Balance
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-blue-400 mt-1.5">
            {movement.closing.toLocaleString("en-US", { maximumFractionDigits: 0 })}{" "}
            <span className="text-xs font-normal text-blue-500/70">
              {movement.unit}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockMovementCard;
