import { AnimatedSection } from '@/components/shared/AnimatedSection';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  LOSS_REPORT,
  LOSS_REPORT_ROWS,
  ReportNav,
  ReportSheet,
  ReportTable,
  ReportTd,
} from '@/features/reports';
import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

export default function ProductLossReport() {
  return (
    <div className='mx-auto container space-y-4'>
      <AnimatedSection>
        <PageHeader
          title='Reports'
          subtitle='Live, self-service, regulator-ready. Export or ask the assistant about any of them.'
          chips={[{ label: 'Format', value: 'KES · m³' }]}
        />
      </AnimatedSection>
      <ReportNav />
      <AnimatedSection delay={0.08}>
        <ReportSheet meta={LOSS_REPORT}>
          <ReportTable
            headers={[
              'Segment',
              'Length',
              'Throughput',
              'Loss (m³)',
              'Loss %',
              'vs Tolerance',
              'Likely cause',
              'Flag',
            ]}
            footer={
              <TableRow>
                <TableCell className='px-3'>Network</TableCell>
                <TableCell className='px-3 font-mono tabular-nums'>556 km</TableCell>
                <TableCell className='px-3 font-mono tabular-nums'>1,731,000</TableCell>
                <TableCell className='px-3 font-mono tabular-nums'>2,593</TableCell>
                <TableCell className='px-3 font-mono tabular-nums'>0.15%</TableCell>
                <TableCell colSpan={2} />
                <TableCell className='px-3'>
                  <StatusBadge label='Within' tone='good' />
                </TableCell>
              </TableRow>
            }
          >
            {LOSS_REPORT_ROWS.map((r) => (
              <TableRow key={r.segment}>
                <ReportTd className='font-semibold'>{r.segment}</ReportTd>
                <ReportTd mono>{r.length}</ReportTd>
                <ReportTd mono>{r.throughput}</ReportTd>
                <ReportTd mono>{r.loss}</ReportTd>
                <ReportTd
                  mono
                  className={cn(
                    r.lossPct > 0.2 ? 'font-semibold text-rose-600 dark:text-rose-400' : undefined
                  )}
                >
                  {r.lossPct.toFixed(2)}%
                </ReportTd>
                <ReportTd>
                  <div className='bg-muted h-1.5 w-24 overflow-hidden rounded-full'>
                    <div
                      className={cn(
                        'h-full rounded-full',
                        r.lossPct > 0.2
                          ? 'bg-rose-500'
                          : r.lossPct > 0.15
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                      )}
                      style={{ width: `${Math.min(r.barPct, 100)}%` }}
                    />
                  </div>
                </ReportTd>
                <ReportTd className='text-muted-foreground'>{r.cause}</ReportTd>
                <ReportTd>
                  <StatusBadge label={r.flag} tone={r.tone} />
                </ReportTd>
              </TableRow>
            ))}
          </ReportTable>
        </ReportSheet>
      </AnimatedSection>
    </div>
  );
}
