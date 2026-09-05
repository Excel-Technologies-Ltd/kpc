import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/components/theme-provider';
import { getChartTheme } from '@/lib/chart-theme';
import Chart from 'chart.js/auto';
import { useEffect, useRef } from 'react';
import { useCommercialMetricsContext } from '../commercial-metrics-context';

const PRODUCT_COLORS = ['chart1', 'chart2', 'chart3', 'chart4', 'chart5'] as const;

export function RevenueByProductChart() {
  const { theme } = useTheme();
  const { metrics, isLoading, hasData } = useCommercialMetricsContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const chartTheme = getChartTheme();
    chartRef.current?.destroy();

    const colors = PRODUCT_COLORS.map((key) => chartTheme[key]);
    const datasets = metrics.products.map((product, i) => ({
      label: product,
      data: metrics.months.map((m) => {
        const amount = m.byProduct[product] ?? 0;
        return amount >= 1_000_000 ? amount / 1_000_000 : amount / 1_000;
      }),
      backgroundColor: colors[i % colors.length],
      borderRadius: 4,
      stack: 's',
    }));

    const useMillions = metrics.months.some((m) =>
      Object.values(m.byProduct).some((v) => v >= 1_000_000)
    );

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: metrics.months.map((m) => m.label),
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: chartTheme.foreground,
              boxWidth: 10,
              font: { size: 11 },
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const v = ctx.parsed.y ?? 0;
                return `${ctx.dataset.label}: ${v.toFixed(2)}${useMillions ? 'M' : 'k'} KES`;
              },
            },
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
            ticks: {
              color: chartTheme.muted,
              callback: (v) => `${v}${useMillions ? 'M' : 'k'}`,
            },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [theme, metrics]);

  const empty = !isLoading && (!hasData || metrics.products.length === 0);

  return (
    <Card className='border-border/80 from-card via-emerald-50/30 to-teal-50/20 bg-linear-to-br dark:via-emerald-950/20 dark:to-teal-950/15'>
      <CardHeader className='pb-2'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <CardTitle className='text-[15px] font-semibold tracking-tight'>
            Revenue by product
          </CardTitle>
          <span className='text-muted-foreground rounded-full border px-2.5 py-0.5 text-[11px] font-medium'>
            KES · 6 months
          </span>
        </div>
        <p className='text-muted-foreground text-[11px]'>
          Invoice totals attributed to products via journey allocations.
        </p>
      </CardHeader>
      <CardContent>
        <div className='relative h-65'>
          {empty ? (
            <div className='text-muted-foreground absolute inset-0 flex items-center justify-center text-sm'>
              No invoice line revenue yet.
            </div>
          ) : (
            <canvas ref={canvasRef} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
