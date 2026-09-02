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

// ── Data ─────────────────────────────────────────────────────────────────────

const kpiItems = [
  {
    label: "Active journeys",
    value: 10,
    delta: "▲ 3 vs last week",
    deltaType: "up" as const,
    variant: "cyan" as const,
    sparklineData: [10, 12, 11, 14, 13, 16, 18],
    icon: <IconJourneys />,
  },
  {
    label: "Volume received today",
    value: "42,180",
    unit: "KL",
    delta: "▲ 6.2%",
    deltaType: "up" as const,
    variant: "blue" as const,
    sparklineData: [30, 34, 31, 38, 36, 40, 42],
    icon: <IconVolume />,
  },
  {
    label: "In pipeline transit",
    value: "11,940",
    unit: "KL",
    delta: "— steady",
    deltaType: "flat" as const,
    variant: "violet" as const,
    sparklineData: [14, 13, 12, 13, 12, 11, 11.9],
    icon: <IconPipeline />,
  },
  {
    label: "Open AI alerts",
    value: 3,
    delta: "▼ awaiting Maintenance",
    deltaType: "warn" as const,
    variant: "amber" as const,
    sparklineData: [1, 2, 2, 4, 3, 4, 3],
    icon: <IconAlert />,
  },
  {
    label: "Reconciliation variance",
    value: "0.31",
    unit: "%",
    delta: "within 0.42% tolerance",
    deltaType: "up" as const,
    variant: "cyan" as const,
    sparklineData: [0.5, 0.44, 0.4, 0.38, 0.35, 0.33, 0.31],
    icon: <IconVariance />,
  },
  {
    label: "Invoiced this month",
    value: "618.4",
    unit: "M",
    delta: "▲ 12.8%",
    deltaType: "up" as const,
    variant: "gold" as const,
    sparklineData: [40, 46, 44, 52, 55, 58, 61],
    icon: <IconInvoice />,
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export const HeroKpi: React.FC = () => {
  // ── Live: Active Journey count via list fetch ─────────────────────────────
  // Fetches journeys where status = "Active" (non-completed, non-cancelled)
  const {
    data: activeJourneys,
    isLoading: journeyLoading,
    error: journeyError,
  } = useFrappeGetDocList("Journey", {
    fields: ["name"],
    filters: [["status", "=", "Active"]],
    limit: 500, // fetch up to 500 to get an accurate count
  });

  // Derive count from the returned list length
  const activeJourneyCount = activeJourneys?.length;

  // Derive display value: ellipsis while loading, "–" on error
  const journeyValue = useMemo(() => {
    if (journeyLoading) return "…";
    if (journeyError) return "–";
    return activeJourneyCount ?? 0;
  }, [activeJourneyCount, journeyLoading, journeyError]);

  // Merge live count into the first kpiItem
  const liveKpiItems = useMemo(
    () =>
      kpiItems.map((item, idx) =>
        idx === 0 ? { ...item, value: journeyValue } : item,
      ),
    [journeyValue],
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
          <b>{journeyLoading ? "…" : (activeJourneyCount ?? "–")}</b> in
          progress · <b>4</b> awaiting approval
          <br />
          <b>2</b> flagged for reconciliation review
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
    </section>
  );
};

export default HeroKpi;
