import { Badge } from '@/components/ui/badge';
import {
  AI_ALERT_DOCTYPE,
  INVOICE_DOCTYPE,
  JOURNEY_DOCTYPE,
  OIL_SHIPMENT_DOCTYPE,
  OIL_TANK_DOCTYPE,
  PERMIT_TO_WORK_DOCTYPE,
  RECONCILIATION_DOCTYPE,
  TERMINAL_RECEIPT_DOCTYPE,
} from '@/constants/doctype.string';
import { formatMetricValue } from '@/lib/utils';
import { useFrappeGetDocCount, useFrappeGetDocList } from 'frappe-react-sdk';
import { Radio, Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import {
  ProductMixChart,
  RevenueVsTargetChart,
  ThroughputTrendChart,
} from './components/analytics-charts/index';
import type { Kpi3DCardProps } from './components/kpi-3d-card';
import { Kpi3DCard } from './components/kpi-3d-card';
import { LiveAlerts } from './components/live-alerts';
import { NetworkMap3D } from './components/network-map-3d';

export default function ExecutiveCommand() {
  // 1. Fetch live Frappe counts & document lists
  const { data: journeyCount, isLoading: journeysLoading } = useFrappeGetDocCount(JOURNEY_DOCTYPE);
  const { data: shipmentCount, isLoading: shipmentsLoading } =
    useFrappeGetDocCount(OIL_SHIPMENT_DOCTYPE);
  const { data: permitCount, isLoading: permitLoading } =
    useFrappeGetDocCount(PERMIT_TO_WORK_DOCTYPE);
  const { data: openAlertsCount, isLoading: alertsLoading } = useFrappeGetDocCount(
    AI_ALERT_DOCTYPE,
    [['status', '=', 'Open']]
  );

  // Terminal Receipts for Throughput
  const { data: receipts, isLoading: receiptsLoading } = useFrappeGetDocList(
    TERMINAL_RECEIPT_DOCTYPE,
    {
      fields: ['name', 'net_standard_volume_kl', 'gross_observed_volume_kl'],
      limit: 200,
    }
  );

  // Tanks for Line Fill / Storage
  const { data: tanks, isLoading: tanksLoading } = useFrappeGetDocList(OIL_TANK_DOCTYPE, {
    fields: ['name', 'safe_fill_capacity_kl', 'current_state'],
    limit: 100,
  });

  // Invoices for MTD Revenue
  const { data: invoices, isLoading: invoicesLoading } = useFrappeGetDocList(INVOICE_DOCTYPE, {
    fields: ['name', 'grand_total', 'currency', 'docstatus'],
    limit: 200,
  });

  // Reconciliations for System Loss
  const { data: reconciliations, isLoading: reconLoading } = useFrappeGetDocList(
    RECONCILIATION_DOCTYPE,
    {
      fields: ['name', 'variance_percent', 'variance_kl', 'within_tolerance', 'tolerance_percent'],
      limit: 50,
    }
  );

  // 2. Computed KPI Values with animated count-up numbers and loaders
  const kpis: Kpi3DCardProps[] = useMemo(() => {
    // 1. Throughput today
    let totalThroughput = 0;
    if (receipts && receipts.length > 0) {
      totalThroughput = receipts.reduce(
        (sum, r: any) =>
          sum + (Number(r.net_standard_volume_kl) || Number(r.gross_observed_volume_kl) || 0),
        0
      );
    }
    const throughputVal = formatMetricValue(totalThroughput);

    // 2. Network Line Fill / Capacity
    let totalTankCap = 0;
    if (tanks && tanks.length > 0) {
      totalTankCap = tanks.reduce((sum, t: any) => sum + (Number(t.safe_fill_capacity_kl) || 0), 0);
    }
    const lineFillVal = formatMetricValue(totalTankCap);

    // 3. Revenue MTD
    let totalRev = 0;
    if (invoices && invoices.length > 0) {
      totalRev = invoices.reduce((sum, inv: any) => sum + (Number(inv.grand_total) || 0), 0);
    }
    const revenueVal = formatMetricValue(totalRev, 2);

    // 4. System Loss: normalized loss variance from real Reconciliation records
    let avgVariance = 0;
    if (reconciliations && reconciliations.length > 0) {
      const validRecons = reconciliations.filter(
        (r: any) => Math.abs(Number(r.variance_percent) || 0) <= 5.0
      );
      if (validRecons.length > 0) {
        const sumVar = validRecons.reduce(
          (sum, r: any) => sum + Math.abs(Number(r.variance_percent) || 0),
          0
        );
        avgVariance = sumVar / validRecons.length;
      }
    }
    const lossVal = avgVariance.toFixed(2);

    // 5. Active System Alarms (Live SCADA/AI Anomaly Alarms)
    const activeAlarmsVal = String(openAlertsCount ?? 0);

    return [
      {
        id: 'throughput',
        title: 'Throughput today',
        value: throughputVal,
        unit: 'm³',
        delta:
          receipts && receipts.length > 0
            ? `${receipts.length} batches delivered`
            : '0 batches delivered',
        deltaType: totalThroughput > 0 ? 'up' : 'flat',
        description: 'Total volume pumped across Mombasa–Nairobi trunk lines',
        color: '#4361ee',
        gradient: 'linear-gradient(135deg, rgba(67, 97, 238, 0.88), rgba(106, 139, 255, 0.75))',
        subColor: '#93c5fd',
        isLoading: receiptsLoading,
      },
      {
        id: 'linefill',
        title: 'Network line fill',
        value: lineFillVal,
        unit: 'm³',
        delta:
          tanks && tanks.length > 0 ? `${tanks.length} tanks active` : '0 active storage tanks',
        deltaType: 'flat',
        description: 'Dynamic product pack within Line 1, Line 4 & Line 5',
        color: '#06b6d4',
        gradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.88), rgba(34, 211, 238, 0.75))',
        subColor: '#67e8f9',
        isLoading: tanksLoading,
      },
      {
        id: 'revenue',
        title: 'Revenue MTD',
        value: revenueVal,
        unit: 'KES',
        delta:
          invoices && invoices.length > 0
            ? `${invoices.length} invoices billed`
            : '0 invoices billed',
        deltaType: totalRev > 0 ? 'up' : 'flat',
        description: 'Billed pipeline transport and terminal storage tariffs',
        color: '#10b981',
        gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.88), rgba(52, 211, 153, 0.75))',
        subColor: '#6ee7b7',
        isLoading: invoicesLoading,
      },
      {
        id: 'loss',
        title: 'System loss',
        value: lossVal,
        unit: '%',
        delta:
          reconciliations && reconciliations.length > 0
            ? avgVariance <= 0.2
              ? '▼ under limit (0.20%)'
              : '▲ over limit (0.20%)'
            : 'No variances logged',
        deltaType: avgVariance <= 0.2 ? 'up' : 'down',
        description: 'Total unaccounted variance vs 0.20% allowable threshold',
        color: '#f59e0b',
        gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.88), rgba(251, 191, 36, 0.75))',
        subColor: '#fde047',
        isLoading: reconLoading,
      },
      {
        id: 'safety',
        title: 'Active system alarms',
        value: activeAlarmsVal,
        unit: 'alarms',
        delta:
          openAlertsCount !== undefined
            ? openAlertsCount === 0
              ? '✓ All nominal'
              : '⚠ Action required'
            : 'System nominal',
        deltaType: openAlertsCount === 0 ? 'up' : 'down',
        description: 'Real-time SCADA pressure, flow & vibration alarms',
        color: '#f43f5e',
        gradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.88), rgba(251, 113, 133, 0.75))',
        subColor: '#fda4af',
        isLoading: alertsLoading,
      },
    ];
  }, [
    receipts,
    receiptsLoading,
    tanks,
    tanksLoading,
    invoices,
    invoicesLoading,
    reconciliations,
    reconLoading,
    permitCount,
    permitLoading,
    openAlertsCount,
    alertsLoading,
  ]);

  return (
    <div className='w-full min-w-0 space-y-8 pb-12'>
      {/* Top Page Header */}
      <div className='flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5 '>
        <div>
          <div className='flex items-center gap-2.5'>
            <h1 className='text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl dark:text-foreground'>
              Executive Command
            </h1>
            <Badge
              variant='outline'
              className='gap-1 border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
            >
              <Radio className='size-3 animate-pulse text-emerald-500' />
              Live Operations
            </Badge>
          </div>
          <p className='mt-1 text-sm text-muted-foreground dark:text-muted-foreground'>
            The whole Kenya pipeline network on one unified command center.
          </p>
        </div>

        {/* Live Frappe Status Chips */}
        <div className='flex flex-wrap items-center gap-2 text-xs'>
          {journeyCount !== undefined && (
            <div className='rounded-lg border border-border bg-card px-3 py-1.5 font-medium text-muted-foreground shadow-xs dark:text-slate-300'>
              Journeys <b className='text-foreground dark:text-white'>{journeyCount}</b>
            </div>
          )}
          {shipmentCount !== undefined && (
            <div className='rounded-lg border border-border bg-card px-3 py-1.5 font-medium text-muted-foreground shadow-xs dark:text-slate-300'>
              Shipments <b className='text-foreground dark:text-white'>{shipmentCount}</b>
            </div>
          )}
          <div className='rounded-lg border border-border bg-card px-3 py-1.5 font-medium text-muted-foreground shadow-xs dark:text-slate-300'>
            Shift <b className='text-foreground dark:text-white'>Day A</b>
          </div>
          <div className='rounded-lg border border-border bg-card px-3 py-1.5 font-medium text-muted-foreground shadow-xs dark:text-slate-300'>
            Updated <b className='text-foreground dark:text-white'>just now</b>
          </div>
        </div>
      </div>

      {/* 3D KPI Cards Section */}
      <section className='space-y-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Sparkles className='size-4 text-primary' />
            <h2 className='text-sm font-bold tracking-wide uppercase text-muted-foreground dark:text-slate-400'>
              Operational KPIs · Interactive 3D
            </h2>
          </div>
          <span className='hidden text-xs text-[#93a2bd] sm:inline'>
            ✦ Move cursor over card for 3D parallax tilt • Drag object to rotate
          </span>
        </div>

        {/* 5-Column Responsive 3D Grid with Animated Counters & Loaders */}
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'>
          {kpis.map((kpi) => (
            <Kpi3DCard key={kpi.id} {...kpi} />
          ))}
        </div>
      </section>

      {/* 1. Full-Width Kenya 3D Pipeline Network */}
      <section className='space-y-3'>
        <NetworkMap3D />
      </section>

      {/* 2. Live Alerts & Throughput Trend Section (1 Row on Large Screens) */}
      <section className='grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2'>
        <div className='h-full'>
          <LiveAlerts />
        </div>
        <div className='h-full'>
          <ThroughputTrendChart />
        </div>
      </section>

      {/* 3. Product Mix & Revenue vs Target Section (2 Columns on Large Screens) */}
      <section className='grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2'>
        <div className='h-full'>
          <ProductMixChart />
        </div>
        <div className='h-full'>
          <RevenueVsTargetChart />
        </div>
      </section>
    </div>
  );
}
