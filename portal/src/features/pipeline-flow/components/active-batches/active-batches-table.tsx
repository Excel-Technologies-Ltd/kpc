import DataTable from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { PIPELINE_BATCHES_DOCTYPE } from '@/constants/doctype.string';
import { usePagination } from '@/hooks/usePagination';
import { cn } from '@/lib/utils';
import type { PipelineBatch } from '@/types/PetroleumOperations/PipelineBatch';
import type { ColumnDef } from '@tanstack/react-table';
import { useFrappeGetDocCount, useFrappeGetDocList, type Filter } from 'frappe-react-sdk';
import { ArrowRight, Layers3 } from 'lucide-react';
import type { ReactNode } from 'react';
import { AnimatedSection } from '../animated-section';
import { FlowInfoButton } from '../flow-info-button';

const BATCH_FIELDS = [
  'name',
  'nomination',
  'journey_ref',
  'product',
  'origin_terminal',
  'destination_terminal',
  'batch_sequence_no',
  'planned_volume_kl',
  'interface_cut_kl',
  'scheduled_start',
  'scheduled_end',
  'capacity_assessment',
  'remarks',
  'docstatus',
] as const satisfies ReadonlyArray<keyof PipelineBatch>;

function formatVolume(value?: number | null) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatDateTime(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function docstatusLabel(docstatus: PipelineBatch['docstatus']) {
  switch (docstatus) {
    case 1:
      return 'Submitted';
    case 2:
      return 'Cancelled';
    default:
      return 'Draft';
  }
}

function docstatusClass(docstatus: PipelineBatch['docstatus']) {
  switch (docstatus) {
    case 1:
      return 'border-emerald-200/80 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/20';
    case 2:
      return 'border-rose-200/80 bg-rose-50 text-rose-700 ring-1 ring-rose-100 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/20';
    default:
      return 'border-sky-200/80 bg-sky-50 text-sky-700 ring-1 ring-sky-100 dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-500/20';
  }
}

function SoftPill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'border-border/80 bg-card/90 text-muted-foreground inline-flex max-w-45 items-center truncate rounded-full border px-2.5 py-0.5 text-[11px] font-medium shadow-[0_1px_0_rgba(15,23,42,0.04)] dark:shadow-[0_1px_0_rgba(255,255,255,0.04)]',
        className
      )}
    >
      {children}
    </span>
  );
}

