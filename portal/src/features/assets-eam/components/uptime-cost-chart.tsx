import { SectionCard } from '@/components/shared/SectionCard';
import { useTheme } from '@/components/theme-provider';
import { getChartTheme } from '@/lib/chart-theme';
import Chart from 'chart.js/auto';
import { useEffect, useRef } from 'react';
import { UPTIME_SERIES } from '../data/dummy';

export function UptimeCostChart() {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const chartTheme = getChartTheme();
    chartRef.current?.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: UPTIME_SERIES.labels,
        datasets: [
          {
            label: 'Uptime %',
            data: UPTIME_SERIES.uptime,
            borderColor: chartTheme.chart1,
            backgroundColor: `${chartTheme.chart1}20`,
            fill: true,
            tension: 0.35,
            yAxisID: 'y',
            pointRadius: 3,
            pointBackgroundColor: chartTheme.chart1,
          },
          {
            label: 'Downtime cost (KES M)',
            data: UPTIME_SERIES.downtimeCost,
            borderColor: chartTheme.destructive,
            backgroundColor: 'transparent',
            tension: 0.35,
            yAxisID: 'y1',
            pointRadius: 2,
            borderDash: [5, 4],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: chartTheme.foreground, boxWidth: 10, font: { size: 11 } },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: chartTheme.muted },
          },
          y: {
            position: 'left',
            min: 96,
            max: 100,
            grid: { color: chartTheme.border },
            ticks: {
              color: chartTheme.muted,
              callback: (v) => `${v}%`,
            },
          },
          y1: {
            position: 'right',
            grid: { display: false },
            ticks: {
              color: chartTheme.muted,
              callback: (v) => `${v}M`,
            },
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
      title='Uptime & downtime cost'
      tag='6 months'
      caption='Availability against the cost of downtime, so a dip has a number attached.'
    >
      <div className='h-70'>
        <canvas ref={canvasRef} />
      </div>
    </SectionCard>
  );
}
