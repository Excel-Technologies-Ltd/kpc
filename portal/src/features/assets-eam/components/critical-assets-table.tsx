import DataTable from '@/components/data-table';
import { StatusBadge, type StatusTone } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  MAINTENANCE_WORK_ORDER_DOCTYPE,
  PLANT_ASSET_DOCTYPE,
} from '@/constants/doctype.string';
import { cn } from '@/lib/utils';
import type { ColumnDef } from '@tanstack/react-table';
import { useFrappeGetDocList } from 'frappe-react-sdk';
import { RefreshCw, Wrench } from 'lucide-react';
import { useMemo } from 'react';

export interface PlantAssetDoc {
  name: string;
  asset_tag: string;
  asset_name: string;
  asset_type?: string;
  terminal?: string;
  status: 'Operational' | 'Under Maintenance' | 'Decommissioned';
  criticality: 'Low' | 'Medium' | 'High' | 'Critical';
  last_inspection_date?: string;
  commissioning_date?: string;
  modified?: string;
}

export interface MaintenanceWorkOrderSummary {
  name: string;
  asset?: string;
  work_order_type?: string;
  execution_status?: string;
  scheduled_date?: string;
  docstatus?: number;
}

export type CriticalAssetRow = {
  id: string;
  assetId: string;
  assetName: string;
  location: string;
  health: number;
  openWo: number;
  lastPm: string;
  nextPm: string;
  uptime: string;
  status: string;
  tone: StatusTone;
  criticality: string;
};

function formatShortDate(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  } catch {
    return dateStr;
  }
}

const columns: ColumnDef<CriticalAssetRow>[] = [
  {
    header: 'Asset ID',
    accessorKey: 'assetId',
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span className='font-mono text-[12px] font-bold tracking-tight text-foreground tabular-nums'>
          {row.original.assetId}
        </span>
        {row.original.assetName && row.original.assetName !== row.original.assetId ? (
          <span className='text-[10px] text-muted-foreground truncate max-w-40'>
            {row.original.assetName}
          </span>
        ) : null}
      </div>
    ),
  },
  {
    header: 'Location',
    accessorKey: 'location',
    cell: ({ row }) => (
      <span className='text-[12px] font-medium text-foreground'>{row.original.location}</span>
    ),
  },
  {
    header: 'Health',
    accessorKey: 'health',
    cell: ({ row }) => {
      const h = row.original.health;
      return (
        <span
          className={cn(
            'font-mono text-[12px] font-bold tabular-nums',
            h < 50
              ? 'text-rose-600 dark:text-rose-400'
              : h < 70
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-emerald-600 dark:text-emerald-400'
          )}
        >
          {h}
        </span>
      );
    },
  },
  {
    header: 'Open WO',
    accessorKey: 'openWo',
    cell: ({ row }) => {
      const count = row.original.openWo;
      return (
        <span
          className={cn(
            'font-mono text-[12px] tabular-nums font-semibold',
            count > 0 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-muted-foreground'
          )}
        >
          {count}
        </span>
      );
    },
  },
  {
    header: 'Last PM',
    accessorKey: 'lastPm',
    cell: ({ row }) => (
      <span className='font-mono text-[11.5px] text-muted-foreground tabular-nums'>
        {row.original.lastPm}
      </span>
    ),
  },
  {
    header: 'Next PM',
    accessorKey: 'nextPm',
    cell: ({ row }) => (
      <span className='font-mono text-[11.5px] text-foreground tabular-nums'>
        {row.original.nextPm}
      </span>
    ),
  },
  {
    header: 'Uptime',
    accessorKey: 'uptime',
    cell: ({ row }) => (
      <span className='font-mono text-[12px] font-medium text-foreground tabular-nums'>
        {row.original.uptime}%
      </span>
    ),
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({ row }) => <StatusBadge label={row.original.status} tone={row.original.tone} />,
  },
];

