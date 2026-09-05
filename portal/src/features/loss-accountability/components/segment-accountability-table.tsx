import DataTable from '@/components/data-table';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';
import type { ColumnDef } from '@tanstack/react-table';
import { MapPinned } from 'lucide-react';
import { SEGMENT_ROWS, type SegmentRow } from '../data/dummy';

const columns: ColumnDef<SegmentRow>[] = [
  {
    header: 'Segment',
    accessorKey: 'segment',
    cell: ({ row }) => (
      <span className='text-foreground text-[12px] font-semibold'>{row.original.segment}</span>
    ),
  },
  {
    header: 'Length',
    accessorKey: 'length',
    cell: ({ row }) => (
      <span className='font-mono text-[12px] tabular-nums'>{row.original.length}</span>
    ),
  },
  {
    header: 'Throughput',
    accessorKey: 'throughput',
    cell: ({ row }) => (
      <span className='font-mono text-[12px] tabular-nums'>{row.original.throughput}</span>
    ),
  },
  {
    header: 'Loss',
    accessorKey: 'loss',
    cell: ({ row }) => (
      <span className='font-mono text-[12px] tabular-nums'>{row.original.loss}</span>
    ),
  },
  {
    header: 'Loss %',
    accessorKey: 'lossPct',
    cell: ({ row }) => {
      const over = row.original.lossPct > row.original.tolerance;
      return (
        <span
          className={cn(
            'font-mono text-[12px] font-semibold tabular-nums',
            over ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'
          )}
        >
          {row.original.lossPct.toFixed(2)}%
        </span>
      );
    },
  },
  {
    header: 'Tolerance',
    accessorKey: 'tolerance',
    cell: ({ row }) => (
      <span className='font-mono text-[12px] tabular-nums'>
        {row.original.tolerance.toFixed(2)}%
      </span>
    ),
  },
  {
    header: 'Likely cause',
    accessorKey: 'cause',
    cell: ({ row }) => (
      <span className='text-muted-foreground text-[12px]'>{row.original.cause}</span>
    ),
  },
  {
    header: 'Flag',
    accessorKey: 'flag',
    cell: ({ row }) => <StatusBadge label={row.original.flag} tone={row.original.tone} />,
  },
];

export function SegmentAccountabilityTable() {
  return (
    <DataTable<SegmentRow>
      className='border-border/80 from-card via-amber-50/30 to-rose-50/20 overflow-hidden bg-linear-to-br shadow-[0_10px_40px_-24px_rgba(15,23,42,0.25)] dark:via-amber-950/20 dark:to-rose-950/15'
      tableHeader={
        <div className='flex items-center gap-3'>
          <div className='flex size-9 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-amber-600 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300'>
            <MapPinned className='size-4' />
          </div>
          <div>
            <span className='text-foreground text-[15px] font-semibold tracking-tight'>
              Segment accountability
            </span>
            <p className='text-muted-foreground text-[11px]'>
              Unaccounted-for volume by trunk-line leg vs tolerance
            </p>
          </div>
        </div>
      }
      columns={columns}
      data={SEGMENT_ROWS}
      total={SEGMENT_ROWS.length}
      currentPage={0}
      pageSize={SEGMENT_ROWS.length}
      showpagination={false}
      variant='soft'
      emptyMessage='No segment data.'
    />
  );
}
