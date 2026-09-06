import { SectionCard } from '@/components/shared/SectionCard';
import { useTheme } from '@/components/theme-provider';
import { getChartTheme } from '@/lib/chart-theme';
import Chart from 'chart.js/auto';
import { useEffect, useRef } from 'react';
import { INCIDENTS_BY_TYPE } from '../data/dummy';

export function IncidentsByTypeChart() {
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
        labels: INCIDENTS_BY_TYPE.labels,
        datasets: [
          {
            label: 'Low',
            data: INCIDENTS_BY_TYPE.low,
            backgroundColor: chartTheme.chart1,
            borderRadius: 4,
            stack: 's',
          },
          {
            label: 'Medium',
            data: INCIDENTS_BY_TYPE.medium,
            backgroundColor: chartTheme.chart2,
            borderRadius: 4,
            stack: 's',
          },
          {
            label: 'High',
            data: INCIDENTS_BY_TYPE.high,
            backgroundColor: chartTheme.destructive,
            borderRadius: 4,
            stack: 's',
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
            stacked: true,
            grid: { display: false },
            ticks: { color: chartTheme.muted },
          },
          y: {
            stacked: true,
            grid: { color: chartTheme.border },
            ticks: { color: chartTheme.muted, stepSize: 1 },
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
      title='Incidents by type'
      tag='6 months'
      caption='Frequency by category, split by severity so trends surface early.'
    >
      <div className='h-70'>
        <canvas ref={canvasRef} />
      </div>
    </SectionCard>
  );
}
