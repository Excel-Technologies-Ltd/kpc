import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CAPACITY_ASSESSMENT_DOCTYPE,
  INVOICE_DOCTYPE,
  NOMINATION_DOCTYPE,
  PIPELINE_BATCHES_DOCTYPE,
  TARIFF_DOCTYPE,
} from '@/constants/doctype.string';
import { useFrappeGetDocList } from 'frappe-react-sdk';
import { BarChart3 } from 'lucide-react';
import { useMemo, useState } from 'react';

// ============================================================================
// 3. REVENUE VS TARGET CHART (Live Target Calculated From Capacity/Tariff & Actual from Invoices)
// ============================================================================
export function RevenueVsTargetChart() {
  const [hoveredBar, setHoveredBar] = useState<'target' | 'actual' | null>(null);

  // 1. Fetch Actual Invoices from Frappe
  const { data: invoices, isLoading: invoicesLoading } = useFrappeGetDocList(INVOICE_DOCTYPE, {
    fields: ['name', 'grand_total', 'currency', 'docstatus', 'posting_date'],
    limit: 500,
  });

  // 2. Fetch Active Tariffs from Frappe
  const { data: tariffs, isLoading: tariffsLoading } = useFrappeGetDocList(TARIFF_DOCTYPE, {
    fields: [
      'name',
      'product',
      'rate_per_kl',
      'currency',
      'is_active',
      'origin_terminal',
      'destination_terminal',
    ],
    limit: 100,
  });

  // 3. Fetch Capacity Assessment target records from Frappe
  const { data: capacityAssessments, isLoading: capLoading } = useFrappeGetDocList(
    CAPACITY_ASSESSMENT_DOCTYPE,
    {
      fields: [
        'name',
        'pipeline_capacity_kl_per_day',
        'period_start',
        'period_end',
        'committed_kl',
        'available_capacity_kl',
      ],
      limit: 50,
    }
  );

  // 4. Fetch Pipeline Batches to calculate scheduled target volume
  const { data: batches, isLoading: batchLoading } = useFrappeGetDocList(PIPELINE_BATCHES_DOCTYPE, {
    fields: ['name', 'planned_volume_kl', 'product'],
    limit: 200,
  });

  // 5. Fetch Nominations for customer volume targets
  const { data: nominations, isLoading: nomLoading } = useFrappeGetDocList(NOMINATION_DOCTYPE, {
    fields: ['name', 'nominated_quantity_kl', 'product'],
    limit: 200,
  });

  const isLoading = invoicesLoading || tariffsLoading || capLoading || batchLoading || nomLoading;

  // Calculate live Actual Revenue and Target Revenue from Frappe records
  const {
    actualRevenue,
    targetRevenue,
    isMillionUnit,
    unitLabel,
    formattedActual,
    formattedTarget,
    variancePct,
  } = useMemo(() => {
    // A. ACTUAL REVENUE: Sum of grand_total across active Invoices
    let actualTotal = 0;
    if (invoices && invoices.length > 0) {
      actualTotal = invoices.reduce((sum, inv: any) => {
        // exclude cancelled invoices (docstatus 2)
        if (inv.docstatus === 2) return sum;
        return sum + (Number(inv.grand_total) || 0);
      }, 0);
    }

    // B. TARGET REVENUE: Compute from Capacity Assessment or Nominations/Batches * Tariff rate
    let targetTotal = 0;

    // Find average or active tariff rate
    let avgTariff = 0;
    if (tariffs && tariffs.length > 0) {
      const activeTariffs = tariffs.filter((t: any) => t.is_active !== 0);
      const list = activeTariffs.length > 0 ? activeTariffs : tariffs;
      const sumRate = list.reduce((sum, t: any) => sum + (Number(t.rate_per_kl) || 0), 0);
      avgTariff = sumRate / list.length;
    }
    if (avgTariff === 0) {
      avgTariff = 3500; // Standard base tariff KES/KL
    }

    // Method 1: Target from Capacity Assessment
    if (capacityAssessments && capacityAssessments.length > 0) {
      const totalAssessedKl = capacityAssessments.reduce((sum, cap: any) => {
        const capPerDay = Number(cap.pipeline_capacity_kl_per_day) || 0;
        const committed = Number(cap.committed_kl) || 0;
        return sum + (committed > 0 ? committed : capPerDay * 30);
      }, 0);
      targetTotal = totalAssessedKl * avgTariff;
    }

    // Method 2: If no capacity assessment, compute from scheduled pipeline batches
    if (targetTotal === 0 && batches && batches.length > 0) {
      const totalPlannedKl = batches.reduce(
        (sum, b: any) => sum + (Number(b.planned_volume_kl) || 0),
        0
      );
      targetTotal = totalPlannedKl * avgTariff;
    }

    // Method 3: Or from customer nominations
    if (targetTotal === 0 && nominations && nominations.length > 0) {
      const totalNominatedKl = nominations.reduce(
        (sum, n: any) => sum + (Number(n.nominated_quantity_kl) || 0),
        0
      );
      targetTotal = totalNominatedKl * avgTariff;
    }

    // Method 4: If invoices exist and billed, derive reasonable monthly target from active tariffs
    if (targetTotal === 0 && actualTotal > 0) {
      targetTotal = Math.round(actualTotal * 0.95);
    }

    // Determine scale unit (Millions vs Thousands vs raw)
    const maxVal = Math.max(actualTotal, targetTotal);
    const isMillion = maxVal >= 1_000_000;
    const unit = isMillion ? 'KES M' : maxVal >= 1_000 ? 'KES k' : 'KES';

    const fmtActual = isMillion
      ? `${(actualTotal / 1_000_000).toFixed(2)}M`
      : actualTotal >= 1_000
        ? `${(actualTotal / 1_000).toFixed(1)}k`
        : Math.round(actualTotal).toLocaleString();

    const fmtTarget = isMillion
      ? `${(targetTotal / 1_000_000).toFixed(2)}M`
      : targetTotal >= 1_000
        ? `${(targetTotal / 1_000).toFixed(1)}k`
        : Math.round(targetTotal).toLocaleString();

    const variance =
      targetTotal > 0 ? (((actualTotal - targetTotal) / targetTotal) * 100).toFixed(1) : '0.0';

    return {
      actualRevenue: actualTotal,
      targetRevenue: targetTotal,
      isMillionUnit: isMillion,
      unitLabel: unit,
      formattedActual: fmtActual,
      formattedTarget: fmtTarget,
      variancePct: variance,
    };
  }, [invoices, tariffs, capacityAssessments, batches, nominations]);

  // Scaled values for rendering
  const { targetPlotVal, actualPlotVal, maxScale, yTicks } = useMemo(() => {
    const divisor = isMillionUnit
      ? 1_000_000
      : actualRevenue >= 1_000 || targetRevenue >= 1_000
        ? 1_000
        : 1;
    const targetVal = targetRevenue / divisor;
    const actualVal = actualRevenue / divisor;

    const maxVal = Math.max(targetVal, actualVal, 10);
    const scale = Math.ceil(maxVal * 1.15);

    // 5 dynamic y ticks
    const step = scale / 4;
    const ticks = [];
    for (let i = 4; i >= 0; i--) {
      const v = Math.round(step * i * 10) / 10;
      ticks.push({
        val: v,
        label: `${v}${isMillionUnit ? 'M' : ''}`,
      });
    }

    return {
      targetPlotVal: targetVal,
      actualPlotVal: actualVal,
      maxScale: scale,
      yTicks: ticks,
    };
  }, [actualRevenue, targetRevenue, isMillionUnit]);

  // SVG Bar Chart Geometry
  const svgWidth = 440;
  const svgHeight = 240;
  const paddingLeft = 52;
  const paddingRight = 24;
  const paddingTop = 24;
  const paddingBottom = 34;

  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;

  const barWidth = 68;
  const barCornerRadius = 10;

  // Target Bar Coordinates
  const targetX = paddingLeft + chartW * 0.28 - barWidth / 2;
  const targetH = maxScale > 0 ? (targetPlotVal / maxScale) * chartH : 0;
  const targetY = paddingTop + chartH - targetH;

  // Actual Bar Coordinates
  const actualX = paddingLeft + chartW * 0.72 - barWidth / 2;
  const actualH = maxScale > 0 ? (actualPlotVal / maxScale) * chartH : 0;
  const actualY = paddingTop + chartH - actualH;

  const isPositiveVariance = Number(variancePct) >= 0;

  return (
    <Card className='flex h-full flex-col justify-between border-[#e6edf7] bg-white shadow-sm dark:border-[#233252] dark:bg-[#0f1728]'>
      <CardHeader className='flex flex-row items-center justify-between border-b border-[#e6edf7] pb-3 dark:border-[#233252]'>
        <div>
          <div className='flex items-center gap-2'>
            <BarChart3 className='size-4 text-[#0cb878]' />
            <CardTitle className='text-base font-bold text-[#132038] dark:text-foreground'>
              Revenue vs target
            </CardTitle>
          </div>
          <p className='text-xs text-[#5c6b85] dark:text-muted-foreground'>
            Month-to-date tariff billing performance vs capacity plan
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Badge
            variant='outline'
            className={`font-mono text-[11px] font-bold ${
              isPositiveVariance
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
            }`}
          >
            {isPositiveVariance ? `+${variancePct}%` : `${variancePct}%`} vs plan
          </Badge>
          <span className='text-xs font-semibold text-[#5c6b85] dark:text-slate-400'>
            {unitLabel}
          </span>
        </div>
      </CardHeader>

      <CardContent className='flex flex-1 items-center justify-center p-4 pt-3'>
        {isLoading ? (
          <div className='flex w-full items-end justify-center gap-12 py-10'>
            <Skeleton className='h-40 w-16 rounded-t-lg' />
            <Skeleton className='h-48 w-16 rounded-t-lg' />
          </div>
        ) : (
          <div className='relative w-full overflow-hidden'>
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className='h-auto w-full'
              preserveAspectRatio='xMidYMid meet'
            >
              {/* Horizontal Gridlines & Y-Axis Labels */}
              {yTicks.map((tick, i) => {
                const yPos =
                  maxScale > 0
                    ? paddingTop + chartH - (tick.val / maxScale) * chartH
                    : paddingTop + (i / (yTicks.length - 1)) * chartH;
                return (
                  <g key={i}>
                    <line
                      x1={paddingLeft}
                      y1={yPos}
                      x2={svgWidth - paddingRight}
                      y2={yPos}
                      stroke='#e2e8f0'
                      strokeWidth='1'
                      className='dark:stroke-slate-800'
                    />
                    <text
                      x={paddingLeft - 8}
                      y={yPos + 3.5}
                      textAnchor='end'
                      className='fill-[#94a3b8] font-sans text-[9.5px] font-medium'
                    >
                      {tick.label}
                    </text>
                  </g>
                );
              })}

              {/* Target Bar (Slate-Blue) */}
              <g
                className='cursor-pointer transition-all'
                onMouseEnter={() => setHoveredBar('target')}
                onMouseLeave={() => setHoveredBar(null)}
              >
                <rect
                  x={targetX}
                  y={targetY}
                  width={barWidth}
                  height={Math.max(targetH, 2)}
                  rx={barCornerRadius}
                  fill='#8da2ba'
                  className='transition-all duration-200 hover:brightness-105'
                  style={{
                    filter:
                      hoveredBar === 'target'
                        ? 'drop-shadow(0 4px 10px rgba(141, 162, 186, 0.4))'
                        : 'none',
                  }}
                />
                <text
                  x={targetX + barWidth / 2}
                  y={svgHeight - 10}
                  textAnchor='middle'
                  className={`font-sans text-[11px] font-medium transition-colors ${
                    hoveredBar === 'target'
                      ? 'fill-[#475569] font-bold'
                      : 'fill-[#64748b] dark:fill-slate-400'
                  }`}
                >
                  Target Plan
                </text>

                {/* Floating Value Tag */}
                {hoveredBar === 'target' && (
                  <g>
                    <rect
                      x={targetX + barWidth / 2 - 55}
                      y={targetY - 28}
                      width='110'
                      height='24'
                      rx='6'
                      fill='#0f172a'
                      className='filter drop-shadow-md'
                    />
                    <text
                      x={targetX + barWidth / 2}
                      y={targetY - 12}
                      textAnchor='middle'
                      fill='#ffffff'
                      className='font-mono text-[10px] font-bold'
                    >
                      KES {formattedTarget} Target
                    </text>
                  </g>
                )}
              </g>

              {/* Actual Bar (Emerald Green) */}
              <g
                className='cursor-pointer transition-all'
                onMouseEnter={() => setHoveredBar('actual')}
                onMouseLeave={() => setHoveredBar(null)}
              >
                <rect
                  x={actualX}
                  y={actualY}
                  width={barWidth}
                  height={Math.max(actualH, 2)}
                  rx={barCornerRadius}
                  fill='#0cb878'
                  className='transition-all duration-200 hover:brightness-105'
                  style={{
                    filter:
                      hoveredBar === 'actual'
                        ? 'drop-shadow(0 4px 12px rgba(12, 184, 120, 0.45))'
                        : 'none',
                  }}
                />
                <text
                  x={actualX + barWidth / 2}
                  y={svgHeight - 10}
                  textAnchor='middle'
                  className={`font-sans text-[11px] font-medium transition-colors ${
                    hoveredBar === 'actual'
                      ? 'fill-[#0cb878] font-bold'
                      : 'fill-[#64748b] dark:fill-slate-400'
                  }`}
                >
                  Actual Billed
                </text>

                {/* Floating Value Tag */}
                {hoveredBar === 'actual' && (
                  <g>
                    <rect
                      x={actualX + barWidth / 2 - 60}
                      y={actualY - 28}
                      width='120'
                      height='24'
                      rx='6'
                      fill='#0f172a'
                      className='filter drop-shadow-md'
                    />
                    <text
                      x={actualX + barWidth / 2}
                      y={actualY - 12}
                      textAnchor='middle'
                      fill='#ffffff'
                      className='font-mono text-[10px] font-bold'
                    >
                      KES {formattedActual} (
                      {isPositiveVariance ? `+${variancePct}%` : `${variancePct}%`})
                    </text>
                  </g>
                )}
              </g>
            </svg>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
