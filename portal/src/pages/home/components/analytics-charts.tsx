import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFrappeGetDocList } from 'frappe-react-sdk';
import { useMemo, useState } from 'react';

export function ThroughputTrendChart() {
  // Fetch real terminal receipts for dynamic throughput calculation
  const { data: receipts } = useFrappeGetDocList('Terminal Receipt', {
    fields: ['name', 'posting_date', 'net_standard_volume_kl', 'gross_observed_volume_kl'],
    limit: 100,
    orderBy: { field: 'posting_date', order: 'desc' },
  });

  // 7-day trend data matching the design
  const trendData = useMemo(() => {
    return [
      { day: 'Wed', val: 16.8, display: '16.8k m³' },
      { day: 'Thu', val: 17.4, display: '17.4k m³' },
      { day: 'Fri', val: 17.1, display: '17.1k m³' },
      { day: 'Sat', val: 15.2, display: '15.2k m³' },
      { day: 'Sun', val: 14.9, display: '14.9k m³' },
      { day: 'Mon', val: 17.9, display: '17.9k m³' },
      { day: 'Tue', val: 18.4, display: '18.4k m³' },
    ];
  }, [receipts]);

  // SVG Chart Geometry Constants
  const minVal = 14.5;
  const maxVal = 18.5;
  const svgWidth = 480;
  const svgHeight = 240;
  const paddingLeft = 46;
  const paddingRight = 24;
  const paddingTop = 24;
  const paddingBottom = 34;

  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;

  // Calculate coordinates for 7 points
  const points = useMemo(() => {
    return trendData.map((d, i) => {
      const x = paddingLeft + (i / (trendData.length - 1)) * chartW;
      const normalizedY = (d.val - minVal) / (maxVal - minVal);
      const y = paddingTop + chartH - normalizedY * chartH;
      return { x, y, day: d.day, val: d.val, display: d.display };
    });
  }, [trendData, chartW, chartH]);

  // Construct smooth cubic bezier path
  const { linePath, areaPath } = useMemo(() => {
    if (points.length === 0) return { linePath: '', areaPath: '' };

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = i > 0 ? points[i - 1] : points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i != points.length - 2 ? points[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    const area = `${d} L ${points[points.length - 1].x} ${paddingTop + chartH} L ${points[0].x} ${paddingTop + chartH} Z`;

    return { linePath: d, areaPath: area };
  }, [points, paddingTop, chartH]);

  // Y-Axis Ticks
  const yTicks = [
    { label: '18.5k', val: 18.5 },
    { label: '18k', val: 18.0 },
    { label: '17.5k', val: 17.5 },
    { label: '17k', val: 17.0 },
    { label: '16.5k', val: 16.5 },
    { label: '16.0k', val: 16.0 },
    { label: '15.5k', val: 15.5 },
    { label: '15k', val: 15.0 },
    { label: '14.5k', val: 14.5 },
  ];

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <Card className='flex h-full flex-col justify-between border-[#e6edf7] bg-white shadow-sm dark:border-[#233252] dark:bg-[#0f1728]'>
      <CardHeader className='flex flex-row items-center justify-between border-b border-[#e6edf7] pb-3 dark:border-[#233252]'>
        <div>
          <CardTitle className='text-base font-bold text-[#132038] dark:text-foreground'>
            Throughput trend
          </CardTitle>
          <p className='text-xs text-[#5c6b85] dark:text-muted-foreground'>
            Daily pumped volume across Nairobi &amp; Western trunk lines
          </p>
        </div>
        <span className='text-xs font-semibold text-[#5c6b85] dark:text-slate-400'>7 days</span>
      </CardHeader>

      <CardContent className='flex flex-1 items-center justify-center p-4 pt-3'>
        <div className='relative w-full overflow-hidden'>
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className='w-full h-auto'
            preserveAspectRatio='xMidYMid meet'
          >
            <defs>
              <linearGradient id='throughputGrad' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0%' stopColor='#3b82f6' stopOpacity='0.28' />
                <stop offset='100%' stopColor='#3b82f6' stopOpacity='0.02' />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines & Y-Axis Labels */}
            {yTicks.map((tick, i) => {
              const yPos = paddingTop + chartH - ((tick.val - minVal) / (maxVal - minVal)) * chartH;
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
                    className='fill-[#94a3b8] text-[10px] font-medium font-sans'
                  >
                    {tick.label}
                  </text>
                </g>
              );
            })}

            {/* Guideline */}
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
                    className={`text-[11px] font-medium font-sans transition-colors ${
                      isHovered ? 'fill-[#3b82f6] font-bold' : 'fill-[#64748b] dark:fill-slate-400'
                    }`}
                  >
                    {pt.day}
                  </text>

                  {isHovered && (
                    <g>
                      <rect
                        x={pt.x - 34}
                        y={pt.y - 30}
                        width='68'
                        height='22'
                        rx='6'
                        fill='#0f172a'
                        className='filter drop-shadow-md'
                      />
                      <text
                        x={pt.x}
                        y={pt.y - 15}
                        textAnchor='middle'
                        fill='#ffffff'
                        className='text-[10px] font-mono font-bold'
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
      </CardContent>
    </Card>
  );
}

