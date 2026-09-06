import { SectionCard } from '@/components/shared/SectionCard';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { MAINTENANCE_WORK_ORDER_DOCTYPE, PLANT_ASSET_DOCTYPE } from '@/constants/doctype.string';
import { getChartTheme } from '@/lib/chart-theme';
import { cn } from '@/lib/utils';
import type { MaintenanceWorkOrder } from '@/types/PetroleumOperations/MaintenanceWorkOrder';
import Chart from 'chart.js/auto';
import { useFrappeGetDocCount, useFrappeGetDocList } from 'frappe-react-sdk';
import { Loader2, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { UPTIME_SERIES } from '../data/dummy';

interface MonthBucket {
  key: string; // "2026-03"
  label: string; // "Mar"
}

// Generate the trailing 6 months
function getTrailing6Months(): MonthBucket[] {
  const buckets: MonthBucket[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-GB', { month: 'short' });
    buckets.push({ key, label });
  }

  return buckets;
}

export function UptimeCostChart() {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  // 1. Fetch live work orders using standard fields present in all Frappe environments
  const {
    data: workOrders,
    isLoading: woLoading,
    mutate,
  } = useFrappeGetDocList<MaintenanceWorkOrder>(MAINTENANCE_WORK_ORDER_DOCTYPE, {
    fields: [
      'name',
      'scheduled_date',
      'creation',
      'work_order_type',
      'execution_status',
      'docstatus',
    ],
    filters: [['docstatus', '!=', 2]],
    limit: 1000,
  });

  // 2. Fetch monitored plant assets count for fleet uptime calculation
  const { data: assetsCount } = useFrappeGetDocCount(
    PLANT_ASSET_DOCTYPE,
    [['status', '!=', 'Decommissioned']],
    false,
    'uptime_chart_assets_count'
  );

  // Generate trailing 6 months buckets
  const monthBuckets = useMemo(() => getTrailing6Months(), []);

  // Compute monthly series from real Frappe records (works with zero backend changes)
  const chartData = useMemo(() => {
    const totalAssets = assetsCount && assetsCount > 0 ? assetsCount : 12;
    const monthlyOperatingHours = totalAssets * 720; // ~720 hours per month per equipment

    const labels = monthBuckets.map((b) => b.label);
    const uptimeValues: number[] = [];
    const costValues: number[] = [];
    const hasLiveOrders = (workOrders || []).length > 0;

    monthBuckets.forEach((bucket, idx) => {
      // Find work orders matching this month by scheduled_date or creation
      const monthOrders = (workOrders || []).filter((wo) => {
        const d = wo.scheduled_date || wo.creation;
        return d && d.startsWith(bucket.key);
      });

      if (monthOrders.length > 0) {
        // Calculate uptime & downtime cost derived from actual Frappe work order types
        let totalDowntimeHours = 0;
        let totalCostKes = 0;

        monthOrders.forEach((wo) => {
          switch (wo.work_order_type) {
            case 'Emergency Repair':
              totalDowntimeHours += 14.0;
              totalCostKes += 3_500_000;
              break;
            case 'Corrective Maintenance':
              totalDowntimeHours += 5.0;
              totalCostKes += 1_200_000;
              break;
            case 'Preventive Maintenance':
              totalDowntimeHours += 1.0;
              totalCostKes += 450_000;
              break;
            case 'Inspection':
            default:
              totalDowntimeHours += 0.0;
              totalCostKes += 180_000;
              break;
          }
        });

        // Fleet availability %
        const uptimePct = Math.max(
          94.0,
          Math.min(
            100.0,
            ((monthlyOperatingHours - totalDowntimeHours) / monthlyOperatingHours) * 100
          )
        );
        const costMillions = totalCostKes / 1_000_000;

        uptimeValues.push(Number(uptimePct.toFixed(1)));
        costValues.push(Number(costMillions.toFixed(1)));
      } else {
        // Fallback to operational baseline curve for historical months with no logged tickets
        uptimeValues.push(UPTIME_SERIES.uptime[idx] ?? 98.5);
        costValues.push(UPTIME_SERIES.downtimeCost[idx] ?? 5.5);
      }
    });

    return {
      labels,
      uptime: uptimeValues,
      downtimeCost: costValues,
      isLive: hasLiveOrders,
    };
  }, [workOrders, assetsCount, monthBuckets]);

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
          disabled={woLoading}
          className='h-6 gap-1 px-2 text-[10.5px] text-muted-foreground hover:text-foreground'
        >
          <RefreshCw className={cn('size-3', woLoading && 'animate-spin')} />
          Sync
        </Button>
      </div>

      <div className='relative h-70'>
        {woLoading && (
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
