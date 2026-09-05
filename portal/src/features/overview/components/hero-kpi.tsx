import { Card, CardContent } from '@/components/ui/card';
import { useFrappeGetDocList } from 'frappe-react-sdk';
import { useMemo } from 'react';
import { KpiCard } from './kpi-card';

const IconJourneys = () => (
  <svg
    width='40'
    height='40'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.6'
    strokeLinecap='round'
    strokeLinejoin='round'
    className='text-muted-foreground'
  >
    <polyline points='22 12 18 12 15 21 9 3 6 12 2 12' />
  </svg>
);

const IconVolume = () => (
  <svg
    width='40'
    height='40'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.6'
    strokeLinecap='round'
    strokeLinejoin='round'
    className='text-muted-foreground'
  >
    <rect x='2' y='3' width='4' height='18' rx='1' fill='currentColor' fillOpacity='0.3' />
    <rect x='10' y='8' width='4' height='13' rx='1' fill='currentColor' fillOpacity='0.5' />
    <rect x='18' y='5' width='4' height='16' rx='1' fill='currentColor' fillOpacity='0.7' />
  </svg>
);

const IconPipeline = () => (
  <svg
    width='40'
    height='40'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.6'
    strokeLinecap='round'
    strokeLinejoin='round'
    className='text-muted-foreground'
  >
    <path d='M3 6h18M3 12h18M3 18h18' />
    <circle cx='18' cy='6' r='2.5' fill='currentColor' stroke='none' opacity='0.9' />
    <circle cx='6' cy='12' r='2.5' fill='currentColor' stroke='none' opacity='0.7' />
    <circle cx='14' cy='18' r='2.5' fill='currentColor' stroke='none' opacity='0.5' />
  </svg>
);

const IconAlert = () => (
  <svg
    width='40'
    height='40'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.6'
    strokeLinecap='round'
    strokeLinejoin='round'
    className='text-muted-foreground'
  >
    <path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' fill='currentColor' fillOpacity='0.2' />
    <path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' />
    <path d='M13.73 21a2 2 0 0 1-3.46 0' />
  </svg>
);

const IconVariance = () => (
  <svg
    width='40'
    height='40'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.6'
    strokeLinecap='round'
    strokeLinejoin='round'
    className='text-muted-foreground'
  >
    <path d='M12 2L2 7l10 5 10-5-10-5z' fill='currentColor' fillOpacity='0.3' />
    <path d='M2 17l10 5 10-5' />
    <path d='M2 12l10 5 10-5' />
  </svg>
);

const IconInvoice = () => (
  <svg
    width='40'
    height='40'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.6'
    strokeLinecap='round'
    strokeLinejoin='round'
    className='text-muted-foreground'
  >
    <line x1='12' y1='1' x2='12' y2='23' />
    <path d='M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
  </svg>
);

