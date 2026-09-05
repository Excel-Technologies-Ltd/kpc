import { AnimatedSection } from '@/components/shared/AnimatedSection';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  ReportNav,
  ReportSheet,
  ReportTable,
  ReportTd,
  REVENUE_REPORT,
  REVENUE_REPORT_ROWS,
} from '@/features/reports';
import { TableCell, TableRow } from '@/components/ui/table';

export default function TariffRevenueReport() {
  return (
    <div className='mx-auto max-w-7xl space-y-4'>
      <AnimatedSection>
        <PageHeader
          title='Reports'
          subtitle='Live, self-service, regulator-ready. Export or ask the assistant about any of them.'
          chips={[{ label: 'Format', value: 'KES · m³' }]}
        />
      </AnimatedSection>
      <ReportNav />
      <AnimatedSection delay={0.08}>
        <ReportSheet meta={REVENUE_REPORT}>
          <ReportTable
            headers={[
              'OMC customer',
              'Volume (m³)',
              'Tariff ($/m³)',
              'Invoiced (KES M)',
              'Paid',
              'Outstanding',
              'Aging',
              'Status',
            ]}
            footer={
              <TableRow>
                <TableCell className='px-3'>Total</TableCell>
                <TableCell className='px-3 font-mono tabular-nums'>18,712</TableCell>
                <TableCell className='px-3 font-mono tabular-nums'>—</TableCell>
                <TableCell className='px-3 font-mono tabular-nums'>560</TableCell>
                <TableCell className='px-3 font-mono tabular-nums'>394</TableCell>
                <TableCell className='px-3 font-mono tabular-nums'>166</TableCell>
                <TableCell colSpan={2} />
              </TableRow>
            }
          >
            {REVENUE_REPORT_ROWS.map((r) => (
              <TableRow key={r.customer}>
                <ReportTd className='font-semibold'>{r.customer}</ReportTd>
                <ReportTd mono>{r.volume}</ReportTd>
                <ReportTd mono>{r.tariff}</ReportTd>
                <ReportTd mono>{r.invoiced}</ReportTd>
                <ReportTd mono>{r.paid}</ReportTd>
                <ReportTd mono>{r.outstanding}</ReportTd>
                <ReportTd>{r.aging}</ReportTd>
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
