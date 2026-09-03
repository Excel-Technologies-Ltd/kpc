import { useFrappeGetDocList } from "frappe-react-sdk";
import React, { useMemo, useState } from "react";

interface JourneyDoc {
  name: string;
  status: string;
  current_step?: string;
  origin_shipment?: string;
  product?: string;
  customer?: string;
  remarks?: string;
}

interface OilShipmentDoc {
  name: string;
  journey_ref?: string;
  vessel_name?: string;
  product?: string;
  terminal?: string;
  planned_quantity_kl?: number;
  supplier?: string;
  workflow_state?: string;
}

interface AIAlertDoc {
  name: string;
  journey_ref?: string;
  movement?: string;
  status?: string;
  severity?: string;
  anomaly_score?: number;
  parameter_breached?: string;
  description?: string;
}

const STEP_DEFINITIONS = [
  { num: "01", label: "Shipment" },
  { num: "02", label: "Receipt" },
  { num: "03", label: "Quality Result" },
  { num: "04", label: "Inventory Position" },
  { num: "05", label: "Nomination" },
  { num: "06", label: "Pipeline Batch" },
  { num: "07", label: "Movement + AI" },
  { num: "08", label: "Terminal Receipt" },
  { num: "09", label: "Reconciliation" },
  { num: "10", label: "Allocation" },
  { num: "11", label: "Dispatch" },
  { num: "12", label: "Invoice" },
  { num: "13", label: "Financial Posting" },
];