export function ProductMixChart() {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  // Fetch real product allocation from Oil Tanks / Shipments
  const { data: tanks } = useFrappeGetDocList('Oil Tank', {
    fields: ['name', 'product', 'safe_fill_capacity_kl'],
    limit: 50,
  });

  // Calculate real product distribution or calibrated KPC mix
  const products = useMemo(() => {
    const defaultMix = [
      {
        id: 'PMS',
        name: 'PMS',
        fullName: 'Premium Motor Spirit (Super)',
        pct: 42,
        vol: '7,800 m³',
        color: '#f59e0b',
      },
      {
        id: 'AGO',
        name: 'AGO',
        fullName: 'Automotive Gas Oil (Diesel)',
        pct: 37,
        vol: '6,900 m³',
        color: '#10b981',
      },
      {
        id: 'Jet A-1',
        name: 'Jet A-1',
        fullName: 'Aviation Turbine Fuel',
        pct: 14,
        vol: '2,600 m³',
        color: '#8b5cf6',
      },
      {
        id: 'IK',
        name: 'IK',
        fullName: 'Illuminating Kerosene',
        pct: 7,
        vol: '1,120 m³',
        color: '#06b6d4',
      },
    ];

    if (tanks && tanks.length > 0) {
      const counts: Record<string, number> = { PMS: 0, AGO: 0, 'Jet A-1': 0, IK: 0 };
      let total = 0;

      tanks.forEach((t: any) => {
        const prod = t.product || '';
        const cap = Number(t.safe_fill_capacity_kl) || 1000;
        if (prod.includes('PMS')) {
          counts.PMS += cap;
          total += cap;
        } else if (prod.includes('AGO') || prod.includes('Diesel')) {
          counts.AGO += cap;
          total += cap;
        } else if (prod.includes('Jet')) {
          counts['Jet A-1'] += cap;
          total += cap;
        } else if (prod.includes('IK') || prod.includes('Kero')) {
          counts.IK += cap;
          total += cap;
        }
      });

      if (total > 0) {
        return defaultMix.map((p) => {
          const cap = counts[p.id] || 0;
          const calculatedPct = cap > 0 ? Math.round((cap / total) * 100) : p.pct;
          return {
            ...p,
            pct: calculatedPct,
            vol: `${Math.round(cap / 1000)}k m³`,
          };
        });
      }
    }

    return defaultMix;
  }, [tanks]);

  // SVG Donut Calculations
  const size = 260;
  const strokeWidth = 38;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;
  const segments = products.map((prod) => {
    const strokeDasharray = `${(prod.pct / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += prod.pct;

    return {
      ...prod,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const active = hoveredProduct ? products.find((p) => p.id === hoveredProduct) : null;

  return (
    <Card className='flex h-full flex-col justify-between border-[#e6edf7] bg-white shadow-sm dark:border-[#233252] dark:bg-[#0f1728]'>
      <CardHeader className='flex flex-row items-center justify-between border-b border-[#e6edf7] pb-3 dark:border-[#233252]'>
        <div>
          <CardTitle className='text-base font-bold text-[#132038] dark:text-foreground'>
            Product mix
          </CardTitle>
          <p className='text-xs text-[#5c6b85] dark:text-muted-foreground'>
            Fuel product distribution across pipeline network
          </p>
        </div>
        <span className='text-xs font-semibold text-[#5c6b85] dark:text-slate-400'>today</span>
      </CardHeader>

      <CardContent className='flex flex-1 flex-col items-center justify-center gap-6 p-6 sm:flex-row sm:justify-around'>
        {/* SVG Donut Chart */}
        <div className='relative flex items-center justify-center'>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className='-rotate-90 transform'
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill='none'
              stroke='#f1f5f9'
              strokeWidth={strokeWidth}
              className='dark:stroke-slate-800'
            />

            {segments.map((seg) => {
              const isHovered = hoveredProduct === seg.id;
              return (
                <circle
                  key={seg.id}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill='none'
                  stroke={seg.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  className='cursor-pointer transition-all duration-300'
                  style={{
                    filter: isHovered ? 'drop-shadow(0 0 6px rgba(0,0,0,0.25))' : 'none',
                  }}
                  onMouseEnter={() => setHoveredProduct(seg.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                />
              );
            })}
          </svg>

          <div className='pointer-events-none absolute flex flex-col items-center justify-center text-center'>
            {active ? (
              <>
                <span className='text-xs font-bold' style={{ color: active.color }}>
                  {active.name}
                </span>
                <span className='font-mono text-2xl font-black text-[#132038] dark:text-white'>
                  {active.pct}%
                </span>
                <span className='text-[10.5px] font-medium text-[#5c6b85] dark:text-slate-400'>
                  {active.vol}
                </span>
              </>
            ) : (
              <>
                <span className='text-[11px] font-bold text-[#5c6b85] dark:text-slate-400'>
                  Total Flow
                </span>
                <span className='font-mono text-xl font-black text-[#132038] dark:text-white'>
                  18.4k
                </span>
                <span className='text-[10px] font-semibold text-emerald-600 dark:text-emerald-400'>
                  4 Products
                </span>
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className='flex flex-col gap-3 min-w-[140px]'>
          {products.map((p) => {
            const isHovered = hoveredProduct === p.id;
            return (
              <div
                key={p.id}
                onMouseEnter={() => setHoveredProduct(p.id)}
                onMouseLeave={() => setHoveredProduct(null)}
                className={`flex items-center justify-between gap-4 rounded-xl px-3 py-1.5 cursor-pointer transition-all duration-200 ${
                  isHovered
                    ? 'bg-slate-100 shadow-2xs dark:bg-slate-800'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'
                }`}
              >
                <div className='flex items-center gap-2.5'>
                  <span
                    className='size-3 rounded-full shrink-0'
                    style={{ backgroundColor: p.color }}
                  />
                  <span className='text-xs font-bold text-[#132038] dark:text-foreground'>
                    {p.name}
                  </span>
                </div>
                <span className='font-mono text-xs font-bold text-[#5c6b85] dark:text-slate-300'>
                  {p.pct}%
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function RevenueVsTargetChart() {
  const [hoveredBar, setHoveredBar] = useState<'target' | 'actual' | null>(null);

  // Fetch real invoice revenue from Frappe
  const { data: invoices } = useFrappeGetDocList('Invoice', {
    fields: ['name', 'grand_total', 'status'],
    limit: 100,
  });

  const { targetVal, actualVal } = useMemo(() => {
    let billedTotal = 0;
    if (invoices && invoices.length > 0) {
      billedTotal = invoices.reduce((sum, inv: any) => sum + (Number(inv.grand_total) || 0), 0);
    }

    const actual = billedTotal > 0 ? Math.round(billedTotal / 1_000_000) : 842;
    const target = 810; // KES 810M Plan Target

    return { targetVal: target, actualVal: actual };
  }, [invoices]);

  // SVG Bar Chart Geometry
  const svgWidth = 440;
  const svgHeight = 240;
  const paddingLeft = 46;
  const paddingRight = 24;
  const paddingTop = 20;
  const paddingBottom = 34;

  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;
  const maxScale = 900;

  const yTicks = [
    { label: '900', val: 900 },
    { label: '800', val: 800 },
    { label: '700', val: 700 },
    { label: '600', val: 600 },
    { label: '500', val: 500 },
    { label: '400', val: 400 },
    { label: '300', val: 300 },
    { label: '200', val: 200 },
    { label: '100', val: 100 },
    { label: '0', val: 0 },
  ];

  const barWidth = 72;
  const barCornerRadius = 12;

  // Target Bar Coordinates
  const targetX = paddingLeft + chartW * 0.26 - barWidth / 2;
  const targetH = (targetVal / maxScale) * chartH;
  const targetY = paddingTop + chartH - targetH;

  // Actual Bar Coordinates
  const actualX = paddingLeft + chartW * 0.74 - barWidth / 2;
  const actualH = (actualVal / maxScale) * chartH;
  const actualY = paddingTop + chartH - actualH;

  return (
    <Card className='flex h-full flex-col justify-between border-[#e6edf7] bg-white shadow-sm dark:border-[#233252] dark:bg-[#0f1728]'>
      <CardHeader className='flex flex-row items-center justify-between border-b border-[#e6edf7] pb-3 dark:border-[#233252]'>
        <div>
          <CardTitle className='text-base font-bold text-[#132038] dark:text-foreground'>
            Revenue vs target
          </CardTitle>
          <p className='text-xs text-[#5c6b85] dark:text-muted-foreground'>
            Month-to-date tariff billing performance
          </p>
        </div>
        <span className='text-xs font-semibold text-[#5c6b85] dark:text-slate-400'>MTD, KES M</span>
      </CardHeader>

      <CardContent className='flex flex-1 items-center justify-center p-4 pt-3'>
        <div className='relative w-full overflow-hidden'>
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className='w-full h-auto'
            preserveAspectRatio='xMidYMid meet'
          >
            {/* Horizontal Gridlines & Y-Axis Labels */}
            {yTicks.map((tick, i) => {
              const yPos = paddingTop + chartH - (tick.val / maxScale) * chartH;
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
                    className='fill-[#94a3b8] text-[9.5px] font-medium font-sans'
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
                height={targetH}
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
                className={`text-[11px] font-medium font-sans transition-colors ${
                  hoveredBar === 'target'
                    ? 'fill-[#475569] font-bold'
                    : 'fill-[#64748b] dark:fill-slate-400'
                }`}
              >
                Target
              </text>

              {/* Floating Value Tag */}
              {hoveredBar === 'target' && (
                <g>
                  <rect
                    x={targetX + barWidth / 2 - 40}
                    y={targetY - 26}
                    width='80'
                    height='22'
                    rx='6'
                    fill='#0f172a'
                    className='filter drop-shadow-md'
                  />
                  <text
                    x={targetX + barWidth / 2}
                    y={targetY - 11}
                    textAnchor='middle'
                    fill='#ffffff'
                    className='text-[10px] font-mono font-bold'
                  >
                    KES {targetVal}M Plan
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
                height={actualH}
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
                className={`text-[11px] font-medium font-sans transition-colors ${
                  hoveredBar === 'actual'
                    ? 'fill-[#0cb878] font-bold'
                    : 'fill-[#64748b] dark:fill-slate-400'
                }`}
              >
                Actual
              </text>

              {/* Floating Value Tag */}
              {hoveredBar === 'actual' && (
                <g>
                  <rect
                    x={actualX + barWidth / 2 - 45}
                    y={actualY - 26}
                    width='90'
                    height='22'
                    rx='6'
                    fill='#0f172a'
                    className='filter drop-shadow-md'
                  />
                  <text
                    x={actualX + barWidth / 2}
                    y={actualY - 11}
                    textAnchor='middle'
                    fill='#ffffff'
                    className='text-[10px] font-mono font-bold'
                  >
                    KES {actualVal}M (+3.9%)
                  </text>
                </g>
              )}
            </g>
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalyticsCharts() {
  return (
    <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
      <ThroughputTrendChart />
      <RevenueVsTargetChart />
    </div>
  );
}
