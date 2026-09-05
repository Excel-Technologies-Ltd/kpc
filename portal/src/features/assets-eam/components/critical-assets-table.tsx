import DataTable from '@/components/data-table';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';
import type { ColumnDef } from '@tanstack/react-table';
import { Wrench } from 'lucide-react';
import { CRITICAL_ASSETS, type CriticalAsset } from '../data/dummy';

const columns: ColumnDef<CriticalAsset>[] = [
  {
    header: 'Asset ID',
    accessorKey: 'assetId',
    cell: ({ row }) => (
      <span className='font-mono text-[12px] font-semibold tracking-tight tabular-nums'>
        {row.original.assetId}
      </span>
    ),
  },
  {
    header: 'Location',
    accessorKey: 'location',
    cell: ({ row }) => <span className='text-[12px]'>{row.original.location}</span>,
  },
  {
    header: 'Health',
    accessorKey: 'health',
    cell: ({ row }) => {
      const h = row.original.health;
      return (
        <span
          className={cn(
            'font-mono text-[12px] font-semibold tabular-nums',
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
    cell: ({ row }) => (
      <span className='font-mono text-[12px] tabular-nums'>{row.original.openWo}</span>
    ),
  },
  {
    header: 'Last PM',
    accessorKey: 'lastPm',
    cell: ({ row }) => <span className='text-[12px]'>{row.original.lastPm}</span>,
  },
  {
    header: 'Next PM',
    accessorKey: 'nextPm',
    cell: ({ row }) => <span className='text-[12px]'>{row.original.nextPm}</span>,
  },
  {
    header: 'Uptime',
    accessorKey: 'uptime',
    cell: ({ row }) => (
      <span className='font-mono text-[12px] tabular-nums'>{row.original.uptime}%</span>
    ),
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({ row }) => <StatusBadge label={row.original.status} tone={row.original.tone} />,
  },
];

export function CriticalAssetsTable() {
  return (
    <DataTable<CriticalAsset>
      className='border-border/80 from-card via-sky-50/30 to-indigo-50/20 overflow-hidden bg-linear-to-br shadow-[0_10px_40px_-24px_rgba(15,23,42,0.25)] dark:via-sky-950/20 dark:to-indigo-950/15'
      tableHeader={
        <div className='flex items-center gap-3'>
          <div className='flex size-9 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-600 shadow-sm dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-300'>
            <Wrench className='size-4' />
          </div>
          <div>
            <span className='text-foreground text-[15px] font-semibold tracking-tight'>
              Critical assets
            </span>
            <p className='text-muted-foreground text-[11px]'>
              Health, open work orders and PM schedule
            </p>
          </div>
        </div>
      }
      columns={columns}
      data={CRITICAL_ASSETS}
      total={CRITICAL_ASSETS.length}
      currentPage={0}
      pageSize={CRITICAL_ASSETS.length}
      showpagination={false}
      variant='soft'
      emptyMessage='No assets.'
    />
  );
}
