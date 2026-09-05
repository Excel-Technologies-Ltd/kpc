import { useTheme } from '@/components/theme-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DISPATCH_DOCTYPE,
  INVENTORY_POSITION_DOCTYPE,
  TERMINAL_RECEIPT_DOCTYPE,
} from '@/constants/doctype.string';
import { getChartTheme } from '@/lib/chart-theme';
import { cn } from '@/lib/utils';
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

interface StockMovementCardProps {
  compact?: boolean;
}

export function StockMovementCard({ compact = false }: StockMovementCardProps = {}) {
  const { theme } = useTheme();
  const chartRef = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showTooltipInfo, setShowTooltipInfo] = useState(false);

  const { data: apiData } = useFrappeGetCall<StockMovementResponse>(
    'kpc.petroleum_operations.api.get_stock_movement'
  );

  const { data: positions } = useFrappeGetDocList(INVENTORY_POSITION_DOCTYPE, {
    fields: [
      'opening_volume_kl',
      'receipts_kl',
      'dispatches_kl',
      'adjustments_kl',
      'closing_volume_kl',
    ],
    limit: 100,
  });

  const { data: receipts } = useFrappeGetDocList(TERMINAL_RECEIPT_DOCTYPE, {
    fields: ['net_standard_volume_kl', 'gross_observed_volume_kl'],
    limit: 100,
  });

  const { data: dispatches } = useFrappeGetDocList(DISPATCH_DOCTYPE, {
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
    const formatVol = (val: number, prefix = '') => {
      const formatted = Math.round(val).toLocaleString('en-US');
      return `${prefix}${formatted} ${movement.unit}`;
    };

    const labels = [
      ['Opening', formatVol(opening)],
      ['Receipts', formatVol(receipts, '+')],
      ['Deliveries', formatVol(deliveries, '-')],
      [
        'Losses',
        losses !== 0 ? formatVol(Math.abs(losses), losses < 0 ? '-' : '+') : `0 ${movement.unit}`,
      ],
      ['Closing', formatVol(closing)],
    ];
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
            bottom: 12,
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
              title: (items) => {
                const item = items[0];
                const raw = item.label;
                const title = Array.isArray(raw) ? raw[0] : raw;
                return `${title} Volume`;
              },
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
              color: theme.foreground,
              font: { size: 12, weight: 600, lineHeight: 1.45 },
              padding: 10,
            },
          },
          y: {
            min: 0,
            suggestedMax: Math.max(peakVolume, closing) * 1.1,
            grid: {
              color: theme.border,
            },
            ticks: {
              color: theme.muted,
              font: { size: 11 },
              callback: (value) => {
                const num = Number(value);
                if (num === 0) return '0';
                if (num >= 1_000_000) {
                  return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
                }
                if (num >= 1_000) {
                  return `${(num / 1_000).toFixed(0)}k`;
                }
                return num.toLocaleString();
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
    <Card
      className={cn(
        'border-border shadow-xs relative w-full overflow-hidden border',
        compact ? 'mb-0' : 'mb-12'
      )}
    >
      <CardHeader className='flex flex-row items-start justify-between gap-4 pb-2'>
        <div>
          <div className='flex items-center gap-2'>
            <CardTitle
              className={cn(compact ? 'text-lg font-bold sm:text-xl' : 'text-xl sm:text-2xl')}
            >
              Stock movement
            </CardTitle>
            <button
              type='button'
              onClick={() => setShowTooltipInfo(!showTooltipInfo)}
              onMouseEnter={() => setShowTooltipInfo(true)}
              onMouseLeave={() => setShowTooltipInfo(false)}
              className='border-border bg-muted/60 text-muted-foreground hover:text-foreground flex size-4.5 cursor-pointer items-center justify-center rounded-full border text-[11px] font-mono transition-colors focus:outline-none'
              title='Waterfall explanation'
            >
              i
            </button>
          </div>
          <CardDescription className='text-muted-foreground mt-0.5 text-xs sm:text-sm'>
            Opening balance walked through receipts, deliveries and losses to closing.
          </CardDescription>
        </div>

        <div className='flex items-center gap-2'>
          <span className='border-border bg-muted/50 text-muted-foreground rounded border px-2 py-0.5 font-mono text-xs'>
            {movement.unit}, today
          </span>
        </div>
      </CardHeader>

      <CardContent className={cn('pt-0', compact ? 'pb-4' : 'pb-6')}>
        {showTooltipInfo ? (
          <div className='border-border bg-muted/40 text-muted-foreground mb-3 flex items-center justify-between gap-3 rounded-lg border p-2.5 text-xs'>
            <span>
              <b className='text-foreground'>Formula:</b> Closing = Opening + Receipts − Deliveries
              − Losses.
            </span>
            <span className='text-foreground shrink-0 font-mono text-[11px]'>
              API: get_stock_movement
            </span>
          </div>
        ) : null}

        <div className={cn('relative my-1 w-full px-1', compact ? 'h-56 sm:h-64' : 'h-80 sm:h-96')}>
          <canvas ref={canvasRef} id='stockMovementCanvas' />
        </div>
      </CardContent>
    </Card>
  );
}
