import { AnimatedSection } from '@/components/shared/AnimatedSection';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  ReportNav,
  ReportSheet,
  ReportTable,
  ReportTd,
  STOCK_FOOT,
  STOCK_REPORT,
  STOCK_ROWS,
} from '@/features/reports';
import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

export default function StockReconciliationReport() {
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
        <ReportSheet meta={STOCK_REPORT}>
          <ReportTable
            headers={[
              'Tank',
              'Product',
              'Capacity',
              'Book',
              'Physical',
              'Variance',
              'Var %',
              'Ullage',
              'Status',
            ]}
            footer={
              <TableRow>
                <TableCell colSpan={2} className='px-3'>
                  Total
                </TableCell>
                <TableCell className='px-3 font-mono tabular-nums'>{STOCK_FOOT.capacity}</TableCell>
                <TableCell className='px-3 font-mono tabular-nums'>{STOCK_FOOT.book}</TableCell>
                <TableCell className='px-3 font-mono tabular-nums'>{STOCK_FOOT.physical}</TableCell>
                <TableCell className='px-3 font-mono text-rose-600 tabular-nums dark:text-rose-400'>
                  {STOCK_FOOT.variance}
                </TableCell>
                <TableCell className='px-3 font-mono tabular-nums'>{STOCK_FOOT.varPct}</TableCell>
                <TableCell className='px-3 font-mono tabular-nums'>{STOCK_FOOT.ullage}</TableCell>
                <TableCell />
              </TableRow>
            }
          >
            {STOCK_ROWS.map((r) => (
              <TableRow key={r.tank}>
                <ReportTd mono className='font-semibold'>
                  {r.tank}
                </ReportTd>
                <ReportTd>{r.product}</ReportTd>
                <ReportTd mono>{r.capacity}</ReportTd>
                <ReportTd mono>{r.book}</ReportTd>
                <ReportTd mono>{r.physical}</ReportTd>
                <ReportTd
                  mono
                  className={cn(
                    r.variance.startsWith('-')
                      ? 'text-rose-600 dark:text-rose-400'
                      : r.variance.startsWith('+')
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : undefined
                  )}
                >
                  {r.variance}
                </ReportTd>
                <ReportTd mono>{r.varPct}</ReportTd>
                <ReportTd mono>{r.ullage}</ReportTd>
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
