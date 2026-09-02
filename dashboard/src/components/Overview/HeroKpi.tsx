import Chart from "chart.js/auto";
import React, { useEffect, useRef } from "react";

export const HeroKpi: React.FC = () => {
  const chartRefs = useRef<{ [key: string]: Chart | null }>({});

  useEffect(() => {
    const sparks = [
      { id: "spark1", data: [10, 12, 11, 14, 13, 16, 18], color: "#33C9B7" },
      { id: "spark2", data: [30, 34, 31, 38, 36, 40, 42], color: "#33C9B7" },
      { id: "spark3", data: [14, 13, 12, 13, 12, 11, 11.9], color: "#8AA0C0" },
      { id: "spark4", data: [1, 2, 2, 4, 3, 4, 3], color: "#F0A83C" },
      {
        id: "spark5",
        data: [0.5, 0.44, 0.4, 0.38, 0.35, 0.33, 0.31],
        color: "#33C9B7",
      },
      { id: "spark6", data: [40, 46, 44, 52, 55, 58, 61], color: "#D9B36C" },
    ];

    sparks.forEach(({ id, data, color }) => {
      const canvas = document.getElementById(id) as HTMLCanvasElement;
      if (!canvas) return;

      if (chartRefs.current[id]) {
        chartRefs.current[id]?.destroy();
      }

      chartRefs.current[id] = new Chart(canvas, {
        type: "line",
        data: {
          labels: data.map((_, i) => i),
          datasets: [
            {
              data,
              borderColor: color,
              borderWidth: 1.6,
              pointRadius: 0,
              tension: 0.4,
              fill: true,
              backgroundColor: `${color}22`,
            },
          ],
        },
        options: {
          responsive: false,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          scales: { x: { display: false }, y: { display: false } },
          elements: { point: { radius: 0 } },
        },
      });
    });

    return () => {
      Object.values(chartRefs.current).forEach((c) => c?.destroy());
    };
  }, []);

  return (
    <section id="overview">
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
          <b>18</b> in progress · <b>4</b> awaiting approval
          <br />
          <b>2</b> flagged for reconciliation review
        </div>
      </div>

      <div className="kpi-band">
        <div className="kpi">
          <div className="kpi-label">Active journeys</div>
          <div className="kpi-val">18</div>
          <div className="kpi-delta up">▲ 3 vs last week</div>
          <canvas id="spark1" width="64" height="32" />
        </div>
        <div className="kpi">
          <div className="kpi-label">Volume received today</div>
          <div className="kpi-val">
            42,180<span className="unit">KL</span>
          </div>
          <div className="kpi-delta up">▲ 6.2%</div>
          <canvas id="spark2" width="64" height="32" />
        </div>
        <div className="kpi">
          <div className="kpi-label">In pipeline transit</div>
          <div className="kpi-val">
            11,940<span className="unit">KL</span>
          </div>
          <div className="kpi-delta flat">— steady</div>
          <canvas id="spark3" width="64" height="32" />
        </div>
        <div className="kpi warn">
          <div className="kpi-label">Open AI alerts</div>
          <div className="kpi-val">3</div>
          <div className="kpi-delta down">▼ awaiting Maintenance Manager</div>
          <canvas id="spark4" width="64" height="32" />
        </div>
        <div className="kpi">
          <div className="kpi-label">Reconciliation variance</div>
          <div className="kpi-val">
            0.31<span className="unit">%</span>
          </div>
          <div className="kpi-delta up">within 0.42% tolerance</div>
          <canvas id="spark5" width="64" height="32" />
        </div>
        <div className="kpi">
          <div className="kpi-label">Invoiced this month</div>
          <div className="kpi-val">
            618.4<span className="unit">M KES</span>
          </div>
          <div className="kpi-delta up">▲ 12.8%</div>
          <canvas id="spark6" width="64" height="32" />
        </div>
      </div>
    </section>
  );
};
