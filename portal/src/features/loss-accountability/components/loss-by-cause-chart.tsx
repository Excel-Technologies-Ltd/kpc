import { SectionCard } from '@/components/shared/SectionCard';
import { useTheme } from '@/components/theme-provider';
import { getChartTheme } from '@/lib/chart-theme';
import Chart from 'chart.js/auto';
import { useEffect, useRef } from 'react';
import { LOSS_BY_CAUSE } from '../data/dummy';

export function LossByCauseChart() {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const chartTheme = getChartTheme();
    chartRef.current?.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: LOSS_BY_CAUSE.labels,
        datasets: [
          {
            data: LOSS_BY_CAUSE.values,
            backgroundColor: LOSS_BY_CAUSE.colors,
            borderRadius: 7,
            barPercentage: 0.62,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: (c) => `${c.parsed.x} m³` },
          },
        },
        scales: {
          x: {
            grid: { color: chartTheme.border },
            ticks: {
              color: chartTheme.muted,
              callback: (v) => `${v}m³`,
            },
          },
          y: {
            grid: { display: false },
            ticks: { color: chartTheme.foreground, font: { size: 11 } },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [theme]);

  return (
    <SectionCard
      title='Loss by cause'
      tag='m³, MTD'
      caption='Splits genuine operational loss from measurement error and suspected theft.'
    >
      <div className='h-65'>
        <canvas ref={canvasRef} />
      </div>
    </SectionCard>
  );
}
