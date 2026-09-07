import DataTable from '@/components/data-table';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { ColumnDef } from '@tanstack/react-table';
import { ShieldAlert } from 'lucide-react';
import { INCIDENT_ROWS, type IncidentRow } from '../data/dummy';

const columns: ColumnDef<IncidentRow>[] = [
  {
    header: 'Ref',
    accessorKey: 'ref',
    cell: ({ row }) => (
      <span className='font-mono text-[12px] font-semibold tabular-nums'>{row.original.ref}</span>
    ),
  },
  {
    header: 'Date',
    accessorKey: 'date',
    cell: ({ row }) => <span className='text-[12px]'>{row.original.date}</span>,
  },
  {
    header: 'Location',
    accessorKey: 'location',
    cell: ({ row }) => <span className='text-[12px]'>{row.original.location}</span>,
  },
  {
    header: 'Type',
    accessorKey: 'type',
    cell: ({ row }) => <span className='text-[12px]'>{row.original.type}</span>,
  },
  {
    header: 'Severity',
    accessorKey: 'severity',
    cell: ({ row }) => (
      <StatusBadge label={row.original.severity} tone={row.original.severityTone} />
    ),
  },
  {
    header: 'Volume lost',
    accessorKey: 'volumeLost',
    cell: ({ row }) => (
      <span className='font-mono text-[12px] tabular-nums'>{row.original.volumeLost}</span>
    ),
  },
  {
    header: 'Corrective action',
    accessorKey: 'action',
    cell: ({ row }) => (
      <span className='text-muted-foreground text-[12px]'>{row.original.action}</span>
    ),
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({ row }) => <StatusBadge label={row.original.status} tone={row.original.statusTone} />,
  },
];

export function RecentIncidentsTable() {
  return (
    <DataTable<IncidentRow>
      className='border-border/80 from-card via-emerald-50/30 to-teal-50/20 overflow-hidden bg-linear-to-br shadow-[0_10px_40px_-24px_rgba(15,23,42,0.25)] dark:via-emerald-950/20 dark:to-teal-950/15'
      tableHeader={
        <div className='flex items-center gap-3'>
          <div className='flex size-9 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600 shadow-sm dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300'>
            <ShieldAlert className='size-4' />
          </div>
          <div>
            <span className='text-foreground text-[15px] font-semibold tracking-tight'>
              Recent incidents
            </span>
            <p className='text-muted-foreground text-[11px]'>
              Safety events and corrective actions along the trunk line
            </p>
          </div>
        </div>
      }
      columns={columns}
      data={INCIDENT_ROWS}
      total={INCIDENT_ROWS.length}
      currentPage={0}
      pageSize={INCIDENT_ROWS.length}
      showpagination={false}
      variant='soft'
      emptyMessage='No incidents.'
    />
  );
}