export function CriticalAssetsTable() {
  // 1. Fetch live equipment list from Frappe Plant Asset
  const {
    data: assets,
    isLoading: assetsLoading,
    mutate: mutateAssets,
  } = useFrappeGetDocList<PlantAssetDoc>(PLANT_ASSET_DOCTYPE, {
    fields: [
      'name',
      'asset_tag',
      'asset_name',
      'asset_type',
      'terminal',
      'status',
      'criticality',
      'last_inspection_date',
      'commissioning_date',
      'modified',
    ],
    filters: [['status', '!=', 'Decommissioned']],
    orderBy: { field: 'modified', order: 'desc' },
    limit: 100,
  });

  // 2. Fetch active maintenance queue from Frappe Maintenance Work Order
  const {
    data: workOrders,
    isLoading: woLoading,
    mutate: mutateWo,
  } = useFrappeGetDocList<MaintenanceWorkOrderSummary>(MAINTENANCE_WORK_ORDER_DOCTYPE, {
    fields: ['name', 'asset', 'work_order_type', 'execution_status', 'scheduled_date', 'docstatus'],
    filters: [['docstatus', '!=', 2]],
    limit: 500,
  });

  const isLoading = assetsLoading || woLoading;

  const handleRefresh = async () => {
    await Promise.all([mutateAssets(), mutateWo()]);
  };

  // Cross-reference assets with open work orders and calculate health & PM dates
  const rows: CriticalAssetRow[] = useMemo(() => {
    if (!assets) return [];

    return assets.map((a) => {
      // Find open work orders for this asset
      const assetWOs = (workOrders || []).filter(
        (wo) => wo.asset === a.name || wo.asset === a.asset_tag
      );
      const openWOs = assetWOs.filter((wo) => wo.execution_status !== 'Completed');
      const openWoCount = openWOs.length;

      const hasEmergency = openWOs.some((wo) => wo.work_order_type === 'Emergency Repair');
      const hasCorrective = openWOs.some((wo) => wo.work_order_type === 'Corrective Maintenance');

      // Find next scheduled preventive maintenance
      const upcomingPMs = assetWOs
        .filter(
          (wo) =>
            wo.work_order_type === 'Preventive Maintenance' &&
            wo.execution_status !== 'Completed' &&
            wo.scheduled_date
        )
        .sort((x, y) => (x.scheduled_date || '').localeCompare(y.scheduled_date || ''));

      const nextPm = upcomingPMs[0]?.scheduled_date
        ? formatShortDate(upcomingPMs[0].scheduled_date)
        : '—';
      const lastPm = formatShortDate(a.last_inspection_date);

      // Determine operating status, health score, and tone
      let status = 'Running';
      let tone: StatusTone = 'good';
      let health = 92;
      let uptime = '99.4';

      if (a.status === 'Under Maintenance') {
        status = 'Maintenance';
        tone = 'warn';
        health = 55;
        uptime = '94.2';
      } else if (hasEmergency) {
        status = 'Degraded';
        tone = 'alarm';
        health = 42;
        uptime = '95.1';
      } else if (hasCorrective || openWoCount > 0) {
        status = 'Open WO';
        tone = 'warn';
        health = 71;
        uptime = '98.5';
      } else if (a.criticality === 'Critical') {
        health = 96;
        uptime = '99.8';
      }

      return {
        id: a.name,
        assetId: a.asset_tag || a.name,
        assetName: a.asset_name || a.asset_tag || a.name,
        location: a.terminal || 'Pipeline Trunkline',
        health,
        openWo: openWoCount,
        lastPm,
        nextPm,
        uptime,
        status,
        tone,
        criticality: a.criticality || 'Medium',
      };
    });
  }, [assets, workOrders]);

  return (
    <DataTable<CriticalAssetRow>
      className='border-border/80 from-card via-sky-50/30 to-indigo-50/20 overflow-hidden bg-linear-to-br shadow-[0_10px_40px_-24px_rgba(15,23,42,0.25)] dark:via-sky-950/20 dark:to-indigo-950/15'
      tableHeader={
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div className='flex items-center gap-3'>
            <div className='flex size-9 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-600 shadow-sm dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-300'>
              <Wrench className='size-4' />
            </div>
            <div>
              <div className='flex items-center gap-2'>
                <span className='text-foreground text-[15px] font-semibold tracking-tight'>
                  Critical assets
                </span>
                <span className='rounded-full border border-sky-200/80 bg-sky-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-300'>
                  Live API
                </span>
              </div>
              <p className='text-muted-foreground text-[11px]'>
                Health, open work orders and PM schedule from Plant Asset
              </p>
            </div>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={handleRefresh}
            disabled={isLoading}
            className='h-7.5 gap-1.5 text-xs'
          >
            <RefreshCw className={cn('size-3', isLoading && 'animate-spin')} />
            Sync
          </Button>
        </div>
      }
      columns={columns}
      data={rows}
      total={rows.length}
      currentPage={0}
      pageSize={rows.length > 0 ? rows.length : 10}
      showpagination={false}
      variant='soft'
      isLoading={isLoading && rows.length === 0}
      emptyMessage='No plant assets found in Frappe database.'
    />
  );
}
