import Chart from "chart.js/auto";
import React, { useEffect, useRef } from "react";

export const CommercialSection: React.FC = () => {
  const funnelRef = useRef<Chart | null>(null);
  const revenueRef = useRef<Chart | null>(null);
  const creditRef = useRef<Chart | null>(null);

  useEffect(() => {
    const funnelCanvas = document.getElementById(
      "funnelChart",
    ) as HTMLCanvasElement;
    if (funnelCanvas) {
      if (funnelRef.current) funnelRef.current.destroy();

      funnelRef.current = new Chart(funnelCanvas, {
        type: "bar",
        data: {
          labels: [
            "Submitted",
            "Credit + stock OK",
            "Batched",
            "Dispatched",
            "Invoiced",
          ],
          datasets: [
            {
              data: [46, 41, 37, 33, 30],
              backgroundColor: "#33C9B7",
              borderRadius: 2,
            },
          ],
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              grid: { color: "#1A2540" },
              ticks: { color: "#5A6D8C" },
            },
            y: {
              grid: { display: false },
              ticks: { color: "#8AA0C0", font: { family: "Inter", size: 11 } },
            },
          },
        },
      });
    }

    const revenueCanvas = document.getElementById(
      "revenueChart",
    ) as HTMLCanvasElement;
    if (revenueCanvas) {
      if (revenueRef.current) revenueRef.current.destroy();

      revenueRef.current = new Chart(revenueCanvas, {
        type: "line",
        data: {
          labels: ["Mar", "Apr", "May", "Jun", "Jul", "Aug"],
          datasets: [
            {
              data: [420, 455, 470, 510, 560, 618],
              borderColor: "#D9B36C",
              backgroundColor: "rgba(217,179,108,0.12)",
              fill: true,
              tension: 0.35,
              pointRadius: 3,
              pointBackgroundColor: "#D9B36C",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: "#5A6D8C" } },
            y: { grid: { color: "#1A2540" }, ticks: { color: "#5A6D8C" } },
          },
        },
      });
    }

    const creditCanvas = document.getElementById(
      "creditChart",
    ) as HTMLCanvasElement;
    if (creditCanvas) {
      if (creditRef.current) creditRef.current.destroy();

      creditRef.current = new Chart(creditCanvas, {
        type: "bar",
        data: {
          labels: [
            "Vivo Energy",
            "TotalEnergies",
            "Rubis",
            "Ola Energy",
            "Astrol",
          ],
          datasets: [
            {
              data: [82, 64, 49, 37, 22],
              backgroundColor: [
                "#E5555C",
                "#F0A83C",
                "#F0A83C",
                "#33C9B7",
                "#33C9B7",
              ],
              borderRadius: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: "#8AA0C0", font: { family: "Inter", size: 10 } },
            },
            y: {
              grid: { color: "#1A2540" },
              ticks: { color: "#5A6D8C", callback: (v) => v + "%" },
            },
          },
        },
      });
    }

    return () => {
      funnelRef.current?.destroy();
      revenueRef.current?.destroy();
      creditRef.current?.destroy();
    };
  }, []);

  return (
    <section id="commercial">
      <div className="section-head">
        <div>
          <div className="section-title">Commercial &amp; finance</div>
          <div className="section-note">
            From accepted Nomination through to Sales Invoice and GL posting,
            every figure carries its journey_ref.
          </div>
        </div>
      </div>
      <div className="grid-3">
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Nomination funnel</div>
          </div>
          <div className="chart-box short">
            <canvas id="funnelChart" />
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Revenue invoiced (KES M)</div>
          </div>
          <div className="chart-box short">
            <canvas id="revenueChart" />
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Credit exposure by customer</div>
          </div>
          <div className="chart-box short">
            <canvas id="creditChart" />
          </div>
        </div>
      </div>
    </section>
  );
};
