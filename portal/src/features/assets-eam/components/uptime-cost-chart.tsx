import { SectionCard } from '@/components/shared/SectionCard';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { getChartTheme } from '@/lib/chart-theme';
import { cn } from '@/lib/utils';
import Chart from 'chart.js/auto';
import { useFrappeGetCall } from 'frappe-react-sdk';
import { Loader2, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { UPTIME_SERIES } from '../data/dummy';

interface UptimeCostMetrics {
  labels: string[];
  uptime: number[];
  downtime_cost: number[];
  total_assets: number;
  is_live: boolean;
}

interface UptimeCostApiResponse {
  message?: UptimeCostMetrics;
  labels?: string[];
  uptime?: number[];
  downtime_cost?: number[];
  total_assets?: number;
  is_live?: boolean;
}

export function UptimeCostChart() {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  // Dedicated high-performance Frappe backend API (< 1 KB SQL aggregation)
  const {
    data: apiData,
    isLoading,
    mutate,
  } = useFrappeGetCall<UptimeCostApiResponse>(
    'kpc.petroleum_operations.api.get_uptime_and_cost_summary',
    { months: 6 }
  );

  const chartData = useMemo(() => {
    const res = (apiData?.message || apiData) as UptimeCostMetrics | undefined;
    if (res?.labels && res?.uptime && res?.downtime_cost) {
      return {
        labels: res.labels,
        uptime: res.uptime,
        downtimeCost: res.downtime_cost,
        isLive: Boolean(res.is_live),
      };
    }
    return {
      labels: UPTIME_SERIES.labels,
      uptime: UPTIME_SERIES.uptime,
      downtimeCost: UPTIME_SERIES.downtimeCost,
      isLive: false,
    };
  }, [apiData]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const chartTheme = getChartTheme();
    chartRef.current?.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: 'Uptime %',
            data: chartData.uptime,
            borderColor: chartTheme.chart1,
            backgroundColor: `${chartTheme.chart1}20`,
            fill: true,
            tension: 0.35,
            yAxisID: 'y',
            pointRadius: 3.5,
            pointBackgroundColor: chartTheme.chart1,
          },
          {
            label: 'Downtime cost (KES M)',
            data: chartData.downtimeCost,
            borderColor: chartTheme.destructive,
            backgroundColor: 'transparent',
            tension: 0.35,
            yAxisID: 'y1',
            pointRadius: 2.5,
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
            min: 94,
            max: 100,
            grid: { color: chartTheme.border },
            ticks: {
              color: chartTheme.muted,
              callback: (v) => `${v}%`,
            },
          },
          y1: {
            position: 'right',
            min: 0,
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
  }, [theme, chartData]);

  return (
    <SectionCard
      title='Uptime & downtime cost'
      tag={chartData.isLive ? '6 months · Live API' : '6 months'}
      caption='Availability against maintenance cost from Maintenance Work Order records.'
      className='h-full flex flex-col justify-between'
    >
      <div className='flex items-center justify-between pb-2'>
        <span className='text-[11px] text-muted-foreground'>
          Fleet availability vs repair/halt expenditure
        </span>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => mutate()}
          disabled={isLoading}
          className='h-6 gap-1 px-2 text-[10.5px] text-muted-foreground hover:text-foreground'
        >
          <RefreshCw className={cn('size-3', isLoading && 'animate-spin')} />
          Sync
        </Button>
      </div>

      <div className='relative h-70'>
        {isLoading && (
          <div className='absolute inset-0 z-10 flex items-center justify-center gap-2 bg-background/40 backdrop-blur-[1px] text-xs text-muted-foreground'>
            <Loader2 className='size-4 animate-spin text-primary' />
            <span>Calculating metrics...</span>
          </div>
        )}
        <canvas ref={canvasRef} />
      </div>
    </SectionCard>
  );
}
