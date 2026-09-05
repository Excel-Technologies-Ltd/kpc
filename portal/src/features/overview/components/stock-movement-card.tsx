import { useTheme } from '@/components/theme-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getChartTheme } from '@/lib/chart-theme';
import Chart from 'chart.js/auto';
import { useFrappeGetCall, useFrappeGetDocList } from 'frappe-react-sdk';
import { useEffect, useMemo, useRef, useState } from 'react';

interface StockMovementResponse {
  unit: string;
  period: string;
  date: string;
  opening: number;
  receipts: number;
  deliveries: number;
  losses: number;
  closing: number;
  summary?: {
    net_change: number;
    net_change_percent: number;
    turnover_rate_percent: number;
  };
}

export function StockMovementCard() {
  const { theme } = useTheme();
  const chartRef = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showTooltipInfo, setShowTooltipInfo] = useState(false);

  const { data: apiData } = useFrappeGetCall<StockMovementResponse>(
    'kpc.petroleum_operations.api.get_stock_movement'
  );

  const { data: positions } = useFrappeGetDocList('Inventory Position', {
    fields: [
      'opening_volume_kl',
      'receipts_kl',
      'dispatches_kl',
      'adjustments_kl',
      'closing_volume_kl',
    ],
    limit: 100,
  });

  const { data: receipts } = useFrappeGetDocList('Terminal Receipt', {
    fields: ['net_standard_volume_kl', 'gross_observed_volume_kl'],
    limit: 100,
  });

  const { data: dispatches } = useFrappeGetDocList('Dispatch', {
    fields: ['actual_quantity_kl', 'planned_quantity_kl'],
    limit: 100,
  });

  const movement = useMemo(() => {
    if (apiData && apiData.opening !== undefined) {
      return {
        unit: apiData.unit || 'm³',
        period: apiData.period || 'today',
        opening: apiData.opening,
        receipts: apiData.receipts,
        deliveries: apiData.deliveries,
        losses: apiData.losses,
        closing: apiData.closing,
      };
    }

    if (positions && positions.length > 0) {
      const op = positions.reduce(
        (acc: number, p: any) => acc + (Number(p.opening_volume_kl) || 0),
        0
      );
      const rec = positions.reduce((acc: number, p: any) => acc + (Number(p.receipts_kl) || 0), 0);
      const disp = positions.reduce(
        (acc: number, p: any) => acc + (Number(p.dispatches_kl) || 0),
        0
      );
      const adj = positions.reduce(
        (acc: number, p: any) => acc + (Number(p.adjustments_kl) || 0),
        0
      );
      const cl = positions.reduce(
        (acc: number, p: any) => acc + (Number(p.closing_volume_kl) || 0),
        0
      );

      return {
        unit: 'm³',
        period: 'today',
        opening: op,
        receipts: rec,
        deliveries: disp,
        losses: adj,
        closing: cl || op + rec - disp + adj,
      };
    }

    let totalReceipts = 0;
    if (receipts && receipts.length > 0) {
      totalReceipts = receipts.reduce(
        (sum: number, r: any) =>
          sum + (Number(r.net_standard_volume_kl) || Number(r.gross_observed_volume_kl) || 0),
        0
      );
    }
    let totalDispatches = 0;
    if (dispatches && dispatches.length > 0) {
      totalDispatches = dispatches.reduce(
        (sum: number, d: any) =>
          sum + (Number(d.actual_quantity_kl) || Number(d.planned_quantity_kl) || 0),
        0
      );
    }

    const opening = 0;
    const rec = totalReceipts;
    const del = totalDispatches;
    const loss = 0;
    const closing = opening + rec - del + loss;

    return {
      unit: 'm³',
      period: 'today',
      opening,
      receipts: rec,
      deliveries: del,
      losses: loss,
      closing,
    };
  }, [apiData, positions, receipts, dispatches]);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const theme = getChartTheme();
    const { opening, receipts, deliveries, losses, closing } = movement;

    const peakVolume = opening + receipts;
    const deliveryBottom = peakVolume - deliveries;
    const lossBottom = closing;
    const lossTop = closing + Math.abs(losses);

    const labels = ['Opening', 'Receipts', 'Deliveries', 'Losses', 'Closing'];
    const barRanges = [
      [0, opening],
      [opening, peakVolume],
      [deliveryBottom, peakVolume],
      losses !== 0 ? [lossBottom, lossTop] : [closing, closing],
      [0, closing],
    ];

    const colors = [theme.chart1, theme.chart2, theme.chart3, theme.chart4, theme.chart5];

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            data: barRanges as any,
            backgroundColor: colors,
            hoverBackgroundColor: colors,
            borderRadius: 6,
            borderSkipped: false,
            barPercentage: 0.62,
            categoryPercentage: 0.78,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 24,
            bottom: 16,
            left: 10,
            right: 20,
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: theme.card,
            titleColor: theme.foreground,
            bodyColor: theme.muted,
            borderColor: theme.border,
            borderWidth: 1,
            padding: 12,
            boxPadding: 6,
            usePointStyle: true,
            callbacks: {
              title: (items) => `${items[0].label} Volume`,
              label: (context) => {
                const idx = context.dataIndex;
                let val = 0;
                let prefix = '';
                if (idx === 0) val = opening;
                else if (idx === 1) {
                  val = receipts;
                  prefix = '+';
                } else if (idx === 2) {
                  val = deliveries;
                  prefix = '-';
                } else if (idx === 3) {
                  val = Math.abs(losses);
                  prefix = losses < 0 ? '-' : '+';
                } else if (idx === 4) val = closing;

                return ` Volume: ${prefix}${val.toLocaleString('en-US', {
                  maximumFractionDigits: 1,
                })} ${movement.unit}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: theme.muted,
              font: { size: 12.5, weight: 500 },
              padding: 14,
            },
          },
          y: {
            min: 0,
            suggestedMax: 160000,
            grid: {
              color: theme.border,
            },
            ticks: {
              stepSize: 20000,
              color: theme.muted,
              font: { size: 11 },
              callback: (value) => {
                const num = Number(value);
                return num === 0 ? '0k' : `${num / 1000}k`;
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [movement, theme]);

  return (
    <Card id='stock-movement' className='mb-12 scroll-mt-24'>
      <CardHeader className='flex flex-row items-start justify-between gap-4'>
        <div>
          <div className='flex items-center gap-2.5'>
            <CardTitle className='text-xl sm:text-2xl'>Stock movement</CardTitle>
            <button
              type='button'
              onClick={() => setShowTooltipInfo(!showTooltipInfo)}
              onMouseEnter={() => setShowTooltipInfo(true)}
              onMouseLeave={() => setShowTooltipInfo(false)}
              className='border-border bg-muted text-muted-foreground hover:text-foreground flex size-5 cursor-pointer items-center justify-center rounded-full border text-xs font-mono transition-colors focus:outline-none'
              title='Stock Bridge Info'
            >
              i
            </button>
          </div>
          <CardDescription className='mt-1.5'>
            Opening balance walked through receipts, deliveries and losses to closing.
          </CardDescription>
        </div>

        <span className='border-border bg-muted text-muted-foreground shrink-0 rounded-lg border px-3 py-1.5 font-mono text-xs sm:text-sm'>
          {movement.unit}, {movement.period}
        </span>
      </CardHeader>

      <CardContent>
        {showTooltipInfo ? (
          <div className='border-border bg-muted/50 text-muted-foreground mb-6 flex items-center justify-between gap-4 rounded-xl border p-3.5 text-xs'>
            <span>
              Real-time bridge formula:{' '}
              <code className='text-foreground font-mono font-semibold'>
                Opening + Receipts - Deliveries ± Losses = Closing
              </code>
            </span>
            <span className='text-foreground shrink-0 font-mono'>
              Live API: kpc.petroleum_operations.api.get_stock_movement
            </span>
          </div>
        ) : null}

        <div className='relative my-2 h-80 w-full px-1 sm:h-96'>
          <canvas ref={canvasRef} id='stockMovementCanvas' />
        </div>

        <div className='border-border mt-8 grid grid-cols-2 gap-4 border-t pt-6 sm:grid-cols-4'>
          <div className='border-border bg-muted/40 rounded-xl border p-4 sm:p-5'>
            <div className='text-muted-foreground text-[11px] font-medium tracking-wider uppercase'>
              Opening Stock
            </div>
            <div className='text-foreground mt-1.5 font-mono text-lg font-bold sm:text-xl'>
              {movement.opening.toLocaleString('en-US', {
                maximumFractionDigits: 0,
              })}{' '}
              <span className='text-muted-foreground text-xs font-normal'>{movement.unit}</span>
            </div>
          </div>

          <div className='border-border bg-muted/40 rounded-xl border p-4 sm:p-5'>
            <div className='text-muted-foreground text-[11px] font-medium tracking-wider uppercase'>
              + Receipts (In)
            </div>
            <div className='text-foreground mt-1.5 font-mono text-lg font-bold sm:text-xl'>
              +
              {movement.receipts.toLocaleString('en-US', {
                maximumFractionDigits: 0,
              })}{' '}
              <span className='text-muted-foreground text-xs font-normal'>{movement.unit}</span>
            </div>
          </div>

          <div className='border-border bg-muted/40 rounded-xl border p-4 sm:p-5'>
            <div className='text-muted-foreground text-[11px] font-medium tracking-wider uppercase'>
              - Deliveries (Out)
            </div>
            <div className='text-foreground mt-1.5 font-mono text-lg font-bold sm:text-xl'>
              -
              {movement.deliveries.toLocaleString('en-US', {
                maximumFractionDigits: 0,
              })}{' '}
              <span className='text-muted-foreground text-xs font-normal'>{movement.unit}</span>
            </div>
          </div>

          <div className='border-border bg-muted/40 rounded-xl border p-4 sm:p-5'>
            <div className='text-muted-foreground text-[11px] font-medium tracking-wider uppercase'>
              = Closing Balance
            </div>
            <div className='text-foreground mt-1.5 font-mono text-lg font-bold sm:text-xl'>
              {movement.closing.toLocaleString('en-US', {
                maximumFractionDigits: 0,
              })}{' '}
              <span className='text-muted-foreground text-xs font-normal'>{movement.unit}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
