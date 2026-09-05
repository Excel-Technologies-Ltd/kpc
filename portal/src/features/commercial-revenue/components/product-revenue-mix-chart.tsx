import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/components/theme-provider';
import { getChartTheme } from '@/lib/chart-theme';
import Chart from 'chart.js/auto';
import { useEffect, useRef } from 'react';
import { useCommercialMetricsContext } from '../commercial-metrics-context';

export function ProductRevenueMixChart() {
  const { theme } = useTheme();
  const { metrics, isLoading, hasData } = useCommercialMetricsContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const chartTheme = getChartTheme();
    chartRef.current?.destroy();

    const slices = metrics.productMix;
    const colors = [
      chartTheme.chart1,
      chartTheme.chart2,
      chartTheme.chart3,
      chartTheme.chart4,
      chartTheme.chart5,
    ];

    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels: slices.map((s) => s.product),
        datasets: [
          {
            data: slices.map((s) => s.amount),
            backgroundColor: slices.map((_, i) => colors[i % colors.length]),
            borderColor: chartTheme.card,
            borderWidth: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: chartTheme.foreground,
              boxWidth: 10,
              font: { size: 11 },
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const total = slices.reduce((sum, s) => sum + s.amount, 0) || 1;
                const val = Number(ctx.raw) || 0;
                const pct = ((val / total) * 100).toFixed(1);
                const display =
                  val >= 1_000_000
                    ? `KES ${(val / 1_000_000).toFixed(2)}M`
                    : val >= 1_000
                      ? `KES ${(val / 1_000).toFixed(1)}k`
                      : `KES ${Math.round(val).toLocaleString()}`;
                return `${ctx.label}: ${display} (${pct}%)`;
              },
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

  const empty = !isLoading && (!hasData || metrics.productMix.length === 0);

  return (
    <Card className='border-border/80 from-card via-sky-50/30 to-indigo-50/20 bg-linear-to-br dark:via-sky-950/20 dark:to-indigo-950/15'>
      <CardHeader className='pb-2'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <CardTitle className='text-[15px] font-semibold tracking-tight'>
            Product revenue mix
          </CardTitle>
          <span className='text-muted-foreground rounded-full border px-2.5 py-0.5 text-[11px] font-medium'>
            share of billed
          </span>
        </div>
        <p className='text-muted-foreground text-[11px]'>
          How tariff revenue splits across products (MTD, else last 6 months).
        </p>
      </CardHeader>
      <CardContent>
        <div className='relative h-[260px]'>
          {empty ? (
            <div className='text-muted-foreground absolute inset-0 flex items-center justify-center text-sm'>
              No product mix to show.
            </div>
          ) : (
            <canvas ref={canvasRef} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
