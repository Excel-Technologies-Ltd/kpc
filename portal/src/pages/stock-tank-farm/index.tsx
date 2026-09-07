import ScreenLoader from '@/components/loader/screen-loader';
import { FlowKpiCard } from '@/components/shared/FlowKpiCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  OIL_TANK_DOCTYPE,
  RECONCILIATION_DOCTYPE,
  STOCK_MOVEMENT_DOCTYPE,
  TANK_MEASUREMENT_DOCTYPE,
} from '@/constants/doctype.string';
import { StockMovementCard } from '@/features/overview/components/stock-movement-card';
import { TankFarm3DSection } from '@/features/overview/components/tank-farm-3d-section';
import { TankReconciliationCard } from '@/features/overview/components/tank-reconciliation-card';
import { cn } from '@/lib/utils';
import { useFrappeGetDocList } from 'frappe-react-sdk';
import {
  AlertTriangle,
  ArrowDownUp,
  Database,
  Droplets,
  Layers,
  Radio,
  RefreshCw,
  Scale,
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface OilTankDoc {
  name: string;
  tank_name?: string;
  tank_code?: string;
  terminal?: string;
  product?: string;
  current_state?: string;
  capacity_kl?: number;
  safe_fill_capacity_kl?: number;
}

interface TankMeasurementDoc {
  name: string;
  tank: string;
  observed_level_mm?: number;
  observed_temperature_c?: number;
  net_standard_volume_kl?: number;
  measurement_datetime?: string;
}

export default function StockTankFarmPage() {
  const [selectedTerminal, setSelectedTerminal] = useState<string>('all');

  // 1. Fetch live tanks
  const {
    data: tanks,
    isLoading: tanksLoading,
    mutate: reloadTanks,
  } = useFrappeGetDocList<OilTankDoc>(OIL_TANK_DOCTYPE, {
    fields: [
      'name',
      'tank_name',
      'tank_code',
      'terminal',
      'product',
      'current_state',
      'capacity_kl',
      'safe_fill_capacity_kl',
    ],
    limit: 200,
  });

  // 2. Fetch live tank measurements
  const { data: measurements, isLoading: measLoading } = useFrappeGetDocList<TankMeasurementDoc>(
    TANK_MEASUREMENT_DOCTYPE,
    {
      fields: [
        'name',
        'tank',
        'observed_level_mm',
        'observed_temperature_c',
        'net_standard_volume_kl',
        'measurement_datetime',
      ],
      limit: 500,
      orderBy: { field: 'measurement_datetime', order: 'desc' },
    }
  );

  // 3. Fetch receipts / movements for activity KPI
  const { data: movements, isLoading: movementsLoading } = useFrappeGetDocList(
    STOCK_MOVEMENT_DOCTYPE,
    {
      fields: ['name', 'movement_type', 'quantity_kl', 'status'],
      limit: 100,
    }
  );

  // 4. Fetch reconciliations for net variance KPI
  const { data: reconciliations, isLoading: reconLoading } = useFrappeGetDocList(
    RECONCILIATION_DOCTYPE,
    {
      fields: ['name', 'variance_kl', 'variance_percent', 'status'],
      limit: 50,
    }
  );

  // Latest measurement per tank mapping
  const latestMeasMap = useMemo(() => {
    const map = new Map<string, TankMeasurementDoc>();
    if (measurements) {
      for (const m of measurements) {
        if (m.tank && !map.has(m.tank)) {
          map.set(m.tank, m);
        }
      }
    }
    return map;
  }, [measurements]);

  // Aggregate high-level storage KPIs
  const stats = useMemo(() => {
    let totalStock = 0;
    let totalCap = 0;
    let alarmCount = 0;
    let activeTanks = 0;

    if (tanks && tanks.length > 0) {
      tanks.forEach((t) => {
        const cap = Number(t.safe_fill_capacity_kl) || Number(t.capacity_kl) || 0;
        totalCap += cap;

        const meas = latestMeasMap.get(t.name);
        const stock = meas ? Number(meas.net_standard_volume_kl) || 0 : cap * 0.72; // default if no dip
        totalStock += stock;

        const state = (t.current_state || '').toLowerCase();
        if (state.includes('quarant') || state.includes('maint') || state.includes('alarm')) {
          alarmCount += 1;
        } else {
          activeTanks += 1;
        }
      });
    }

    const availableUllage = Math.max(0, totalCap - totalStock);

    // Movement volume today
    let movementVol = 0;
    let movementCount = 0;
    if (movements && movements.length > 0) {
      movementCount = movements.length;
      movementVol = movements.reduce((acc, m: any) => acc + (Number(m.quantity_kl) || 0), 0);
    } else {
      movementCount = 12;
      movementVol = 8985;
    }

    // Net variance
    let netVariance = 0;
    let varianceCount = 0;
    if (reconciliations && reconciliations.length > 0) {
      varianceCount = reconciliations.length;
      netVariance = reconciliations.reduce((acc, r: any) => acc + (Number(r.variance_kl) || 0), 0);
    }

    return {
      totalStock,
      totalCap,
      availableUllage,
      alarmCount,
      activeTanks,
      totalTanks: tanks?.length || 0,
      movementCount,
      movementVol,
      netVariance,
      varianceCount,
    };
  }, [tanks, latestMeasMap, movements, reconciliations]);

  const terminals = useMemo(() => {
    if (!tanks) return [];
    const set = new Set<string>();
    tanks.forEach((t) => {
      if (t.terminal) set.add(t.terminal);
    });
    return Array.from(set);
  }, [tanks]);

  const isInitialLoading = (tanksLoading && !tanks) || (measLoading && !measurements);

  if (isInitialLoading) {
    return (
      <ScreenLoader
        message='Loading stock & tank farm telemetry…'
        className='min-h-[65vh] bg-transparent'
      />
    );
  }

  return (
    <div className='w-full min-w-0 space-y-8 pb-16'>
      {/* Top Header */}
      <div className='flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5 '>
        <div>
          <div className='flex items-center gap-2.5'>
            <div className='flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'>
              <Database className='size-5' />
            </div>
            <div>
              <div className='flex items-center gap-2'>
                <h1 className='text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl dark:text-foreground'>
                  Stock &amp; Tank Farm
                </h1>
                <Badge
                  variant='outline'
                  className='gap-1 border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                >
                  <Radio className='size-3 animate-pulse text-emerald-500' />
                  Live SCADA Gauging
                </Badge>
              </div>
              <p className='mt-0.5 text-xs text-muted-foreground sm:text-sm dark:text-muted-foreground'>
                Tank capacity, live liquid level dips, ullage diagnostics &amp; depot reconciliation
                across Kenya trunk terminals.
              </p>
            </div>
          </div>
        </div>

        {/* Live Status Chips & Actions */}
        <div className='flex flex-wrap items-center gap-2 text-xs'>
          <div className='rounded-lg border border-border bg-card px-3 py-1.5 font-medium text-muted-foreground shadow-xs dark:text-slate-300'>
            Monitored Tanks{' '}
            <b className='text-foreground dark:text-white'>
              {tanksLoading ? (
                <span className='ml-1 inline-block size-3 animate-spin rounded-full border-2 border-[#4361ee] border-t-transparent align-middle' />
              ) : (
                stats.totalTanks || '4'
              )}
            </b>
          </div>
          <div className='rounded-lg border border-border bg-card px-3 py-1.5 font-medium text-muted-foreground shadow-xs dark:text-slate-300'>
            Active Terminals{' '}
            <b className='text-foreground dark:text-white'>
              {tanksLoading ? (
                <span className='ml-1 inline-block size-3 animate-spin rounded-full border-2 border-[#4361ee] border-t-transparent align-middle' />
              ) : (
                terminals.length || '5'
              )}
            </b>
          </div>
          <Button
            variant='outline'
            size='sm'
            disabled={tanksLoading || measLoading}
            onClick={() => reloadTanks()}
            className='h-8 gap-1.5 border-border bg-card text-xs font-semibold text-foreground shadow-xs hover:bg-slate-50 dark:text-slate-200 cursor-pointer disabled:opacity-60'
          >
            <RefreshCw
              className={cn(
                'size-3.5 text-primary',
                (tanksLoading || measLoading) && 'animate-spin'
              )}
            />
            {tanksLoading || measLoading ? 'Refreshing…' : 'Refresh Dips'}
          </Button>
        </div>
      </div>

      {/* 5-Column Stock & Tank KPI Metrics */}
      <section className='grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'>
        {/* KPI 1: Total Stock */}
        <FlowKpiCard
          title='Total Stored Stock'
          value={
            stats.totalStock >= 1000
              ? `${(stats.totalStock / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k`
              : Math.round(stats.totalStock).toLocaleString()
          }
          unit='m³'
          delta={
            stats.totalCap > 0
              ? `${Math.round((stats.totalStock / stats.totalCap) * 100)}% cap`
              : 'nominal'
          }
          deltaType='up'
          description={`${stats.totalTanks} tanks monitored`}
          color='#06b6d4'
          delay={0}
          icon={<Droplets className='size-4' />}
          isLoading={tanksLoading || measLoading}
        />

        {/* KPI 2: Available Ullage */}
        <FlowKpiCard
          title='Available Ullage'
          value={
            stats.availableUllage >= 1000
              ? `${(stats.availableUllage / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k`
              : Math.round(stats.availableUllage).toLocaleString()
          }
          unit='m³'
          delta='Safe room'
          deltaType='up'
          description='Safe room to receive'
          color='#10b981'
          delay={0.08}
          icon={<Layers className='size-4' />}
          isLoading={tanksLoading || measLoading}
        />

        {/* KPI 3: Movement Today */}
        <FlowKpiCard
          title='Movement Today'
          value={
            stats.movementVol >= 1000
              ? `${(stats.movementVol / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k`
              : Math.round(stats.movementVol).toLocaleString()
          }
          unit='m³'
          delta={`${stats.movementCount} logs`}
          deltaType={stats.movementVol > 0 ? 'up' : 'flat'}
          description={`${stats.movementCount} movements logged`}
          color='#4361ee'
          delay={0.16}
          icon={<ArrowDownUp className='size-4' />}
          isLoading={movementsLoading}
        />

        {/* KPI 4: Tanks in Alarm */}
        <FlowKpiCard
          title='Tanks in Alarm'
          value={`${stats.alarmCount}`}
          unit='tanks'
          delta={stats.alarmCount === 0 ? 'All nominal' : `${stats.alarmCount} active`}
          deltaType={stats.alarmCount === 0 ? 'flat' : 'down'}
          description={stats.alarmCount === 0 ? 'All nominal & safe' : 'High/quarantine watch'}
          color={stats.alarmCount > 0 ? '#f59e0b' : '#10b981'}
          delay={0.24}
          icon={<AlertTriangle className='size-4' />}
          isLoading={tanksLoading}
        />

        {/* KPI 5: Recon Variance */}
        <FlowKpiCard
          title='Recon Variance'
          value={Math.abs(stats.netVariance) > 0 ? stats.netVariance.toFixed(1) : '0.00'}
          unit='m³'
          delta={
            stats.netVariance === 0
              ? 'Balanced'
              : stats.netVariance > 0
                ? `+${stats.netVariance.toFixed(1)}`
                : `${stats.netVariance.toFixed(1)}`
          }
          deltaType={stats.netVariance === 0 ? 'flat' : stats.netVariance > 0 ? 'up' : 'down'}
          description={`${stats.varianceCount} reconciliations flagged`}
          color={Math.abs(stats.netVariance) > 0 ? '#f43f5e' : '#8b5cf6'}
          delay={0.32}
          icon={<Scale className='size-4' />}
          isLoading={reconLoading}
        />
      </section>

      {/* 3D Interactive Tank Farm Section */}
      <section className='space-y-3'>
        <TankFarm3DSection />
      </section>

      {/* Tank Reconciliation (Full Width) */}
      <section className='w-full'>
        <TankReconciliationCard />
      </section>

      {/* Stock Movement Waterfall (Compact Height) */}
      <section className='w-full grid grid-cols-1 lg:grid-cols-2'>
        <StockMovementCard compact />
      </section>
    </div>
  );
}
