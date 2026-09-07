import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PIPELINE_BATCHES_DOCTYPE, TERMINAL_RECEIPT_DOCTYPE } from '@/constants/doctype.string';
import { useFrappeGetDocList } from 'frappe-react-sdk';
import { TrendingUp } from 'lucide-react';
import { formatMetricValue } from '@/lib/utils';
import { useMemo, useState } from 'react';

// ============================================================================
// 1. THROUGHPUT TREND CHART (Past 7 Days Live From Terminal Receipts / Batches)
// ============================================================================
export function ThroughputTrendChart() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Fetch live terminal receipts
  const { data: receipts, isLoading: receiptsLoading } = useFrappeGetDocList(
    TERMINAL_RECEIPT_DOCTYPE,
    {
      fields: [
        'name',
        'posting_date',
        'receipt_datetime',
        'creation',
        'net_standard_volume_kl',
        'gross_observed_volume_kl',
      ],
      limit: 500,
      orderBy: { field: 'creation', order: 'desc' },
    }
  );

  // Fetch live pipeline batches as supplementary throughput data
  const { data: batches, isLoading: batchesLoading } = useFrappeGetDocList(
    PIPELINE_BATCHES_DOCTYPE,
    {
      fields: ['name', 'scheduled_start', 'creation', 'planned_volume_kl'],
      limit: 500,
      orderBy: { field: 'creation', order: 'desc' },
    }
  );

  const isLoading = receiptsLoading || batchesLoading;

  // Aggregate live throughput across the past 7 calendar days
  const trendData = useMemo(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const days: {
      dateStr: string;
      day: string;
      fullDate: string;
      val: number;
      display: string;
      count: number;
    }[] = [];

    // Construct last 7 consecutive days (from 6 days ago to today)
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const date = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${date}`;
      const day = dayNames[d.getDay()];
      const fullDate = d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });

      days.push({
        dateStr,
        day,
        fullDate,
        val: 0,
        display: '0 m³',
        count: 0,
      });
    }

    // 1. Aggregate from Terminal Receipts
    if (receipts && receipts.length > 0) {
      receipts.forEach((r: any) => {
        const rawDate = r.receipt_datetime || r.posting_date || r.creation;
        if (!rawDate) return;
        const recordDateStr = String(rawDate).slice(0, 10);
        const matchDay = days.find((d) => d.dateStr === recordDateStr);
        const volume = Number(r.net_standard_volume_kl) || Number(r.gross_observed_volume_kl) || 0;
        if (matchDay) {
          matchDay.val += volume;
          matchDay.count += 1;
        }
      });
    }

    // 2. If receipts are empty or sparse, supplement with Pipeline Batches
    const totalReceiptVol = days.reduce((sum, d) => sum + d.val, 0);
    if (totalReceiptVol === 0 && batches && batches.length > 0) {
      batches.forEach((b: any) => {
        const rawDate = b.scheduled_start || b.creation;
        if (!rawDate) return;
        const recordDateStr = String(rawDate).slice(0, 10);
        const matchDay = days.find((d) => d.dateStr === recordDateStr);
        const volume = Number(b.planned_volume_kl) || 0;
        if (matchDay) {
          matchDay.val += volume;
          matchDay.count += 1;
        }
      });
    }

    // Format display strings based on magnitude
    return days.map((d) => ({
      ...d,
      display: `${formatMetricValue(d.val, 1)} m³`,
    }));
  }, [receipts, batches]);

  // Calculate dynamic scale bounds strictly from live aggregated data
  const { minVal, maxVal, yTicks, totalVolume } = useMemo(() => {
    const vals = trendData.map((d) => d.val);
    const sum = vals.reduce((a, b) => a + b, 0);
    const max = Math.max(...vals, 0);
    const min = Math.min(...vals, 0);

    if (max === 0) {
      return {
        minVal: 0,
        maxVal: 100,
        yTicks: [
          { label: '100 m³', val: 100 },
          { label: '75 m³', val: 75 },
          { label: '50 m³', val: 50 },
          { label: '25 m³', val: 25 },
          { label: '0 m³', val: 0 },
        ],
        totalVolume: 0,
      };
    }

    const range = max - min || max;
    const lower = Math.max(0, Math.floor(min - range * 0.1));
    const upper = Math.ceil(max + range * 0.15);

    // Build 5 evenly spaced y-axis ticks
    const step = (upper - lower) / 4;
    const ticks = [];
    for (let i = 4; i >= 0; i--) {
      const val = Math.round(lower + step * i);
      const label = val >= 1000 ? formatMetricValue(val, 1) : `${val.toLocaleString()} m³`;
      ticks.push({ label, val });
    }

    return {
      minVal: lower,
      maxVal: upper,
      yTicks: ticks,
      totalVolume: sum,
    };
  }, [trendData]);

  // SVG Chart Geometry Constants
  const svgWidth = 480;
  const svgHeight = 240;
  const paddingLeft = 52;
  const paddingRight = 24;
  const paddingTop = 24;
  const paddingBottom = 34;

  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;

  // Calculate coordinates for points
  const points = useMemo(() => {
    return trendData.map((d, i) => {
      const x = paddingLeft + (i / Math.max(trendData.length - 1, 1)) * chartW;
      const normalizedY = maxVal > minVal ? (d.val - minVal) / (maxVal - minVal) : 0.5;
      const y = paddingTop + chartH - normalizedY * chartH;
      return {
        x,
        y,
        day: d.day,
        fullDate: d.fullDate,
        val: d.val,
        display: d.display,
        count: d.count,
      };
    });
  }, [trendData, minVal, maxVal, chartW, chartH]);

  // Construct smooth cubic bezier path
  const { linePath, areaPath } = useMemo(() => {
    if (points.length === 0) return { linePath: '', areaPath: '' };

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = i > 0 ? points[i - 1] : points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i !== points.length - 2 ? points[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    const area = `${d} L ${points[points.length - 1].x} ${paddingTop + chartH} L ${points[0].x} ${paddingTop + chartH} Z`;

    return { linePath: d, areaPath: area };
  }, [points, paddingTop, chartH]);

  return (
    <Card className='flex h-full flex-col justify-between border-border bg-card shadow-sm '>
      <CardHeader className='flex flex-row items-center justify-between border-b border-border pb-3 '>
        <div>
          <div className='flex items-center gap-2'>
            <TrendingUp className='size-4 text-[#3b82f6]' />
            <CardTitle className='text-base font-bold text-foreground dark:text-foreground'>
              Throughput trend
            </CardTitle>
          </div>
          <p className='text-xs text-muted-foreground dark:text-muted-foreground'>
            Daily pumped volume across Nairobi &amp; Western trunk lines
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Badge
            variant='outline'
            className='border-[#3b82f6]/30 bg-blue-50/60 font-mono text-[11px] font-bold text-[#2563eb] dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
          >
            {`${formatMetricValue(totalVolume, 1)} m³ total`}
          </Badge>
          <span className='text-xs font-semibold text-muted-foreground dark:text-slate-400'>7 days</span>
        </div>
      </CardHeader>

      <CardContent className='flex flex-1 items-center justify-center p-4 pt-3'>
        {isLoading ? (
          <div className='flex w-full flex-col items-center justify-center space-y-3 py-12'>
            <Skeleton className='h-36 w-full rounded-lg' />
            <div className='flex w-full justify-between'>
              {Array.from({ length: 7 }).map((_, idx) => (
                <Skeleton key={idx} className='h-4 w-8 rounded' />
              ))}
            </div>
          </div>
        ) : (
          <div className='relative w-full overflow-hidden'>
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className='h-auto w-full'
              preserveAspectRatio='xMidYMid meet'
            >
              <defs>
                <linearGradient id='throughputGrad' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='0%' stopColor='#3b82f6' stopOpacity='0.32' />
                  <stop offset='100%' stopColor='#3b82f6' stopOpacity='0.01' />
                </linearGradient>
              </defs>

              {/* Horizontal Gridlines & Y-Axis Labels */}
              {yTicks.map((tick, i) => {
                const yPos =
                  maxVal > minVal
                    ? paddingTop + chartH - ((tick.val - minVal) / (maxVal - minVal)) * chartH
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

              {/* Guideline on Hover */}
              {hoveredIdx !== null && (
                <line
                  x1={points[hoveredIdx].x}
                  y1={paddingTop}
                  x2={points[hoveredIdx].x}
                  y2={paddingTop + chartH}
                  stroke='#3b82f6'
                  strokeWidth='1.2'
                  strokeDasharray='3 3'
                  opacity='0.6'
                />
              )}

              {/* Area */}
              <path d={areaPath} fill='url(#throughputGrad)' />

              {/* Spline */}
              <path
                d={linePath}
                fill='none'
                stroke='#3b82f6'
                strokeWidth='3.2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />

              {/* Points */}
              {points.map((pt, i) => {
                const isHovered = hoveredIdx === i;
                return (
                  <g
                    key={i}
                    className='cursor-pointer'
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    {isHovered && (
                      <circle cx={pt.x} cy={pt.y} r='9' fill='#3b82f6' fillOpacity='0.25' />
                    )}

                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? '5.2' : '4.2'}
                      fill='#3b82f6'
                      stroke='#ffffff'
                      strokeWidth='2'
                      className='transition-all duration-150'
                    />

                    <text
                      x={pt.x}
                      y={svgHeight - 8}
                      textAnchor='middle'
                      className={`font-sans text-[11px] font-medium transition-colors ${
                        isHovered
                          ? 'fill-[#3b82f6] font-bold'
                          : 'fill-[#64748b] dark:fill-slate-400'
                      }`}
                    >
                      {pt.day}
                    </text>

                    {isHovered && (
                      <g>
                        <rect
                          x={pt.x - 45}
                          y={pt.y - 36}
                          width='90'
                          height='28'
                          rx='6'
                          fill='#0f172a'
                          className='filter drop-shadow-md'
                        />
                        <text
                          x={pt.x}
                          y={pt.y - 22}
                          textAnchor='middle'
                          fill='#94a3b8'
                          className='text-[9px] font-medium'
                        >
                          {pt.fullDate}
                        </text>
                        <text
                          x={pt.x}
                          y={pt.y - 10}
                          textAnchor='middle'
                          fill='#38bdf8'
                          className='font-mono text-[10.5px] font-bold'
                        >
                          {pt.display}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
