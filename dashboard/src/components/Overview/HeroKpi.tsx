import { useFrappeGetDocList } from "frappe-react-sdk";
import React, { useMemo } from "react";
import { KpiCard } from "./KpiCard";

// ── Large 3D-style floating SVG icons ────────────────────────────────────────

const IconJourneys = () => (
  <svg
    width="52"
    height="52"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const IconVolume = () => (
  <svg
    width="52"
    height="52"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect
      x="2"
      y="3"
      width="4"
      height="18"
      rx="1"
      fill="currentColor"
      fillOpacity="0.3"
    />
    <rect
      x="10"
      y="8"
      width="4"
      height="13"
      rx="1"
      fill="currentColor"
      fillOpacity="0.5"
    />
    <rect
      x="18"
      y="5"
      width="4"
      height="16"
      rx="1"
      fill="currentColor"
      fillOpacity="0.7"
    />
  </svg>
);

const IconPipeline = () => (
  <svg
    width="52"
    height="52"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18M3 12h18M3 18h18" />
    <circle
      cx="18"
      cy="6"
      r="2.5"
      fill="currentColor"
      stroke="none"
      opacity="0.9"
    />
    <circle
      cx="6"
      cy="12"
      r="2.5"
      fill="currentColor"
      stroke="none"
      opacity="0.7"
    />
    <circle
      cx="14"
      cy="18"
      r="2.5"
      fill="currentColor"
      stroke="none"
      opacity="0.5"
    />
  </svg>
);

const IconAlert = () => (
  <svg
    width="52"
    height="52"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path
      d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
      fill="currentColor"
      fillOpacity="0.2"
    />
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const IconVariance = () => (
  <svg
    width="52"
    height="52"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" fillOpacity="0.3" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

const IconInvoice = () => (
  <svg
    width="52"
    height="52"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

// ── Component ─────────────────────────────────────────────────────────────────

export const HeroKpi: React.FC = () => {
  // 1. Live: Journeys
  const { data: journeys, isLoading: journeyLoading } = useFrappeGetDocList(
    "Journey",
    {
      fields: ["name", "status", "current_step"],
      limit: 500,
    },
  );

  // 2. Live: Terminal Receipts & Volume Received
  const { data: terminalReceipts, isLoading: receiptsLoading } =
    useFrappeGetDocList("Terminal Receipt", {
      fields: [
        "name",
        "net_standard_volume_kl",
        "gross_observed_volume_kl",
        "receipt_datetime",
      ],
      limit: 500,
    });

  const { data: shipments } = useFrappeGetDocList("Oil Shipment", {
    fields: ["name", "planned_quantity_kl", "workflow_state"],
    limit: 500,
  });

  // 3. Live: Pipeline Batches / Transit Volume
  const { data: pipelineBatches, isLoading: pipelineLoading } =
    useFrappeGetDocList("Pipeline Batch", {
      fields: ["name", "planned_volume_kl", "docstatus"],
      limit: 500,
    });

  // 4. Live: AI Alerts
  const { data: openAlerts, isLoading: alertsLoading } = useFrappeGetDocList(
    "AI Alert",
    {
      fields: ["name", "status", "severity", "anomaly_score"],
      filters: [["status", "=", "Open"]],
      limit: 500,
    },
  );

  // 5. Live: Reconciliation & Variance
  const { data: reconciliations, isLoading: reconLoading } =
    useFrappeGetDocList("Reconciliation", {
      fields: [
        "name",
        "variance_percent",
        "variance_kl",
        "within_tolerance",
        "tolerance_percent",
      ],
      limit: 100,
    });

  // 6. Live: Invoices
  const { data: invoices, isLoading: invoiceLoading } = useFrappeGetDocList(
    "Invoice",
    {
      fields: ["name", "grand_total", "currency", "posting_date"],
      limit: 500,
    },
  );

  // 7. Live: Tank stock and capacity
  const { data: tanks, isLoading: tanksLoading } = useFrappeGetDocList(
    "Oil Tank",
    {
      fields: ["name", "safe_fill_capacity_kl", "current_state"],
      filters: [["current_state", "!=", "Decommissioned"]],
      limit: 100,
    },
  );

  const { data: inventoryPositions, isLoading: inventoryLoading } =
    useFrappeGetDocList("Inventory Position", {
      fields: ["name", "tank", "position_date", "closing_volume_kl"],
      orderBy: { field: "position_date", order: "desc" },
      limit: 500,
    });

  // 8. Live: Today's pipeline movement volume
  const { data: movements, isLoading: movementsLoading } = useFrappeGetDocList(
    "Movement",
    {
      fields: ["name", "pipeline_batch", "movement_status", "start_datetime"],
      filters: [["movement_status", "in", ["In Transit", "Completed"]]],
      limit: 500,
    },
  );

  // ── Computations ────────────────────────────────────────────────────────────

  // Card 1: Active Journeys
  const activeJourneys = useMemo(() => {
    if (!journeys) return [];
    return journeys.filter(
      (j: any) =>
        j.status === "Active" || !["Completed", "Cancelled"].includes(j.status),
    );
  }, [journeys]);

  const awaitingApprovalCount = useMemo(() => {
    if (!journeys) return 0;
    return journeys.filter(
      (j: any) => j.status === "Draft" || j.status === "Pending Approval",
    ).length;
  }, [journeys]);

  // Card 2: Volume Received Today / Total (KL)
  const volumeReceived = useMemo(() => {
    let total = 0;
    if (terminalReceipts && terminalReceipts.length > 0) {
      total = terminalReceipts.reduce(
        (sum: number, r: any) =>
          sum +
          (Number(r.net_standard_volume_kl) ||
            Number(r.gross_observed_volume_kl) ||
            0),
        0,
      );
    } else if (shipments && shipments.length > 0) {
      total = shipments.reduce(
        (sum: number, s: any) => sum + (Number(s.planned_quantity_kl) || 0),
        0,
      );
    }
    return total;
  }, [terminalReceipts, shipments]);

  // Card 3: In Pipeline Transit (KL)
  const pipelineTransitVolume = useMemo(() => {
    if (pipelineBatches && pipelineBatches.length > 0) {
      return pipelineBatches.reduce(
        (sum: number, b: any) => sum + (Number(b.planned_volume_kl) || 0),
        0,
      );
    }
    return 0;
  }, [pipelineBatches]);

  // Card 4: Open AI Alerts
  const openAlertsCount = openAlerts?.length ?? 0;
  const criticalAlertsCount = useMemo(() => {
    if (!openAlerts) return 0;
    return openAlerts.filter(
      (a: any) => a.severity === "High" || a.severity === "Critical",
    ).length;
  }, [openAlerts]);

  // Card 5: Reconciliation Variance (%)
  const { avgVariance, tolerance, flaggedReconCount } = useMemo(() => {
    if (!reconciliations || reconciliations.length === 0) {
      return { avgVariance: 0, tolerance: 0, flaggedReconCount: 0 };
    }
    const totalVar = reconciliations.reduce(
      (sum: number, r: any) => sum + Math.abs(Number(r.variance_percent) || 0),
      0,
    );
    const avg = totalVar / reconciliations.length;
    const tol = Number(reconciliations[0]?.tolerance_percent) || 0;
    const flagged = reconciliations.filter(
      (r: any) => !r.within_tolerance,
    ).length;
    return { avgVariance: avg, tolerance: tol, flaggedReconCount: flagged };
  }, [reconciliations]);

  // Card 6: Invoiced Total (M or formatted)
  const { invoiceTotalFormatted, invoiceUnit, invoiceCount } = useMemo(() => {
    if (!invoices || invoices.length === 0) {
      return {
        invoiceTotalFormatted: "0",
        invoiceUnit: "KES",
        invoiceCount: 0,
      };
    }
    const total = invoices.reduce(
      (sum: number, inv: any) => sum + (Number(inv.grand_total) || 0),
      0,
    );
    if (total >= 1_000_000) {
      return {
        invoiceTotalFormatted: (total / 1_000_000).toFixed(1),
        invoiceUnit: "M",
        invoiceCount: invoices.length,
      };
    } else if (total >= 1_000) {
      return {
        invoiceTotalFormatted: (total / 1_000).toFixed(1),
        invoiceUnit: "K",
        invoiceCount: invoices.length,
      };
    }
    return {
      invoiceTotalFormatted: total.toLocaleString(),
      invoiceUnit: "KES",
      invoiceCount: invoices.length,
    };
  }, [invoices]);

  const latestInventoryByTank = useMemo(() => {
    const latest = new Map<string, any>();
    for (const position of inventoryPositions ?? []) {
      if (position.tank && !latest.has(position.tank))
        latest.set(position.tank, position);
    }
    return latest;
  }, [inventoryPositions]);

  const totalStock = useMemo(
    () =>
      Array.from(latestInventoryByTank.values()).reduce(
        (sum, position) => sum + (Number(position.closing_volume_kl) || 0),
        0,
      ),
    [latestInventoryByTank],
  );

  const availableUsage = useMemo(
    () =>
      (tanks ?? []).reduce((sum, tank: any) => {
        const stock =
          Number(latestInventoryByTank.get(tank.name)?.closing_volume_kl) || 0;
        const capacity = Number(tank.safe_fill_capacity_kl) || 0;
        return sum + Math.max(0, capacity - stock);
      }, 0),
    [tanks, latestInventoryByTank],
  );

  const movementToday = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const batchVolumes = new Map(
      (pipelineBatches ?? []).map((batch: any) => [
        batch.name,
        Number(batch.planned_volume_kl) || 0,
      ]),
    );
    return (movements ?? []).reduce((sum, movement: any) => {
      if (!movement.start_datetime?.startsWith(today)) return sum;
      return sum + (batchVolumes.get(movement.pipeline_batch) || 0);
    }, 0);
  }, [movements, pipelineBatches]);

  const tanksInAlarm = useMemo(
    () =>
      (openAlerts ?? []).filter((alert: any) =>
        ["High", "Critical"].includes(alert.severity),
      ).length,
    [openAlerts],
  );

  const totalVariance = useMemo(
    () =>
      (reconciliations ?? []).reduce(
        (sum, reconciliation: any) =>
          sum + (Number(reconciliation.variance_kl) || 0),
        0,
      ),
    [reconciliations],
  );

  // ── Construct live KPI cards ────────────────────────────────────────────────
  const liveKpiItems = useMemo(
    () => [
      {
        label: "Active journeys",
        value: journeyLoading ? "…" : activeJourneys.length,
        delta: `${activeJourneys.length} in progress`,
        deltaType: "up" as const,
        variant: "cyan" as const,
        sparklineData: [activeJourneys.length, activeJourneys.length],
        icon: <IconJourneys />,
      },
      {
        label: "Volume received today",
        value: receiptsLoading
          ? "…"
          : volumeReceived.toLocaleString("en-US", {
              maximumFractionDigits: 1,
            }),
        unit: "KL",
        delta: `${terminalReceipts?.length ?? shipments?.length ?? 0} receipts logged`,
        deltaType: "up" as const,
        variant: "blue" as const,
        sparklineData: [volumeReceived, volumeReceived],
        icon: <IconVolume />,
      },
      {
        label: "In pipeline transit",
        value: pipelineLoading
          ? "…"
          : pipelineTransitVolume.toLocaleString("en-US", {
              maximumFractionDigits: 1,
            }),
        unit: "KL",
        delta: `${pipelineBatches?.length ?? 0} batches scheduled`,
        deltaType: "flat" as const,
        variant: "violet" as const,
        sparklineData: [pipelineTransitVolume, pipelineTransitVolume],
        icon: <IconPipeline />,
      },
      {
        label: "Open AI alerts",
        value: alertsLoading ? "…" : openAlertsCount,
        delta:
          criticalAlertsCount > 0
            ? `▼ ${criticalAlertsCount} critical/high`
            : openAlertsCount > 0
              ? "▼ awaiting Maintenance"
              : "✓ all systems nominal",
        deltaType: openAlertsCount > 0 ? ("warn" as const) : ("up" as const),
        variant: "amber" as const,
        sparklineData: [openAlertsCount, openAlertsCount],
        icon: <IconAlert />,
      },
      {
        label: "Reconciliation variance",
        value: reconLoading ? "…" : `${avgVariance.toFixed(2)}`,
        unit: "%",
        delta:
          flaggedReconCount > 0
            ? `▼ ${flaggedReconCount} flagged for review`
            : `within ${tolerance.toFixed(2)}% tolerance`,
        deltaType: flaggedReconCount > 0 ? ("warn" as const) : ("up" as const),
        variant: "cyan" as const,
        sparklineData: [avgVariance, avgVariance],
        icon: <IconVariance />,
      },
      {
        label: "Invoiced this month",
        value: invoiceLoading ? "…" : invoiceTotalFormatted,
        unit: invoiceUnit,
        delta: `${invoiceCount} invoices issued`,
        deltaType: "up" as const,
        variant: "gold" as const,
        sparklineData: [invoiceCount, invoiceCount],
        icon: <IconInvoice />,
      },
    ],
    [
      journeyLoading,
      activeJourneys.length,
      receiptsLoading,
      volumeReceived,
      terminalReceipts?.length,
      shipments?.length,
      pipelineLoading,
      pipelineTransitVolume,
      pipelineBatches?.length,
      alertsLoading,
      openAlertsCount,
      criticalAlertsCount,
      reconLoading,
      avgVariance,
      tolerance,
      flaggedReconCount,
      invoiceLoading,
      invoiceTotalFormatted,
      invoiceUnit,
      invoiceCount,
    ],
  );

  const stockKpiItems = useMemo(
    () => [
      {
        label: "Total stock",
        value:
          tanksLoading || inventoryLoading
            ? "…"
            : totalStock.toLocaleString("en-US", { maximumFractionDigits: 1 }),
        unit: "m³",
        delta: `${tanks?.length ?? 0} tanks monitored`,
        deltaType: "flat" as const,
        variant: "cyan" as const,
        sparklineData: [totalStock, totalStock],
        icon: <IconVolume />,
      },
      {
        label: "Available usage",
        value:
          tanksLoading || inventoryLoading
            ? "…"
            : availableUsage.toLocaleString("en-US", {
                maximumFractionDigits: 1,
              }),
        unit: "m³",
        delta: "room to receive",
        deltaType: "up" as const,
        variant: "blue" as const,
        sparklineData: [availableUsage, availableUsage],
        icon: <IconPipeline />,
      },
      {
        label: "Movement today",
        value:
          movementsLoading || pipelineLoading
            ? "…"
            : movementToday.toLocaleString("en-US", {
                maximumFractionDigits: 1,
              }),
        unit: "m³",
        delta: `${movements?.length ?? 0} movements logged`,
        deltaType: "up" as const,
        variant: "violet" as const,
        sparklineData: [movementToday, movementToday],
        icon: <IconJourneys />,
      },
      {
        label: "Tanks in alarm",
        value: alertsLoading ? "…" : tanksInAlarm,
        delta: tanksInAlarm > 0 ? "high or critical" : "all tanks nominal",
        deltaType: tanksInAlarm > 0 ? ("warn" as const) : ("up" as const),
        variant: "crimson" as const,
        sparklineData: [tanksInAlarm, tanksInAlarm],
        icon: <IconAlert />,
      },
      {
        label: "Net variance",
        value: reconLoading
          ? "…"
          : totalVariance.toLocaleString("en-US", { maximumFractionDigits: 1 }),
        unit: "m³",
        delta: `${flaggedReconCount} flagged for review`,
        deltaType: flaggedReconCount > 0 ? ("warn" as const) : ("up" as const),
        variant: "gold" as const,
        sparklineData: [totalVariance, totalVariance],
        icon: <IconVariance />,
      },
    ],
    [
      tanksLoading,
      inventoryLoading,
      tanks?.length,
      totalStock,
      availableUsage,
      movementsLoading,
      movements?.length,
      pipelineLoading,
      movementToday,
      alertsLoading,
      tanksInAlarm,
      reconLoading,
      totalVariance,
      flaggedReconCount,
    ],
  );

  return (
    <section id="overview" className="scroll-mt-24 mb-12">
      {/* Hero Headline */}
      <div className="hero">
        <div>
          <span className="eyebrow">
            Live · Mombasa &amp; Nairobi Terminals
          </span>
          <h1>Every drop of cargo, traced from vessel to invoice.</h1>
          <p>
            Thirteen enforced steps, one immutable journey_ref per cargo — from
            Oil Shipment through predictive pipeline maintenance to Financial
            Posting.
          </p>
        </div>
        <div className="hero-golden">
          ACTIVE GOLDEN THREADS
          <br />
          <b>{journeyLoading ? "…" : activeJourneys.length}</b> in progress ·{" "}
          <b>{awaitingApprovalCount}</b> awaiting approval
          <br />
          <b>{flaggedReconCount}</b> flagged for reconciliation review
        </div>
      </div>

      {/* Premium Glassmorphism KPI Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: "18px",
          marginTop: "32px",
        }}
      >
        {liveKpiItems.map((item, index) => (
          <KpiCard
            key={index}
            label={item.label}
            value={item.value}
            unit={item.unit}
            delta={item.delta}
            deltaType={item.deltaType}
            variant={item.variant}
            sparklineData={item.sparklineData}
            icon={item.icon}
          />
        ))}
      </div>

      <div className="section-head" style={{ marginTop: "48px" }}>
        <div>
          <div className="section-title">Stock &amp; Tank Farm</div>
          <div className="section-note">
            Tank capacity, stock movement and reconciliation by depot.
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "18px",
          marginTop: "20px",
        }}
      >
        {stockKpiItems.map((item, index) => (
          <KpiCard
            key={index}
            label={item.label}
            value={item.value}
            unit={item.unit}
            delta={item.delta}
            deltaType={item.deltaType}
            variant={item.variant}
            sparklineData={item.sparklineData}
            icon={item.icon}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroKpi;
