import Chart from "chart.js/auto";
import React, { useEffect, useRef } from "react";

export const AISection: React.FC = () => {
  const reconChartRef = useRef<Chart | null>(null);
  const lossDonutRef = useRef<Chart | null>(null);

  useEffect(() => {
    const reconCanvas = document.getElementById(
      "reconChart",
    ) as HTMLCanvasElement;
    if (reconCanvas) {
      if (reconChartRef.current) reconChartRef.current.destroy();

      reconChartRef.current = new Chart(reconCanvas, {
        data: {
          labels: ["JNY-034", "JNY-036", "JNY-038", "JNY-040", "JNY-042"],
          datasets: [
            {
              type: "bar",
              label: "Variance %",
              data: [0.22, 0.35, 0.51, 0.28, 0.31],
              backgroundColor: "#33C9B7",
              borderRadius: 2,
              barThickness: 22,
            },
            {
              type: "line",
              label: "Tolerance",
              data: [0.42, 0.42, 0.42, 0.42, 0.42],
              borderColor: "#F0A83C",
              borderDash: [4, 4],
              pointRadius: 0,
              borderWidth: 1.6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: "#8AA0C0",
                font: { family: "Inter", size: 10.5 },
                boxWidth: 10,
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                color: "#5A6D8C",
                font: { family: "IBM Plex Mono", size: 10 },
              },
            },
            y: {
              grid: { color: "#1A2540" },
              ticks: {
                color: "#5A6D8C",
                font: { family: "IBM Plex Mono", size: 10 },
                callback: (v) => v + "%",
              },
            },
          },
        },
      });
    }

    const donutCanvas = document.getElementById(
      "lossDonut",
    ) as HTMLCanvasElement;
    if (donutCanvas) {
      if (lossDonutRef.current) lossDonutRef.current.destroy();

      lossDonutRef.current = new Chart(donutCanvas, {
        type: "doughnut",
        data: {
          labels: [
            "Measurement tolerance",
            "Evaporation",
            "Theft / unexplained",
          ],
          datasets: [
            {
              data: [54, 31, 15],
              backgroundColor: ["#33C9B7", "#F0A83C", "#E5555C"],
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "68%",
          plugins: { legend: { display: false }, tooltip: { enabled: true } },
        },
      });
    }

    return () => {
      reconChartRef.current?.destroy();
      lossDonutRef.current?.destroy();
    };
  }, []);

  return (
    <section id="ai">
      <div className="section-head">
        <div>
          <div className="section-title">
            Predictive maintenance &amp; reconciliation
          </div>
          <div className="section-note">
            Deterministic anomaly scoring against a documented safe envelope —
            no recommendation executes without human approval.
          </div>
        </div>
      </div>
      <div className="grid-2">
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M13 2L3 14h7l-1 8 10-12h-7z" />
              </svg>
              AI alerts &amp; recommendations
            </div>
            <span className="panel-tag">3 open</span>
          </div>
          <div>
            <div className="alert-item">
              <div className="alert-ico high">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 9v4M12 17h.01M10.3 3.9L2.7 18a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
                </svg>
              </div>
              <div className="alert-body">
                <div className="alert-top">
                  <span className="alert-title">
                    Overpressure — Movement MV-0091
                  </span>
                  <span className="alert-time">2m ago</span>
                </div>
                <div className="alert-desc">
                  Pressure 18.4 bar against a 15.0 bar envelope on the
                  Mombasa–Nairobi line. AI Prediction: 72% failure risk within
                  48h.
                </div>
                <div className="risk-bar-wrap">
                  <div className="risk-bar">
                    <i style={{ width: "72%", background: "var(--crimson)" }} />
                  </div>
                  <span className="risk-label">72% risk</span>
                </div>
              </div>
              <span className="chip pending">PENDING</span>
            </div>

            <div className="alert-item">
              <div className="alert-ico med">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v5M12 16h.01" />
                </svg>
              </div>
              <div className="alert-body">
                <div className="alert-top">
                  <span className="alert-title">
                    Vibration drift — Pump Station KP2
                  </span>
                  <span className="alert-time">41m ago</span>
                </div>
                <div className="alert-desc">
                  Vibration reading 6.1 mm/s trending upward. Maintenance Work
                  Order drafted, awaiting Approve/Reject.
                </div>
                <div className="risk-bar-wrap">
                  <div className="risk-bar">
                    <i style={{ width: "38%", background: "var(--amber)" }} />
                  </div>
                  <span className="risk-label">38% risk</span>
                </div>
              </div>
              <span className="chip pending">PENDING</span>
            </div>

            <div className="alert-item">
              <div className="alert-ico med">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 12h16M4 6h16M4 18h16" />
                </svg>
              </div>
              <div className="alert-body">
                <div className="alert-top">
                  <span className="alert-title">
                    Flow anomaly — OT Telemetry ingest
                  </span>
                  <span className="alert-time">3h ago</span>
                </div>
                <div className="alert-desc">
                  Flow rate breach on secure SCADA ingest channel OT-114.
                  Resolved after valve recalibration.
                </div>
                <div className="risk-bar-wrap">
                  <div className="risk-bar">
                    <i style={{ width: "100%", background: "var(--flow)" }} />
                  </div>
                  <span className="risk-label">Approved</span>
                </div>
              </div>
              <span className="chip approved">APPROVED</span>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M3 3v18h18" />
                <path d="M7 15l3-4 3 3 5-7" />
              </svg>
              Reconciliation variance
            </div>
            <span className="panel-tag">tolerance 0.42%</span>
          </div>
          <div className="chart-box short">
            <canvas id="reconChart" />
          </div>
          <div
            style={{
              display: "flex",
              gap: "18px",
              padding: "0 18px 18px",
              alignItems: "center",
            }}
          >
            <div style={{ width: "110px", height: "110px", flexShrink: 0 }}>
              <canvas id="lossDonut" />
            </div>
            <div className="donut-legend" style={{ flex: 1 }}>
              <div className="li">
                <span className="sw" style={{ background: "var(--flow)" }} />
                Measurement tolerance<b>54%</b>
              </div>
              <div className="li">
                <span className="sw" style={{ background: "var(--amber)" }} />
                Evaporation<b>31%</b>
              </div>
              <div className="li">
                <span className="sw" style={{ background: "var(--crimson)" }} />
                Theft / unexplained<b>15%</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
