import { AnimatedSection } from '@/components/shared/AnimatedSection';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { TableCell, TableRow } from '@/components/ui/table';
import {
  ReportNav,
  ReportSheet,
  ReportTable,
  ReportTd,
  useDailyThroughputReport,
} from '@/features/reports';
import { cn } from '@/lib/utils';
import { useCallback } from 'react';

export default function DailyThroughputReport() {
  const { meta, rows, footer, isLive, isLoading, mutate } = useDailyThroughputReport();

  const handleToolClick = useCallback(
    (toolId: string) => {
      if (toolId === 'excel') {
        const headers = [
          'Line',
          'Route',
          'Product',
          'Planned (m³)',
          'Actual (m³)',
          'Variance (m³)',
          'Attain %',
          'Status',
        ];
        const csvRows = rows.map((r) =>
          [
            `"${r.line}"`,
            `"${r.route}"`,
            `"${r.product}"`,
            `"${r.planned}"`,
            `"${r.actual}"`,
            `"${r.variance}"`,
            `"${r.attain}"`,
            `"${r.status}"`,
          ].join(',')
        );
        const footerRow = [
          `"Total"`,
          `""`,
          `""`,
          `"${footer.planned}"`,
          `"${footer.actual}"`,
          `"${footer.variance}"`,
          `"${footer.attain}"`,
          `""`,
        ].join(',');
        const csvContent = [headers.join(','), ...csvRows, footerRow].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute(
          'download',
          `daily_throughput_report_${new Date().toISOString().slice(0, 10)}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (toolId === 'pdf') {
        window.print();
      }
    },
    [rows, footer]
  );

  return (
    <div className='w-full min-w-0 space-y-4'>
      <AnimatedSection>
        <PageHeader
          title='Reports'
          subtitle='Live, self-service, regulator-ready. Export or ask the assistant about any of them.'
          chips={[
            { label: 'Format', value: 'KES · m³' },
            ...(isLive
              ? [{ label: 'Source', value: 'Frappe Live DB' }]
              : [{ label: 'Source', value: 'Operational Baseline' }]),
          ]}
        />
      </AnimatedSection>
      <ReportNav />
      <AnimatedSection delay={0.08}>
        <ReportSheet
          meta={meta}
          isLoading={isLoading}
          isLive={isLive}
          onRefresh={() => mutate()}
          onToolClick={handleToolClick}
        >
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
                <TableCell colSpan={3} className='px-3 font-bold'>
                  Total
                </TableCell>
                <TableCell className='px-3 font-mono font-bold tabular-nums'>
                  {footer.planned}
                </TableCell>
                <TableCell className='px-3 font-mono font-bold tabular-nums'>
                  {footer.actual}
                </TableCell>
                <TableCell
                  className={cn(
                    'px-3 font-mono font-bold tabular-nums',
                    footer.variance.startsWith('-')
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  )}
                >
                  {footer.variance}
                </TableCell>
                <TableCell className='px-3 font-mono font-bold tabular-nums'>
                  {footer.attain}
                </TableCell>
                <TableCell />
              </TableRow>
            }
          >
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className='h-24 text-center text-muted-foreground text-xs'>
                  {isLoading
                    ? 'Loading daily throughput records from API...'
                    : 'No operational throughput records found for this date.'}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
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
              ))
            )}
          </ReportTable>
        </ReportSheet>
      </AnimatedSection>
    </div>
  );
}
