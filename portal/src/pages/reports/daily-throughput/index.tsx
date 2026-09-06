import { AnimatedSection } from '@/components/shared/AnimatedSection';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  ReportNav,
  ReportSheet,
  ReportTable,
  ReportTd,
  THROUGHPUT_FOOT,
  THROUGHPUT_REPORT,
  THROUGHPUT_ROWS,
} from '@/features/reports';
import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

export default function DailyThroughputReport() {
  return (
    <div className='w-full min-w-0 space-y-4'>
      <AnimatedSection>
        <PageHeader
          title='Reports'
          subtitle='Live, self-service, regulator-ready. Export or ask the assistant about any of them.'
          chips={[{ label: 'Format', value: 'KES · m³' }]}
        />
      </AnimatedSection>
      <ReportNav />
      <AnimatedSection delay={0.08}>
        <ReportSheet meta={THROUGHPUT_REPORT}>
          <ReportTable
            headers={[
              'Line',
              'Route',
              'Product',
              'Planned',
              'Actual',
              'Variance',
              'Attain %',
              'Status',
            ]}
            footer={
              <TableRow>
                <TableCell colSpan={3} className='px-3'>
                  Total
                </TableCell>
                <TableCell className='px-3 font-mono tabular-nums'>
                  {THROUGHPUT_FOOT.planned}
                </TableCell>
                <TableCell className='px-3 font-mono tabular-nums'>
                  {THROUGHPUT_FOOT.actual}
                </TableCell>
                <TableCell className='px-3 font-mono text-emerald-600 tabular-nums dark:text-emerald-400'>
                  {THROUGHPUT_FOOT.variance}
                </TableCell>
                <TableCell className='px-3 font-mono tabular-nums'>
                  {THROUGHPUT_FOOT.attain}
                </TableCell>
                <TableCell />
              </TableRow>
            }
          >
            {THROUGHPUT_ROWS.map((r) => (
              <TableRow key={`${r.line}-${r.product}-${r.route}`}>
                <ReportTd>{r.line}</ReportTd>
                <ReportTd>{r.route}</ReportTd>
                <ReportTd>{r.product}</ReportTd>
                <ReportTd mono>{r.planned}</ReportTd>
                <ReportTd mono>{r.actual}</ReportTd>
                <ReportTd
                  mono
                  className={cn(
                    r.varianceUp
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  )}
                >
                  {r.variance}
                </ReportTd>
                <ReportTd mono>{r.attain}</ReportTd>
                <ReportTd>
                  <StatusBadge label={r.status} tone={r.tone} />
                </ReportTd>
              </TableRow>
            ))}
          </ReportTable>
        </ReportSheet>
      </AnimatedSection>
    </div>
  );
}