const columns: ColumnDef<PipelineBatch>[] = [
  {
    header: 'Batch',
    accessorKey: 'name',
    cell: ({ row }) => (
      <div className='flex flex-col gap-0.5'>
        <span className='text-foreground font-mono text-[12px] font-semibold tracking-tight tabular-nums'>
          {row.original.name}
        </span>
        <span className='text-muted-foreground text-[10px] font-medium tracking-wide uppercase'>
          Pipeline batch
        </span>
      </div>
    ),
  },
  {
    header: 'Product',
    accessorKey: 'product',
    cell: ({ row }) => (
      <SoftPill className='border-amber-200/70 bg-amber-50/80 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300'>
        {row.original.product || '—'}
      </SoftPill>
    ),
  },
  {
    header: 'Route',
    id: 'route',
    cell: ({ row }) => (
      <div className='inline-flex items-center gap-1.5'>
        <SoftPill className='border-sky-200/70 bg-sky-50/90 text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-300'>
          {row.original.origin_terminal || '—'}
        </SoftPill>
        <ArrowRight className='text-muted-foreground/50 size-3.5 shrink-0' />
        <SoftPill className='border-indigo-200/70 bg-indigo-50/90 text-indigo-800 dark:border-indigo-500/30 dark:bg-indigo-500/15 dark:text-indigo-300'>
          {row.original.destination_terminal || '—'}
        </SoftPill>
      </div>
    ),
  },
  {
    header: 'Seq',
    accessorKey: 'batch_sequence_no',
    cell: ({ row }) => (
      <span className='border-border bg-card text-muted-foreground inline-flex size-7 items-center justify-center rounded-lg border font-mono text-[11px] font-semibold shadow-sm'>
        {row.original.batch_sequence_no}
      </span>
    ),
  },
  {
    header: 'Planned vol (KL)',
    accessorKey: 'planned_volume_kl',
    cell: ({ row }) => (
      <div className='text-foreground font-mono text-[12px] font-semibold tabular-nums'>
        {formatVolume(row.original.planned_volume_kl)}
      </div>
    ),
  },
  {
    header: 'Interface cut (KL)',
    accessorKey: 'interface_cut_kl',
    cell: ({ row }) => (
      <div className='text-muted-foreground font-mono text-[12px] tabular-nums'>
        {formatVolume(row.original.interface_cut_kl)}
      </div>
    ),
  },
  {
    header: 'Scheduled start',
    accessorKey: 'scheduled_start',
    cell: ({ row }) => (
      <div className='bg-muted/60 text-muted-foreground rounded-md px-2 py-1 text-[11px] whitespace-nowrap'>
        {formatDateTime(row.original.scheduled_start)}
      </div>
    ),
  },
  {
    header: 'Scheduled end',
    accessorKey: 'scheduled_end',
    cell: ({ row }) => (
      <div className='bg-muted/60 text-muted-foreground rounded-md px-2 py-1 text-[11px] whitespace-nowrap'>
        {formatDateTime(row.original.scheduled_end)}
      </div>
    ),
  },
  {
    header: 'Nomination',
    accessorKey: 'nomination',
    cell: ({ row }) => (
      <div className='text-muted-foreground font-mono text-[11px]'>
        {row.original.nomination || '—'}
      </div>
    ),
  },
  {
    header: 'Journey',
    accessorKey: 'journey_ref',
    cell: ({ row }) => (
      <div className='text-muted-foreground font-mono text-[11px]'>
        {row.original.journey_ref || '—'}
      </div>
    ),
  },
  {
    header: 'Status',
    accessorKey: 'docstatus',
    cell: ({ row }) => (
      <Badge
        className={cn(
          'rounded-full px-2.5 py-0.5 text-[11px] font-semibold shadow-none',
          docstatusClass(row.original.docstatus)
        )}
      >
        {docstatusLabel(row.original.docstatus)}
      </Badge>
    ),
  },
];

export function ActiveBatchesTable() {
  const { currentPage, pageSize, offset, handlePageChange, handlePageSizeChange } =
    usePagination(10);

  const filters: Filter<PipelineBatch>[] = [];

  const {
    data: batches,
    isLoading,
    error,
  } = useFrappeGetDocList<PipelineBatch>(PIPELINE_BATCHES_DOCTYPE, {
    fields: [...BATCH_FIELDS],
    filters,
    limit: pageSize,
    limit_start: offset,
    orderBy: { field: 'modified', order: 'desc' },
  });

  const { data: totalCount, isLoading: isLoadingCount } = useFrappeGetDocCount(
    PIPELINE_BATCHES_DOCTYPE,
    filters
  );
  const total = totalCount ?? 0;

  return (
    <AnimatedSection delay={0.3}>
      <DataTable<PipelineBatch>
        className='border-border/80 from-card via-sky-50/40 to-indigo-50/30 overflow-hidden bg-linear-to-br shadow-[0_10px_40px_-24px_rgba(15,23,42,0.25)] dark:via-sky-950/30 dark:to-indigo-950/25 dark:shadow-[0_10px_40px_-24px_rgba(0,0,0,0.55)]'
        tableHeader={
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div className='flex items-center gap-3'>
              <div className='flex size-9 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-600 shadow-sm dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-300'>
                <Layers3 className='size-4' />
              </div>
              <div>
                <div className='flex items-center gap-2'>
                  <span className='text-foreground text-[15px] font-semibold tracking-tight'>
                    Active batches
                  </span>
                  <FlowInfoButton guideKey='flow-batch' />
                </div>
                <p className='text-muted-foreground text-[11px]'>
                  Live pipeline batch schedule · source to destination
                </p>
              </div>
            </div>
            <span className='inline-flex items-center rounded-full border border-sky-200/80 bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-sky-700 shadow-sm dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-300'>
              {total} total
            </span>
          </div>
        }
        columns={columns}
        data={batches ?? []}
        total={total}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        isLoading={isLoading || isLoadingCount}
        loadingMessage='Loading batches…'
        emptyMessage={error ? 'Failed to load pipeline batches.' : 'No pipeline batches found.'}
        variant='soft'
      />
    </AnimatedSection>
  );
}
