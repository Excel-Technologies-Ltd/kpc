import { AnimatedSection } from '@/components/shared/AnimatedSection';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TableCell, TableRow } from '@/components/ui/table';
import {
  ReportNav,
  ReportSheet,
  ReportTable,
  ReportTd,
  useDailyThroughputReport,
} from '@/features/reports';
import { cn } from '@/lib/utils';
import { Bot, Calendar, SlidersHorizontal, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
import { useCallback, useState } from 'react';

interface VisibleColumns {
  planned: boolean;
  actual: boolean;
  variance: boolean;
  attain: boolean;
}

export default function DailyThroughputReport() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isColumnsOpen, setIsColumnsOpen] = useState(false);
  const [visibleCols, setVisibleCols] = useState<VisibleColumns>({
    planned: true,
    actual: true,
    variance: true,
    attain: true,
  });

  const { meta, rows, footer, isLive, isLoading, mutate } = useDailyThroughputReport(selectedDate);

  const handleSetQuickDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() - offsetDays);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const handleToolClick = useCallback(
    (toolId: string) => {
      if (toolId === 'excel') {
        const headers = ['Line', 'Route', 'Product'];
        if (visibleCols.planned) headers.push('Planned (m³)');
        if (visibleCols.actual) headers.push('Actual (m³)');
        if (visibleCols.variance) headers.push('Variance (m³)');
        if (visibleCols.attain) headers.push('Attain %');
        headers.push('Status');

        const csvRows = rows.map((r) => {
          const cells = [`"${r.line}"`, `"${r.route}"`, `"${r.product}"`];
          if (visibleCols.planned) cells.push(`"${r.planned}"`);
          if (visibleCols.actual) cells.push(`"${r.actual}"`);
          if (visibleCols.variance) cells.push(`"${r.variance}"`);
          if (visibleCols.attain) cells.push(`"${r.attain}"`);
          cells.push(`"${r.status}"`);
          return cells.join(',');
        });

        const footerRowCells = [`"Total"`, `""`, `""`];
        if (visibleCols.planned) footerRowCells.push(`"${footer.planned}"`);
        if (visibleCols.actual) footerRowCells.push(`"${footer.actual}"`);
        if (visibleCols.variance) footerRowCells.push(`"${footer.variance}"`);
        if (visibleCols.attain) footerRowCells.push(`"${footer.attain}"`);
        footerRowCells.push(`""`);

        const csvContent = [headers.join(','), ...csvRows, footerRowCells.join(',')].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `daily_throughput_report_${selectedDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (toolId === 'pdf') {
        window.print();
      } else if (toolId === 'cols') {
        setIsColumnsOpen(true);
      } else if (toolId === 'ask') {
        setIsAssistantOpen(true);
      }
    },
    [rows, footer, visibleCols, selectedDate]
  );

  // Dynamic table headers based on visible columns
  const tableHeaders = ['Line', 'Route', 'Product'];
  if (visibleCols.planned) tableHeaders.push('Planned');
  if (visibleCols.actual) tableHeaders.push('Actual');
  if (visibleCols.variance) tableHeaders.push('Variance');
  if (visibleCols.attain) tableHeaders.push('Attain %');
  tableHeaders.push('Status');

  const laggingRows = rows.filter((r) => {
    const num = Number(r.attain.replace(/[^0-9.-]/g, ''));
    return !isNaN(num) && num < 95;
  });

  const leadingRows = rows.filter((r) => {
    const num = Number(r.attain.replace(/[^0-9.-]/g, ''));
    return !isNaN(num) && num >= 105;
  });

  return (
    <div className='w-full min-w-0 space-y-4'>
      <AnimatedSection>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
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

          {/* Date Selector Controls */}
          <div className='flex items-center gap-2 self-start rounded-xl border border-border/80 bg-card/70 p-1.5 backdrop-blur-md sm:self-center'>
            <Calendar className='ml-1.5 size-3.5 text-muted-foreground' />
            <div className='flex items-center gap-1'>
              <Button
                type='button'
                size='sm'
                variant={selectedDate === todayStr ? 'secondary' : 'ghost'}
                className='h-7 px-2 text-xs font-semibold'
                onClick={() => handleSetQuickDate(0)}
              >
                Today
              </Button>
              <Button
                type='button'
                size='sm'
                variant={
                  selectedDate === new Date(Date.now() - 86400000).toISOString().slice(0, 10)
                    ? 'secondary'
                    : 'ghost'
                }
                className='h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground'
                onClick={() => handleSetQuickDate(1)}
              >
                Yesterday
              </Button>
            </div>
            <div className='h-4 w-px bg-border/80' />
            <input
              type='date'
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              className='h-7 rounded-lg border border-border/60 bg-muted/40 px-2 text-xs font-medium text-foreground outline-none transition-colors focus:border-primary'
            />
          </div>
        </div>
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
            headers={tableHeaders}
            footer={
              <TableRow>
                <TableCell colSpan={3} className='px-3 font-bold'>
                  Total
                </TableCell>
                {visibleCols.planned && (
                  <TableCell className='px-3 font-mono font-bold tabular-nums'>
                    {footer.planned}
                  </TableCell>
                )}
                {visibleCols.actual && (
                  <TableCell className='px-3 font-mono font-bold tabular-nums'>
                    {footer.actual}
                  </TableCell>
                )}
                {visibleCols.variance && (
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
                )}
                {visibleCols.attain && (
                  <TableCell className='px-3 font-mono font-bold tabular-nums'>
                    {footer.attain}
                  </TableCell>
                )}
                <TableCell />
              </TableRow>
            }
          >
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={tableHeaders.length}
                  className='h-24 text-center text-xs text-muted-foreground'
                >
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
                  {visibleCols.planned && <ReportTd mono>{r.planned}</ReportTd>}
                  {visibleCols.actual && <ReportTd mono>{r.actual}</ReportTd>}
                  {visibleCols.variance && (
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
                  )}
                  {visibleCols.attain && <ReportTd mono>{r.attain}</ReportTd>}
                  <ReportTd>
                    <StatusBadge label={r.status} tone={r.tone} />
                  </ReportTd>
                </TableRow>
              ))
            )}
          </ReportTable>
        </ReportSheet>
      </AnimatedSection>

      {/* Columns Visibility Modal */}
      <Dialog open={isColumnsOpen} onOpenChange={setIsColumnsOpen}>
        <DialogContent className='max-w-sm sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-base font-bold'>
              <SlidersHorizontal className='size-4 text-primary' />
              Configure Visible Columns
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Select which metrics to display on the Daily Throughput table and include in CSV
              exports.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3 py-2'>
            <div className='flex items-center justify-between rounded-lg border border-border/70 p-2.5 transition-colors hover:bg-muted/40'>
              <div className='space-y-0.5'>
                <p className='text-xs font-semibold text-foreground'>Planned Volume (m³)</p>
                <p className='text-[11px] text-muted-foreground'>Nominated scheduled target</p>
              </div>
              <Checkbox
                checked={visibleCols.planned}
                onCheckedChange={(c) =>
                  setVisibleCols((prev) => ({ ...prev, planned: Boolean(c) }))
                }
              />
            </div>

            <div className='flex items-center justify-between rounded-lg border border-border/70 p-2.5 transition-colors hover:bg-muted/40'>
              <div className='space-y-0.5'>
                <p className='text-xs font-semibold text-foreground'>Actual Volume (m³)</p>
                <p className='text-[11px] text-muted-foreground'>Received or pumped quantity</p>
              </div>
              <Checkbox
                checked={visibleCols.actual}
                onCheckedChange={(c) => setVisibleCols((prev) => ({ ...prev, actual: Boolean(c) }))}
              />
            </div>

            <div className='flex items-center justify-between rounded-lg border border-border/70 p-2.5 transition-colors hover:bg-muted/40'>
              <div className='space-y-0.5'>
                <p className='text-xs font-semibold text-foreground'>Variance (m³)</p>
                <p className='text-[11px] text-muted-foreground'>
                  Difference between actual and planned
                </p>
              </div>
              <Checkbox
                checked={visibleCols.variance}
                onCheckedChange={(c) =>
                  setVisibleCols((prev) => ({ ...prev, variance: Boolean(c) }))
                }
              />
            </div>

            <div className='flex items-center justify-between rounded-lg border border-border/70 p-2.5 transition-colors hover:bg-muted/40'>
              <div className='space-y-0.5'>
                <p className='text-xs font-semibold text-foreground'>Attainment %</p>
                <p className='text-[11px] text-muted-foreground'>
                  Schedule target compliance ratio
                </p>
              </div>
              <Checkbox
                checked={visibleCols.attain}
                onCheckedChange={(c) => setVisibleCols((prev) => ({ ...prev, attain: Boolean(c) }))}
              />
            </div>
          </div>

          <DialogFooter className='gap-2 sm:justify-end'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='h-8 text-xs'
              onClick={() =>
                setVisibleCols({ planned: true, actual: true, variance: true, attain: true })
              }
            >
              Reset All
            </Button>
            <Button
              type='button'
              size='sm'
              className='h-8 text-xs'
              onClick={() => setIsColumnsOpen(false)}
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ask Assistant Operational Dialog */}
      <Dialog open={isAssistantOpen} onOpenChange={setIsAssistantOpen}>
        <DialogContent className='max-w-md sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-base font-bold'>
              <div className='flex size-6 items-center justify-center rounded-md bg-primary/15 text-primary'>
                <Bot className='size-3.5' />
              </div>
              Operational Assistant · Throughput Analysis
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Automated AI diagnosis based on {selectedDate} pipeline telemetry and nomination
              targets.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3.5 py-1 text-xs'>
            <div className='rounded-xl border border-primary/20 bg-primary/5 p-3.5'>
              <div className='flex items-start gap-2.5'>
                <Sparkles className='mt-0.5 size-4 text-primary shrink-0' />
                <div>
                  <p className='font-semibold text-foreground'>Executive Summary</p>
                  <p className='mt-1 text-muted-foreground leading-relaxed'>{meta.aiNote}</p>
                </div>
              </div>
            </div>

            {laggingRows.length > 0 && (
              <div className='rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 dark:border-amber-500/30'>
                <div className='flex items-start gap-2.5'>
                  <TrendingDown className='mt-0.5 size-4 text-amber-600 dark:text-amber-400 shrink-0' />
                  <div className='space-y-1.5'>
                    <p className='font-semibold text-amber-700 dark:text-amber-400'>
                      Legs Requiring Attention ({laggingRows.length})
                    </p>
                    {laggingRows.map((leg) => (
                      <div
                        key={`${leg.line}-${leg.route}`}
                        className='flex items-center justify-between rounded-lg bg-background/60 px-2.5 py-1.5'
                      >
                        <span className='font-medium text-foreground'>
                          {leg.line} · {leg.route} ({leg.product})
                        </span>
                        <span className='font-mono font-bold text-rose-600 dark:text-rose-400'>
                          {leg.attain} ({leg.variance} m³)
                        </span>
                      </div>
                    ))}
                    <p className='text-[11px] text-muted-foreground'>
                      Recommendation: Check booster station discharge pressures and line batch
                      interface cuts.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {leadingRows.length > 0 && (
              <div className='rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 dark:border-emerald-500/30'>
                <div className='flex items-start gap-2.5'>
                  <TrendingUp className='mt-0.5 size-4 text-emerald-600 dark:text-emerald-400 shrink-0' />
                  <div className='space-y-1'>
                    <p className='font-semibold text-emerald-700 dark:text-emerald-400'>
                      Optimal Flow Legs ({leadingRows.length})
                    </p>
                    <p className='text-muted-foreground'>
                      {leadingRows.map((r) => `${r.line} (${r.product})`).join(', ')} are flowing at{' '}
                      &ge;105% efficiency with stable velocity envelopes.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type='button'
              size='sm'
              className='h-8 text-xs'
              onClick={() => setIsAssistantOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
