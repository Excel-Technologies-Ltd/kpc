import { useFrappeGetDocList } from "frappe-react-sdk";
import React, { useMemo } from "react";

interface OilTankDoc {
  name: string;
  tank_name?: string;
  tank_code?: string;
  terminal?: string;
  product?: string;
  current_state?: "Active" | "Maintenance" | "Quarantine" | "Decommissioned" | string;
  capacity_kl?: number;
  safe_fill_capacity_kl?: number;
  reference_height_mm?: number;
}

interface TankMeasurementDoc {
  name: string;
  tank: string;
  observed_level_mm?: number;
  observed_temperature_c?: number;
  net_standard_volume_kl?: number;
  measurement_datetime?: string;
}

export const TankFarmSection: React.FC = () => {
  const { data: tanks, isLoading: tanksLoading } = useFrappeGetDocList<OilTankDoc>(
    "Oil Tank",
    {
      fields: [
        "name",
        "tank_name",
        "tank_code",
        "terminal",
        "product",
        "current_state",
        "capacity_kl",
        "safe_fill_capacity_kl",
        "reference_height_mm",
      ],
      limit: 100,
    },
  );

  const { data: measurements, isLoading: measurementsLoading } = useFrappeGetDocList<TankMeasurementDoc>(
    "Tank Measurement",
    {
      fields: [
        "name",
        "tank",
        "observed_level_mm",
        "observed_temperature_c",
        "net_standard_volume_kl",
        "measurement_datetime",
      ],
      orderBy: {
        field: "measurement_datetime",
        order: "desc",
      },
      limit: 500,
    },
  );

  // Map each tank to its latest measurement
  const latestMeasurementMap = useMemo(() => {
    const map = new Map<string, TankMeasurementDoc>();
    if (measurements) {
      for (const m of measurements) {
        if (m.tank && !map.has(m.tank)) {
          map.set(m.tank, m);
        }
      }
    }
    return map;
  }, [measurements]);

  const isLoading = tanksLoading || measurementsLoading;

  return (
    <section id="tanks">
      <div className="section-head">
        <div>
          <div className="section-title">Tank farm</div>
          <div className="section-note">
            Live fill levels across Mombasa and Nairobi. A tank under
            Maintenance or Quarantine blocks any new measurement.
          </div>
        </div>
      </div>

      <div className="grid-4">
        {isLoading ? (
          // Loading skeleton cards
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="panel tank-card animate-pulse opacity-60">
              <div className="tank-svg-wrap">
                <div style={{ width: 56, height: 96, background: "rgba(35, 50, 82, 0.4)", borderRadius: 6 }} />
              </div>
              <div className="tank-info" style={{ width: "100%" }}>
                <div style={{ height: 14, background: "rgba(255,255,255,0.1)", borderRadius: 4, width: "60%", marginBottom: 8 }} />
                <div style={{ height: 10, background: "rgba(255,255,255,0.06)", borderRadius: 4, width: "40%", marginBottom: 12 }} />
                <div style={{ height: 24, background: "rgba(255,255,255,0.08)", borderRadius: 4, width: "80%" }} />
              </div>
            </div>
          ))
        ) : !tanks || tanks.length === 0 ? (
          <div className="panel col-span-4 p-8 text-center text-gray-400">
            No tank records found in the system.
          </div>
        ) : (
          tanks.map((tank) => {
            const measurement = latestMeasurementMap.get(tank.name);
            const state = tank.current_state || "Active";

            // Calculate level percentage
            let levelPercent = 0;
            if (measurement) {
              if (tank.reference_height_mm && measurement.observed_level_mm) {
                levelPercent = Math.min(100, Math.max(0, Math.round((measurement.observed_level_mm / tank.reference_height_mm) * 100)));
              } else if (tank.capacity_kl && measurement.net_standard_volume_kl) {
                levelPercent = Math.min(100, Math.max(0, Math.round((measurement.net_standard_volume_kl / tank.capacity_kl) * 100)));
              }
            }

            const tempDisplay =
              measurement?.observed_temperature_c !== undefined
                ? `${measurement.observed_temperature_c.toFixed(1)}°C`
                : "—";

            // State badge & theme
            let badgeClass = "badge";
            let stateColor = "#33C9B7"; // cyan for Active
            let stateLabel = state;

            if (state.toLowerCase() === "active") {
              badgeClass = "badge active";
              stateColor = "#33C9B7";
            } else if (state.toLowerCase().includes("maint")) {
              badgeClass = "badge maint";
              stateColor = "#F0A83C";
              stateLabel = "Maintenance";
            } else if (state.toLowerCase().includes("quarant")) {
              badgeClass = "badge quarantine";
              stateColor = "#E5555C";
              stateLabel = "Quarantined";
            } else {
              badgeClass = "badge";
              stateColor = "#5A6D8C";
            }

            const fillHeight = Math.max(0, Math.round((levelPercent / 100) * 88));
            const fillY = 4 + (88 - fillHeight);
            const clipId = `clip-${tank.name.replace(/[^a-zA-Z0-9-_]/g, "")}`;

            return (
              <div key={tank.name} className="panel tank-card">
                <div className="tank-svg-wrap">
                  <svg viewBox="0 0 56 96" width="56" height="96">
                    <rect
                      x="4"
                      y="4"
                      width="48"
                      height="88"
                      rx="6"
                      fill="none"
                      stroke="#233252"
                      strokeWidth="2"
                    />
                    <clipPath id={clipId}>
                      <rect x="4" y="4" width="48" height="88" rx="6" />
                    </clipPath>
                    {fillHeight > 0 && (
                      <rect
                        x="4"
                        y={fillY}
                        width="48"
                        height={fillHeight}
                        fill={stateColor}
                        opacity="0.85"
                        clipPath={`url(#${clipId})`}
                      />
                    )}
                  </svg>
                </div>
                <div className="tank-info">
                  <div className="tank-name" title={tank.tank_name || tank.name}>
                    {tank.tank_name || tank.name}
                  </div>
                  <div className="tank-terminal">
                    {tank.terminal || "Terminal"} · {tank.product || "All Products"}
                  </div>
                  <div className="tank-stats">
                    <div>
                      LEVEL<b>{levelPercent}%</b>
                    </div>
                    <div>
                      TEMP<b>{tempDisplay}</b>
                    </div>
                  </div>
                  <span className={badgeClass}>
                    <span className="bdot" />
                    {stateLabel}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default TankFarmSection;

