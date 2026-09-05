import DataTable from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ColumnDef } from '@tanstack/react-table';
import { Users } from 'lucide-react';
import { useMemo } from 'react';
import { useCommercialMetricsContext } from '../commercial-metrics-context';
import type { TopCustomerRow } from '../utils/derive-commercial-metrics';
import { formatKesLabel, formatVolumeKl } from '../utils/format-money';
import { AnimatedSection } from './animated-section';

function statusClass(status: TopCustomerRow['status']) {
  switch (status) {
    case 'Posted':
      return 'border-emerald-200/80 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/20';
    case 'Mixed':
      return 'border-amber-200/80 bg-amber-50 text-amber-700 ring-1 ring-amber-100 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/20';
    default:
      return 'border-sky-200/80 bg-sky-50 text-sky-700 ring-1 ring-sky-100 dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-500/20';
  }
}

const columns: ColumnDef<TopCustomerRow>[] = [
  {
    header: 'Customer',
    accessorKey: 'customer',
    cell: ({ row }) => (
      <div className='flex flex-col gap-0.5'>
        <span className='text-foreground text-[12px] font-semibold tracking-tight'>
          {row.original.customer}
        </span>
        <span className='text-muted-foreground text-[10px] font-medium tracking-wide uppercase'>
          OMC
        </span>
      </div>
    ),
  },
  {
    header: 'Invoices',
    accessorKey: 'invoiceCount',
    cell: ({ row }) => (
      <span className='font-mono text-[12px] tabular-nums'>{row.original.invoiceCount}</span>
    ),
  },
  {
    header: 'Volume (KL)',
    accessorKey: 'volumeKl',
    cell: ({ row }) => (
      <span className='font-mono text-[12px] tabular-nums'>
        {formatVolumeKl(row.original.volumeKl)}
      </span>
    ),
  },
  {
    header: 'Billed',
    accessorKey: 'billed',
    cell: ({ row }) => (
      <span className='text-foreground font-mono text-[12px] font-semibold tabular-nums'>
        {formatKesLabel(row.original.billed)}
      </span>
    ),
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({ row }) => (
      <Badge
        variant='outline'
        className={cn('text-[10px] font-semibold', statusClass(row.original.status))}
      >
        {row.original.status}
      </Badge>
    ),
  },
];

export function TopCustomersTable() {
  const { metrics, isLoading } = useCommercialMetricsContext();
  const data = metrics.topCustomers;

  const tableData = useMemo(() => data, [data]);

  return (
    <AnimatedSection delay={0.25}>
      <DataTable<TopCustomerRow>
        className='border-border/80 from-card via-emerald-50/40 to-teal-50/30 overflow-hidden bg-linear-to-br shadow-[0_10px_40px_-24px_rgba(15,23,42,0.25)] dark:via-emerald-950/30 dark:to-teal-950/25 dark:shadow-[0_10px_40px_-24px_rgba(0,0,0,0.55)]'
        tableHeader={
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div className='flex items-center gap-3'>
              <div className='flex size-9 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600 shadow-sm dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300'>
                <Users className='size-4' />
              </div>
              <div>
                <span className='text-foreground text-[15px] font-semibold tracking-tight'>
                  Top customers by billed revenue
                </span>
                <p className='text-muted-foreground text-[11px]'>
                  Submitted invoices by grand total · volume from allocations · SI = Posted
                </p>
              </div>
            </div>
            <span className='inline-flex items-center rounded-full border border-emerald-200/80 bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 shadow-sm dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300'>
              {data.length} shown
            </span>
          </div>
        }
        columns={columns}
        data={tableData}
        total={data.length}
        currentPage={0}
        pageSize={Math.max(data.length, 10)}
        isLoading={isLoading}
        loadingMessage='Loading customers…'
        emptyMessage='No submitted invoices found.'
        variant='soft'
        showpagination={false}
      />
    </AnimatedSection>
  );
}
