import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useFrappeGetDocList } from 'frappe-react-sdk';
import { Layers, PieChart } from 'lucide-react';
import { useMemo, useState } from 'react';

// ============================================================================
// 2. PRODUCT MIX CHART (Live Distribution from Oil Tanks / Pipeline Batches)
// ============================================================================
export function ProductMixChart() {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  // Fetch real Oil Tanks
  const { data: tanks, isLoading: tanksLoading } = useFrappeGetDocList('Oil Tank', {
    fields: [
      'name',
      'tank_code',
      'tank_name',
      'product',
      'safe_fill_capacity_kl',
      'capacity_kl',
      'current_state',
    ],
    limit: 200,
  });

  // Fetch real Pipeline Batches for supplemental product volume
  const { data: batches, isLoading: batchesLoading } = useFrappeGetDocList('Pipeline Batch', {
    fields: ['name', 'product', 'planned_volume_kl'],
    limit: 200,
  });

  // Fetch real Allocations
  const { data: allocations, isLoading: allocationsLoading } = useFrappeGetDocList('Allocation', {
    fields: ['name', 'product', 'allocated_quantity_kl'],
    limit: 200,
  });

  const isLoading = tanksLoading || batchesLoading || allocationsLoading;

  // Color mapping helper for standard petroleum items
  const getProductColor = (productName: string, index: number) => {
    const p = (productName || '').toUpperCase();
    if (
      p.includes('PMS') ||
      p.includes('SUPER') ||
      p.includes('PETROL') ||
      p.includes('GASOLINE')
    ) {
      return '#f59e0b'; // Amber
    }
    if (p.includes('AGO') || p.includes('DIESEL') || p.includes('GAS OIL')) {
      return '#10b981'; // Emerald
    }
    if (p.includes('JET') || p.includes('AVTUR') || p.includes('AVIATION')) {
      return '#8b5cf6'; // Purple
    }
    if (p.includes('IK') || p.includes('KEROSENE') || p.includes('ILLUMINATING')) {
      return '#06b6d4'; // Cyan
    }
    if (p.includes('HFO') || p.includes('HEAVY') || p.includes('FURNACE')) {
      return '#ef4444'; // Red
    }
    const palette = ['#3b82f6', '#ec4899', '#14b8a6', '#f97316', '#6366f1'];
    return palette[index % palette.length];
  };

  // Compute live product capacity and distribution
  const { products, totalCapacity } = useMemo(() => {
    const productMap = new Map<string, { totalVolume: number; count: number }>();

    // 1. Group by Oil Tank dedicated products
    if (tanks && tanks.length > 0) {
      tanks.forEach((t: any) => {
        const prod = t.product || 'Unassigned / Multi-product';
        const cap = Number(t.safe_fill_capacity_kl) || Number(t.capacity_kl) || 0;
        const current = productMap.get(prod) || { totalVolume: 0, count: 0 };
        current.totalVolume += cap;
        current.count += 1;
        productMap.set(prod, current);
      });
    }

    // 2. If tanks have no product assignments, fallback to Allocations / Batches
    if (
      productMap.size === 0 ||
      Array.from(productMap.values()).every((v) => v.totalVolume === 0)
    ) {
      if (allocations && allocations.length > 0) {
        allocations.forEach((a: any) => {
          const prod = a.product || 'Allocated Product';
          const vol = Number(a.allocated_quantity_kl) || 0;
          const current = productMap.get(prod) || { totalVolume: 0, count: 0 };
          current.totalVolume += vol;
          current.count += 1;
          productMap.set(prod, current);
        });
      } else if (batches && batches.length > 0) {
        batches.forEach((b: any) => {
          const prod = b.product || 'Pipeline Product';
          const vol = Number(b.planned_volume_kl) || 0;
          const current = productMap.get(prod) || { totalVolume: 0, count: 0 };
          current.totalVolume += vol;
          current.count += 1;
          productMap.set(prod, current);
        });
      }
    }

    const total = Array.from(productMap.values()).reduce((sum, v) => sum + v.totalVolume, 0);

    // Convert to sorted product array
    const sortedProducts = Array.from(productMap.entries())
      .map(([name, data], idx) => {
        const pct = total > 0 ? Math.round((data.totalVolume / total) * 100) : 0;
        const volDisplay =
          data.totalVolume >= 1000
            ? `${(data.totalVolume / 1000).toFixed(1)}k m³`
            : `${Math.round(data.totalVolume).toLocaleString()} m³`;

        return {
          id: name,
          name: name.replace(/-DIESEL|-PETROL|-SUPER/gi, ''),
          fullName: name,
          pct,
          vol: volDisplay,
          rawVol: data.totalVolume,
          color: getProductColor(name, idx),
          count: data.count,
        };
      })
      .sort((a, b) => b.rawVol - a.rawVol);

    return {
      products: sortedProducts,
      totalCapacity: total,
    };
  }, [tanks, batches, allocations]);

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
          <div className='flex items-center gap-2'>
            <PieChart className='size-4 text-[#10b981]' />
            <CardTitle className='text-base font-bold text-[#132038] dark:text-foreground'>
              Product mix
            </CardTitle>
          </div>
          <p className='text-xs text-[#5c6b85] dark:text-muted-foreground'>
            Live fuel product distribution across pipeline network tanks
          </p>
        </div>
        <Badge
          variant='outline'
          className='border-emerald-200 bg-emerald-50/60 font-mono text-[11px] font-bold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
        >
          {products.length} {products.length === 1 ? 'Product' : 'Products'}
        </Badge>
      </CardHeader>

      <CardContent className='flex flex-1 flex-col items-center justify-center gap-6 p-6 sm:flex-row sm:justify-around'>
        {isLoading ? (
          <div className='flex w-full items-center justify-center gap-6 py-6'>
            <Skeleton className='size-48 rounded-full' />
            <div className='space-y-2'>
              <Skeleton className='h-6 w-28' />
              <Skeleton className='h-6 w-24' />
              <Skeleton className='h-6 w-20' />
            </div>
          </div>
        ) : products.length === 0 || totalCapacity === 0 ? (
          <div className='flex flex-col items-center justify-center py-12 text-center'>
            <Layers className='mb-2 size-8 text-slate-300 dark:text-slate-600' />
            <p className='text-sm font-semibold text-slate-600 dark:text-slate-300'>
              No storage tank data available
            </p>
            <p className='text-xs text-slate-400'>
              Create Oil Tanks or Pipeline Batches in Petroleum Operations
            </p>
          </div>
        ) : (
          <>
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

              <div className='pointer-events-none absolute flex flex-col items-center justify-center text-center px-4'>
                {active ? (
                  <>
                    <span
                      className='truncate max-w-30 text-xs font-bold'
                      style={{ color: active.color }}
                    >
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
                      Total Volume
                    </span>
                    <span className='font-mono text-xl font-black text-[#132038] dark:text-white'>
                      {totalCapacity >= 1000
                        ? `${(totalCapacity / 1000).toFixed(1)}k`
                        : Math.round(totalCapacity).toLocaleString()}
                    </span>
                    <span className='text-[10px] font-semibold text-emerald-600 dark:text-emerald-400'>
                      {products.length} {products.length === 1 ? 'Product' : 'Products'} Active
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Legend */}
            <div className='flex min-w-37.5 flex-col gap-2.5'>
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
                    <div className='flex items-center gap-2.5 overflow-hidden'>
                      <span
                        className='size-3 rounded-full shrink-0'
                        style={{ backgroundColor: p.color }}
                      />
                      <span
                        className='truncate max-w-27.5 text-xs font-bold text-[#132038] dark:text-foreground'
                        title={p.fullName}
                      >
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