export function HeroKpi() {
  const { data: journeys, isLoading: journeyLoading } = useFrappeGetDocList('Journey', {
    fields: ['name', 'status', 'current_step'],
    limit: 500,
  });

  const { data: terminalReceipts, isLoading: receiptsLoading } = useFrappeGetDocList(
    'Terminal Receipt',
    {
      fields: ['name', 'net_standard_volume_kl', 'gross_observed_volume_kl', 'receipt_datetime'],
      limit: 500,
    }
  );

  const { data: shipments } = useFrappeGetDocList('Oil Shipment', {
    fields: ['name', 'planned_quantity_kl', 'workflow_state'],
    limit: 500,
  });

  const { data: pipelineBatches, isLoading: pipelineLoading } = useFrappeGetDocList(
    'Pipeline Batch',
    {
      fields: ['name', 'planned_volume_kl', 'docstatus'],
      limit: 500,
    }
  );

  const { data: openAlerts, isLoading: alertsLoading } = useFrappeGetDocList('AI Alert', {
    fields: ['name', 'status', 'severity', 'anomaly_score'],
    filters: [['status', '=', 'Open']],
    limit: 500,
  });

  const { data: reconciliations, isLoading: reconLoading } = useFrappeGetDocList('Reconciliation', {
    fields: ['name', 'variance_percent', 'variance_kl', 'within_tolerance', 'tolerance_percent'],
    limit: 100,
  });

  const { data: invoices, isLoading: invoiceLoading } = useFrappeGetDocList('Invoice', {
    fields: ['name', 'grand_total', 'currency', 'posting_date'],
    limit: 500,
  });

  const { data: tanks, isLoading: tanksLoading } = useFrappeGetDocList('Oil Tank', {
    fields: ['name', 'safe_fill_capacity_kl', 'current_state'],
    filters: [['current_state', '!=', 'Decommissioned']],
    limit: 100,
  });

  const { data: inventoryPositions, isLoading: inventoryLoading } = useFrappeGetDocList(
    'Inventory Position',
    {
      fields: ['name', 'tank', 'position_date', 'closing_volume_kl'],
      orderBy: { field: 'position_date', order: 'desc' },
      limit: 500,
    }
  );

  const { data: movements, isLoading: movementsLoading } = useFrappeGetDocList('Movement', {
    fields: ['name', 'pipeline_batch', 'movement_status', 'start_datetime'],
    filters: [['movement_status', 'in', ['In Transit', 'Completed']]],
    limit: 500,
  });

  const activeJourneys = useMemo(() => {
    if (!journeys) return [];
    return journeys.filter(
      (j: any) => j.status === 'Active' || !['Completed', 'Cancelled'].includes(j.status)
    );
  }, [journeys]);

  const awaitingApprovalCount = useMemo(() => {
    if (!journeys) return 0;
    return journeys.filter((j: any) => j.status === 'Draft' || j.status === 'Pending Approval')
      .length;
  }, [journeys]);

  const volumeReceived = useMemo(() => {
    let total = 0;
    if (terminalReceipts && terminalReceipts.length > 0) {
      total = terminalReceipts.reduce(
        (sum: number, r: any) =>
          sum + (Number(r.net_standard_volume_kl) || Number(r.gross_observed_volume_kl) || 0),
        0
      );
    } else if (shipments && shipments.length > 0) {
      total = shipments.reduce(
        (sum: number, s: any) => sum + (Number(s.planned_quantity_kl) || 0),
        0
      );
    }
    return total;
  }, [terminalReceipts, shipments]);

  const pipelineTransitVolume = useMemo(() => {
    if (pipelineBatches && pipelineBatches.length > 0) {
      return pipelineBatches.reduce(
        (sum: number, b: any) => sum + (Number(b.planned_volume_kl) || 0),
        0
      );
    }
    return 0;
  }, [pipelineBatches]);

  const openAlertsCount = openAlerts?.length ?? 0;
  const criticalAlertsCount = useMemo(() => {
    if (!openAlerts) return 0;
    return openAlerts.filter((a: any) => a.severity === 'High' || a.severity === 'Critical').length;
  }, [openAlerts]);

  const { avgVariance, tolerance, flaggedReconCount } = useMemo(() => {
    if (!reconciliations || reconciliations.length === 0) {
      return { avgVariance: 0, tolerance: 0, flaggedReconCount: 0 };
    }
    const totalVar = reconciliations.reduce(
      (sum: number, r: any) => sum + Math.abs(Number(r.variance_percent) || 0),
      0
    );
    const avg = totalVar / reconciliations.length;
    const tol = Number(reconciliations[0]?.tolerance_percent) || 0;
    const flagged = reconciliations.filter((r: any) => !r.within_tolerance).length;
    return { avgVariance: avg, tolerance: tol, flaggedReconCount: flagged };
  }, [reconciliations]);

  const { invoiceTotalFormatted, invoiceUnit, invoiceCount } = useMemo(() => {
    if (!invoices || invoices.length === 0) {
      return {
        invoiceTotalFormatted: '0',
        invoiceUnit: 'KES',
        invoiceCount: 0,
      };
    }
    const total = invoices.reduce(
      (sum: number, inv: any) => sum + (Number(inv.grand_total) || 0),
      0
    );
    if (total >= 1_000_000) {
      return {
        invoiceTotalFormatted: (total / 1_000_000).toFixed(1),
        invoiceUnit: 'M',
        invoiceCount: invoices.length,
      };
    } else if (total >= 1_000) {
      return {
        invoiceTotalFormatted: (total / 1_000).toFixed(1),
        invoiceUnit: 'K',
        invoiceCount: invoices.length,
      };
    }
    return {
      invoiceTotalFormatted: total.toLocaleString(),
      invoiceUnit: 'KES',
      invoiceCount: invoices.length,
    };
  }, [invoices]);

  const latestInventoryByTank = useMemo(() => {
    const latest = new Map<string, any>();
    for (const position of inventoryPositions ?? []) {
      if (position.tank && !latest.has(position.tank)) latest.set(position.tank, position);
    }
    return latest;
  }, [inventoryPositions]);

  const totalStock = useMemo(
    () =>
      Array.from(latestInventoryByTank.values()).reduce(
        (sum, position) => sum + (Number(position.closing_volume_kl) || 0),
        0
      ),
    [latestInventoryByTank]
  );

  const availableUsage = useMemo(
    () =>
      (tanks ?? []).reduce((sum, tank: any) => {
        const stock = Number(latestInventoryByTank.get(tank.name)?.closing_volume_kl) || 0;
        const capacity = Number(tank.safe_fill_capacity_kl) || 0;
        return sum + Math.max(0, capacity - stock);
      }, 0),
    [tanks, latestInventoryByTank]
  );

  const movementToday = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const batchVolumes = new Map(
      (pipelineBatches ?? []).map((batch: any) => [
        batch.name,
        Number(batch.planned_volume_kl) || 0,
      ])
    );
    return (movements ?? []).reduce((sum, movement: any) => {
      if (!movement.start_datetime?.startsWith(today)) return sum;
      return sum + (batchVolumes.get(movement.pipeline_batch) || 0);
    }, 0);
  }, [movements, pipelineBatches]);

  const tanksInAlarm = useMemo(
    () =>
      (openAlerts ?? []).filter((alert: any) => ['High', 'Critical'].includes(alert.severity))
        .length,
    [openAlerts]
  );

  const totalVariance = useMemo(
    () =>
      (reconciliations ?? []).reduce(
        (sum, reconciliation: any) => sum + (Number(reconciliation.variance_kl) || 0),
        0
      ),
    [reconciliations]
  );

  const liveKpiItems = useMemo(
    () => [
      {
        label: 'Active journeys',
        value: journeyLoading ? '…' : activeJourneys.length,
        delta: `${activeJourneys.length} in progress`,
        deltaType: 'up' as const,
        icon: <IconJourneys />,
      },
      {
        label: 'Volume received today',
        value: receiptsLoading
          ? '…'
          : volumeReceived.toLocaleString('en-US', {
              maximumFractionDigits: 1,
            }),
        unit: 'KL',
        delta: `${terminalReceipts?.length ?? shipments?.length ?? 0} receipts logged`,
        deltaType: 'up' as const,
        icon: <IconVolume />,
      },
      {
        label: 'In pipeline transit',
        value: pipelineLoading
          ? '…'
          : pipelineTransitVolume.toLocaleString('en-US', {
              maximumFractionDigits: 1,
            }),
        unit: 'KL',
        delta: `${pipelineBatches?.length ?? 0} batches scheduled`,
        deltaType: 'flat' as const,
        icon: <IconPipeline />,
      },
      {
        label: 'Open AI alerts',
        value: alertsLoading ? '…' : openAlertsCount,
        delta:
          criticalAlertsCount > 0
            ? `▼ ${criticalAlertsCount} critical/high`
            : openAlertsCount > 0
              ? '▼ awaiting Maintenance'
              : '✓ all systems nominal',
        deltaType: openAlertsCount > 0 ? ('warn' as const) : ('up' as const),
        icon: <IconAlert />,
      },
      {
        label: 'Reconciliation variance',
        value: reconLoading ? '…' : `${avgVariance.toFixed(2)}`,
        unit: '%',
        delta:
          flaggedReconCount > 0
            ? `▼ ${flaggedReconCount} flagged for review`
            : `within ${tolerance.toFixed(2)}% tolerance`,
        deltaType: flaggedReconCount > 0 ? ('warn' as const) : ('up' as const),
        icon: <IconVariance />,
      },
      {
        label: 'Invoiced this month',
        value: invoiceLoading ? '…' : invoiceTotalFormatted,
        unit: invoiceUnit,
        delta: `${invoiceCount} invoices issued`,
        deltaType: 'up' as const,
        icon: <IconInvoice />,
      },
    ],
    [
      journeyLoading,
      activeJourneys.length,
      receiptsLoading,
      volumeReceived,
      terminalReceipts?.length,
      shipments?.length,
      pipelineLoading,
      pipelineTransitVolume,
      pipelineBatches?.length,
      alertsLoading,
      openAlertsCount,
      criticalAlertsCount,
      reconLoading,
      avgVariance,
      tolerance,
      flaggedReconCount,
      invoiceLoading,
      invoiceTotalFormatted,
      invoiceUnit,
      invoiceCount,
    ]
  );

  const stockKpiItems = useMemo(
    () => [
      {
        label: 'Total stock',
        value:
          tanksLoading || inventoryLoading
            ? '…'
            : totalStock.toLocaleString('en-US', { maximumFractionDigits: 1 }),
        unit: 'm³',
        delta: `${tanks?.length ?? 0} tanks monitored`,
        deltaType: 'flat' as const,
        icon: <IconVolume />,
      },
      {
        label: 'Available usage',
        value:
          tanksLoading || inventoryLoading
            ? '…'
            : availableUsage.toLocaleString('en-US', {
                maximumFractionDigits: 1,
              }),
        unit: 'm³',
        delta: 'room to receive',
        deltaType: 'up' as const,
        icon: <IconPipeline />,
      },
      {
        label: 'Movement today',
        value:
          movementsLoading || pipelineLoading
            ? '…'
            : movementToday.toLocaleString('en-US', {
                maximumFractionDigits: 1,
              }),
        unit: 'm³',
        delta: `${movements?.length ?? 0} movements logged`,
        deltaType: 'up' as const,
        icon: <IconJourneys />,
      },
      {
        label: 'Tanks in alarm',
        value: alertsLoading ? '…' : tanksInAlarm,
        delta: tanksInAlarm > 0 ? 'high or critical' : 'all tanks nominal',
        deltaType: tanksInAlarm > 0 ? ('warn' as const) : ('up' as const),
        icon: <IconAlert />,
      },
      {
        label: 'Net variance',
        value: reconLoading
          ? '…'
          : totalVariance.toLocaleString('en-US', { maximumFractionDigits: 1 }),
        unit: 'm³',
        delta: `${flaggedReconCount} flagged for review`,
        deltaType: flaggedReconCount > 0 ? ('warn' as const) : ('up' as const),
        icon: <IconVariance />,
      },
    ],
    [
      tanksLoading,
      inventoryLoading,
      tanks?.length,
      totalStock,
      availableUsage,
      movementsLoading,
      movements?.length,
      pipelineLoading,
      movementToday,
      alertsLoading,
      tanksInAlarm,
      reconLoading,
      totalVariance,
      flaggedReconCount,
    ]
  );

  return (
    <section id='overview' className='scroll-mt-24 mb-12'>
      <div className='mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between'>
        <div className='max-w-2xl'>
          <p className='text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase'>
            Live · Mombasa &amp; Nairobi Terminals
          </p>
          <h1 className='text-foreground text-2xl font-semibold tracking-tight sm:text-3xl'>
            Every drop of cargo, traced from vessel to invoice.
          </h1>
          <p className='text-muted-foreground mt-3 text-sm leading-relaxed'>
            Thirteen enforced steps, one immutable journey_ref per cargo — from Oil Shipment through
            predictive pipeline maintenance to Financial Posting.
          </p>
        </div>

        <Card className='w-full shrink-0 lg:max-w-xs' size='sm'>
          <CardContent>
            <p className='text-muted-foreground text-[11px] font-medium tracking-wide uppercase'>
              Active golden threads
            </p>
            <p className='text-foreground mt-2 text-sm leading-relaxed'>
              <span className='font-semibold'>{journeyLoading ? '…' : activeJourneys.length}</span>{' '}
              in progress · <span className='font-semibold'>{awaitingApprovalCount}</span> awaiting
              approval
            </p>
            <p className='text-muted-foreground mt-1 text-sm'>
              <span className='text-foreground font-semibold'>{flaggedReconCount}</span> flagged for
              reconciliation review
            </p>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6'>
        {liveKpiItems.map((item, index) => (
          <KpiCard
            key={index}
            label={item.label}
            value={item.value}
            unit={item.unit}
            delta={item.delta}
            deltaType={item.deltaType}
            icon={item.icon}
          />
        ))}
      </div>

      <div className='mt-12 mb-5'>
        <h2 className='text-foreground text-lg font-semibold tracking-tight'>
          Stock &amp; Tank Farm
        </h2>
        <p className='text-muted-foreground mt-1 text-sm'>
          Tank capacity, stock movement and reconciliation by depot.
        </p>
      </div>

      <div className='grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5'>
        {stockKpiItems.map((item, index) => (
          <KpiCard
            key={index}
            label={item.label}
            value={item.value}
            unit={item.unit}
            delta={item.delta}
            deltaType={item.deltaType}
            icon={item.icon}
          />
        ))}
      </div>
    </section>
  );
}