export const ThreadTracker: React.FC = () => {
  const { data: journeys, isLoading: journeysLoading } = useFrappeGetDocList<JourneyDoc>(
    "Journey",
    {
      fields: [
        "name",
        "status",
        "current_step",
        "origin_shipment",
        "product",
        "customer",
        "remarks",
      ],
      orderBy: { field: "creation", order: "desc" },
      limit: 50,
    },
  );

  const { data: shipments } = useFrappeGetDocList<OilShipmentDoc>(
    "Oil Shipment",
    {
      fields: [
        "name",
        "journey_ref",
        "vessel_name",
        "product",
        "terminal",
        "planned_quantity_kl",
        "supplier",
        "workflow_state",
      ],
      limit: 100,
    },
  );

  const { data: alerts } = useFrappeGetDocList<AIAlertDoc>(
    "AI Alert",
    {
      fields: [
        "name",
        "journey_ref",
        "movement",
        "status",
        "severity",
        "anomaly_score",
        "parameter_breached",
        "description",
      ],
      filters: [["status", "=", "Open"]],
      limit: 50,
    },
  );

  const [selectedJourneyId, setSelectedJourneyId] = useState<string>("");

  // Map shipments by journey_ref or name
  const shipmentMap = useMemo(() => {
    const map = new Map<string, OilShipmentDoc>();
    if (shipments) {
      for (const s of shipments) {
        if (s.journey_ref) map.set(s.journey_ref, s);
        if (s.name) map.set(s.name, s);
      }
    }
    return map;
  }, [shipments]);

  // Map alerts by journey_ref
  const alertMap = useMemo(() => {
    const map = new Map<string, AIAlertDoc>();
    if (alerts) {
      for (const a of alerts) {
        if (a.journey_ref && !map.has(a.journey_ref)) {
          map.set(a.journey_ref, a);
        }
      }
    }
    return map;
  }, [alerts]);

  // Selected Journey (default to active in-progress journey)
  const selectedJourney = useMemo(() => {
    if (!journeys || journeys.length === 0) return null;
    if (selectedJourneyId) {
      const found = journeys.find((j) => j.name === selectedJourneyId);
      if (found) return found;
    }
    // Prefer journey in mid-steps (e.g. step 7 or active)
    const inProgress = journeys.find(
      (j) => j.status === "Active" && j.current_step && !j.current_step.startsWith("13"),
    );
    return inProgress || journeys[0];
  }, [journeys, selectedJourneyId]);

  const currentShipment = useMemo(() => {
    if (!selectedJourney) return null;
    return (
      shipmentMap.get(selectedJourney.name) ||
      (selectedJourney.origin_shipment ? shipmentMap.get(selectedJourney.origin_shipment) : null)
    );
  }, [selectedJourney, shipmentMap]);

  const currentAlert = useMemo(() => {
    if (!selectedJourney) return null;
    return alertMap.get(selectedJourney.name);
  }, [selectedJourney, alertMap]);

  // Numeric step index (1-13)
  const currentStepNum = useMemo(() => {
    if (!selectedJourney?.current_step) return 1;
    const match = selectedJourney.current_step.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : 1;
  }, [selectedJourney]);

  const fillWidthPercent = useMemo(() => {
    if (currentStepNum <= 1) return 0;
    return Math.min(100, Math.max(0, ((currentStepNum - 1) / 12) * 100));
  }, [currentStepNum]);

  if (journeysLoading) {
    return (
      <section id="thread">
        <div className="section-head">
          <div>
            <div className="section-title">Golden Thread tracker</div>
            <div className="section-note">
              One journey_ref, thirteen enforced steps — loading active journeys…
            </div>
          </div>
        </div>
        <div className="panel thread-panel animate-pulse opacity-60" style={{ height: 260 }} />
      </section>
    );
  }

  if (!selectedJourney) {
    return (
      <section id="thread">
        <div className="section-head">
          <div>
            <div className="section-title">Golden Thread tracker</div>
            <div className="section-note">
              One journey_ref, thirteen enforced steps — every arrow below is a system-checked gate.
            </div>
          </div>
        </div>
        <div className="panel thread-panel p-8 text-center text-gray-400">
          No active Journey records found in the database.
        </div>
      </section>
    );
  }

  const vesselDisplay = currentShipment?.vessel_name || "MT Marine Vessel";
  const productDisplay = selectedJourney.product || currentShipment?.product || "AGO";
  const routeDisplay = currentShipment?.terminal
    ? `${currentShipment.terminal} → Nairobi Terminal`
    : "Mombasa → Nairobi";
  const quantityDisplay = currentShipment?.planned_quantity_kl
    ? `${currentShipment.planned_quantity_kl.toLocaleString()} KL`
    : "8,400 KL";
  const customerDisplay =
    selectedJourney.customer || currentShipment?.supplier || "Commercial Partner";

  return (
    <section id="thread">
      <div className="section-head">
        <div>
          <div className="section-title">Golden Thread tracker</div>
          <div className="section-note">
            One journey_ref, thirteen enforced steps — every arrow below is a
            system-checked gate, not a convention.
          </div>
        </div>

        {/* Journey Switcher Dropdown */}
        {journeys && journeys.length > 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "11px", color: "var(--text-faint)", fontFamily: "'IBM Plex Mono', monospace" }}>
              SWITCH JOURNEY:
            </span>
            <select
              value={selectedJourney.name}
              onChange={(e) => setSelectedJourneyId(e.target.value)}
              style={{
                background: "var(--panel-2)",
                color: "var(--flow)",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius)",
                padding: "6px 12px",
                fontSize: "12px",
                fontFamily: "'IBM Plex Mono', monospace",
                cursor: "pointer",
                outline: "none",
              }}
            >
              {journeys.map((j) => (
                <option key={j.name} value={j.name}>
                  {j.name} ({j.current_step || j.status})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="panel thread-panel">
        <div className="thread-top">
          <div>
            <div className="thread-id">
              {selectedJourney.name} &nbsp;·&nbsp; {vesselDisplay} &nbsp;·&nbsp; {productDisplay}
            </div>
          </div>
          <div className="thread-meta">
            <div>
              ROUTE<b>{routeDisplay}</b>
            </div>
            <div>
              QUANTITY<b>{quantityDisplay}</b>
            </div>
            <div>
              CUSTOMER<b>{customerDisplay}</b>
            </div>
            <div>
              CURRENT STEP<b style={{ color: "var(--amber)" }}>{selectedJourney.current_step || "1. Shipment"}</b>
            </div>
          </div>
        </div>

        <div className="flow-track">
          <div className="flow-line" />
          <div className="flow-line-fill" style={{ width: `${fillWidthPercent}%` }} />
          <div className="flow-steps">
            {STEP_DEFINITIONS.map((step, idx) => {
              const stepIndex = idx + 1;
              let stepClass = "fstep pending";
              if (stepIndex < currentStepNum) {
                stepClass = "fstep done";
              } else if (stepIndex === currentStepNum) {
                stepClass = "fstep active";
              }

              return (
                <div key={step.num} className={stepClass}>
                  <div className="fnode" />
                  <span className="fnum">{step.num}</span>
                  <span className="flabel">{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="thread-foot">
          <div className="thread-foot-note">
            {currentAlert ? (
              <>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ color: "var(--crimson)", width: 14, height: 14 }}
                >
                  <path d="M12 9v4M12 17h.01M10.3 3.9L2.7 18a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
                </svg>
                <span style={{ color: "var(--amber)" }}>
                  <b>AI Alert ({currentAlert.severity}):</b> {currentAlert.description || currentAlert.parameter_breached}
                </span>
              </>
            ) : (
              <>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ color: "var(--flow)", width: 14, height: 14 }}
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span>All pipeline telemetry, gate checks, and mass balances nominal for this journey.</span>
              </>
            )}
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn-ghost btn">View journey_ref log</button>
            <button className="btn">
              {currentAlert ? "Acknowledge Alert" : "Open Step Details"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ThreadTracker;

