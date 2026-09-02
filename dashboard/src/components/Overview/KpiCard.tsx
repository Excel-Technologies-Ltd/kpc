import Chart from "chart.js/auto";
import React, { useEffect, useRef, useState } from "react";

export interface KpiCardProps {
  label: string;
  value: string | number;
  unit?: string;
  delta: string;
  deltaType?: "up" | "down" | "flat" | "warn";
  sparklineData?: number[];
  icon?: React.ReactNode;
  variant?: "cyan" | "blue" | "violet" | "amber" | "crimson" | "gold";
  className?: string;
}

const VARIANTS = {
  cyan: {
    gradient: "linear-gradient(145deg, #0d4a5c 0%, #0a3040 50%, #071d2a 100%)",
    glow: "0 20px 50px -8px rgba(51,201,183,0.45), 0 8px 20px rgba(0,0,0,0.55)",
    glowHover: "0 30px 64px -8px rgba(51,201,183,0.65), 0 10px 28px rgba(0,0,0,0.65)",
    borderGradient: (h: boolean) =>
      h ? "linear-gradient(135deg, #33C9B7 0%, #33C9B7aa 40%, #33C9B720 65%, transparent 100%)"
        : "linear-gradient(135deg, #33C9B7bb 0%, #33C9B750 40%, transparent 65%, transparent 100%)",
    iconColor: "#33C9B7",
    iconGlow: "rgba(51,201,183,0.5)",
    valColor: "#ffffff",
    sparkColor: "#33C9B7",
    shimmer: "rgba(51,201,183,0.08)",
  },
  blue: {
    gradient: "linear-gradient(145deg, #0d2e6e 0%, #0a1e4a 50%, #060e28 100%)",
    glow: "0 20px 50px -8px rgba(60,120,255,0.5), 0 8px 20px rgba(0,0,0,0.55)",
    glowHover: "0 30px 64px -8px rgba(60,120,255,0.7), 0 10px 28px rgba(0,0,0,0.65)",
    borderGradient: (h: boolean) =>
      h ? "linear-gradient(135deg, #5588ff 0%, #5588ffaa 40%, #5588ff20 65%, transparent 100%)"
        : "linear-gradient(135deg, #5588ffbb 0%, #5588ff50 40%, transparent 65%, transparent 100%)",
    iconColor: "#6699ff",
    iconGlow: "rgba(60,120,255,0.6)",
    valColor: "#ffffff",
    sparkColor: "#5588ff",
    shimmer: "rgba(60,120,255,0.08)",
  },
  violet: {
    gradient: "linear-gradient(145deg, #2e1080 0%, #1e0860 50%, #100438 100%)",
    glow: "0 20px 50px -8px rgba(130,100,255,0.55), 0 8px 20px rgba(0,0,0,0.55)",
    glowHover: "0 30px 64px -8px rgba(130,100,255,0.7), 0 10px 28px rgba(0,0,0,0.65)",
    borderGradient: (h: boolean) =>
      h ? "linear-gradient(135deg, #9b7aff 0%, #9b7affaa 40%, #9b7aff20 65%, transparent 100%)"
        : "linear-gradient(135deg, #9b7affbb 0%, #9b7aff50 40%, transparent 65%, transparent 100%)",
    iconColor: "#b08fff",
    iconGlow: "rgba(130,100,255,0.6)",
    valColor: "#ffffff",
    sparkColor: "#9b7aff",
    shimmer: "rgba(130,100,255,0.1)",
  },
  amber: {
    gradient: "linear-gradient(145deg, #4a2800 0%, #301a00 50%, #1a0e00 100%)",
    glow: "0 20px 50px -8px rgba(240,168,60,0.4), 0 8px 20px rgba(0,0,0,0.55)",
    glowHover: "0 30px 64px -8px rgba(240,168,60,0.6), 0 10px 28px rgba(0,0,0,0.65)",
    borderGradient: (h: boolean) =>
      h ? "linear-gradient(135deg, #F0A83C 0%, #F0A83Caa 40%, #F0A83C20 65%, transparent 100%)"
        : "linear-gradient(135deg, #F0A83Cbb 0%, #F0A83C50 40%, transparent 65%, transparent 100%)",
    iconColor: "#F0A83C",
    iconGlow: "rgba(240,168,60,0.5)",
    valColor: "#F0A83C",
    sparkColor: "#F0A83C",
    shimmer: "rgba(240,168,60,0.08)",
  },
  crimson: {
    gradient: "linear-gradient(145deg, #4a0c0c 0%, #300808 50%, #1a0404 100%)",
    glow: "0 20px 50px -8px rgba(229,85,92,0.4), 0 8px 20px rgba(0,0,0,0.55)",
    glowHover: "0 30px 64px -8px rgba(229,85,92,0.6), 0 10px 28px rgba(0,0,0,0.65)",
    borderGradient: (h: boolean) =>
      h ? "linear-gradient(135deg, #E5555C 0%, #E5555Caa 40%, #E5555C20 65%, transparent 100%)"
        : "linear-gradient(135deg, #E5555Cbb 0%, #E5555C50 40%, transparent 65%, transparent 100%)",
    iconColor: "#E5555C",
    iconGlow: "rgba(229,85,92,0.5)",
    valColor: "#E5555C",
    sparkColor: "#E5555C",
    shimmer: "rgba(229,85,92,0.08)",
  },
  gold: {
    gradient: "linear-gradient(145deg, #3a2000 0%, #261500 50%, #130b00 100%)",
    glow: "0 20px 50px -8px rgba(217,179,108,0.4), 0 8px 20px rgba(0,0,0,0.55)",
    glowHover: "0 30px 64px -8px rgba(217,179,108,0.6), 0 10px 28px rgba(0,0,0,0.65)",
    borderGradient: (h: boolean) =>
      h ? "linear-gradient(135deg, #D9B36C 0%, #D9B36Caa 40%, #D9B36C20 65%, transparent 100%)"
        : "linear-gradient(135deg, #D9B36Cbb 0%, #D9B36C50 40%, transparent 65%, transparent 100%)",
    iconColor: "#D9B36C",
    iconGlow: "rgba(217,179,108,0.5)",
    valColor: "#D9B36C",
    sparkColor: "#D9B36C",
    shimmer: "rgba(217,179,108,0.08)",
  },
};

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  unit,
  delta,
  deltaType = "up",
  sparklineData,
  icon,
  variant = "cyan",
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const [hovered, setHovered] = useState(false);

  const theme = VARIANTS[variant];

  useEffect(() => {
    if (!canvasRef.current || !sparklineData || sparklineData.length === 0) return;
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    chartInstanceRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels: sparklineData.map((_, i) => i),
        datasets: [
          {
            data: sparklineData,
            borderColor: theme.sparkColor,
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.4,
            fill: true,
            backgroundColor: `${theme.sparkColor}20`,
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

    return () => chartInstanceRef.current?.destroy();
  }, [sparklineData, theme.sparkColor]);

  const deltaColor =
    deltaType === "up" ? "#33C9B7"
    : deltaType === "down" ? "#E5555C"
    : deltaType === "warn" ? "#F0A83C"
    : "#5A6D8C";

  return (
    <div
      className={`kpi-float ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "1.5px",
        borderRadius: "20px",
        background: theme.borderGradient(hovered),
        boxShadow: hovered ? theme.glowHover : theme.glow,
        transition: "box-shadow 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94), background 0.35s ease",
        cursor: "pointer",
        position: "relative",
      }}
    >
      <div
        style={{
          background: theme.gradient,
          borderRadius: "19px",
          padding: "20px 20px 22px",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          minHeight: "168px",
          overflow: "visible",
        }}
      >
        {/* Top-left shimmer highlight (glass reflection) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "19px",
            background: `radial-gradient(ellipse at 20% 10%, ${theme.shimmer} 0%, transparent 55%)`,
            pointerEvents: "none",
          }}
        />

        {/* Large floating 3D icon — top right, overflows card */}
        {icon && (
          <div
            style={{
              position: "absolute",
              top: "-14px",
              right: "14px",
              width: "80px",
              height: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme.iconColor,
              filter: hovered
                ? `drop-shadow(0 0 18px ${theme.iconGlow}) drop-shadow(0 8px 16px rgba(0,0,0,0.6))`
                : `drop-shadow(0 6px 14px rgba(0,0,0,0.5)) drop-shadow(0 0 8px ${theme.iconGlow})`,
              transition: "filter 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          >
            {icon}
          </div>
        )}

        {/* Sparkline (no icon mode) */}
        {sparklineData && !icon && (
          <div
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              width: "72px",
              height: "40px",
              opacity: 0.85,
            }}
          >
            <canvas ref={canvasRef} width={72} height={40} />
          </div>
        )}

        {/* Bottom content: value + label + delta */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "32px",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1,
              color: theme.valColor,
              textShadow: hovered ? `0 0 24px ${theme.iconGlow}` : "none",
              transition: "text-shadow 0.35s ease",
            }}
          >
            {value}
            {unit && (
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.45)",
                  marginLeft: "5px",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {unit}
              </span>
            )}
          </div>

          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "12px",
              fontWeight: 500,
              color: "rgba(255,255,255,0.5)",
              marginTop: "6px",
              letterSpacing: "0.015em",
            }}
          >
            {label}
          </div>

          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "10.5px",
              fontWeight: 600,
              color: deltaColor,
              marginTop: "5px",
              letterSpacing: "0.01em",
            }}
          >
            {delta}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KpiCard;
