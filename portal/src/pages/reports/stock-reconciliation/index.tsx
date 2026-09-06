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
  useStockReconciliationReport,
} from '@/features/reports';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  Bot,
  Building2,
  CheckCircle2,
  Droplets,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { useCallback, useState } from 'react';

interface VisibleColumns {
  capacity: boolean;
  book: boolean;
  physical: boolean;
  variance: boolean;
  varPct: boolean;
  ullage: boolean;
}

const DEPOT_OPTIONS = [
  { id: 'NBO-01', label: 'Nairobi Depot' },
  { id: 'MSA-01', label: 'Mombasa Depot' },
  { id: 'ALL', label: 'All Depots' },
];

export default function StockReconciliationReport() {
  const [selectedTerminal, setSelectedTerminal] = useState<string>('NBO-01');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isColumnsOpen, setIsColumnsOpen] = useState(false);
  const [visibleCols, setVisibleCols] = useState<VisibleColumns>({
    capacity: true,
    book: true,
    physical: true,
    variance: true,
    varPct: true,
    ullage: true,
  });

  const { meta, rows, footer, isLive, isLoading, mutate } =
    useStockReconciliationReport(selectedTerminal);

  const handleToolClick = useCallback(
    (toolId: string) => {
      if (toolId === 'excel') {
        const headers = ['Tank', 'Product'];
        if (visibleCols.capacity) headers.push('Capacity (m³)');
        if (visibleCols.book) headers.push('Book (m³)');
        if (visibleCols.physical) headers.push('Physical (m³)');
        if (visibleCols.variance) headers.push('Variance (m³)');
        if (visibleCols.varPct) headers.push('Var %');
        if (visibleCols.ullage) headers.push('Ullage (m³)');
        headers.push('Status');

        const csvRows = rows.map((r) => {
          const cells = [`"${r.tank}"`, `"${r.product}"`];
          if (visibleCols.capacity) cells.push(`"${r.capacity}"`);
          if (visibleCols.book) cells.push(`"${r.book}"`);
          if (visibleCols.physical) cells.push(`"${r.physical}"`);
          if (visibleCols.variance) cells.push(`"${r.variance}"`);
          if (visibleCols.varPct) cells.push(`"${r.varPct}"`);
          if (visibleCols.ullage) cells.push(`"${r.ullage}"`);
          cells.push(`"${r.status}"`);
          return cells.join(',');
        });

        const footerRowCells = [`"Total"`, `""`];
        if (visibleCols.capacity) footerRowCells.push(`"${footer.capacity}"`);
        if (visibleCols.book) footerRowCells.push(`"${footer.book}"`);
        if (visibleCols.physical) footerRowCells.push(`"${footer.physical}"`);
        if (visibleCols.variance) footerRowCells.push(`"${footer.variance}"`);
        if (visibleCols.varPct) footerRowCells.push(`"${footer.varPct}"`);
        if (visibleCols.ullage) footerRowCells.push(`"${footer.ullage}"`);
        footerRowCells.push(`""`);

        const csvContent = [headers.join(','), ...csvRows, footerRowCells.join(',')].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute(
          'download',
          `stock_reconciliation_report_${selectedTerminal}_${new Date().toISOString().slice(0, 10)}.csv`
        );
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
    [rows, footer, visibleCols, selectedTerminal]
  );

  // Dynamic table headers based on visible columns
  const tableHeaders = ['Tank', 'Product'];
  if (visibleCols.capacity) tableHeaders.push('Capacity');
  if (visibleCols.book) tableHeaders.push('Book');
  if (visibleCols.physical) tableHeaders.push('Physical');
  if (visibleCols.variance) tableHeaders.push('Variance');
  if (visibleCols.varPct) tableHeaders.push('Var %');
  if (visibleCols.ullage) tableHeaders.push('Ullage');
  tableHeaders.push('Status');

  const alarmingTanks = rows.filter((r) => r.status === 'High level');
  const watchingTanks = rows.filter((r) => r.status === 'Watch');

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

          {/* Depot / Terminal Selector Controls */}
          <div className='flex items-center gap-1.5 self-start rounded-xl border border-border/80 bg-card/70 p-1.5 backdrop-blur-md sm:self-center'>
            <Building2 className='ml-1 size-3.5 text-muted-foreground' />
            {DEPOT_OPTIONS.map((opt) => (
              <Button
                key={opt.id}
                type='button'
                size='sm'
                variant={selectedTerminal === opt.id ? 'secondary' : 'ghost'}
                className={cn(
                  'h-7 px-2.5 text-xs font-semibold',
                  selectedTerminal !== opt.id && 'text-muted-foreground hover:text-foreground'
                )}
                onClick={() => setSelectedTerminal(opt.id)}
              >
                {opt.label}
              </Button>
            ))}
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
                <TableCell colSpan={2} className='px-3 font-bold'>
                  Total
                </TableCell>
                {visibleCols.capacity && (
                  <TableCell className='px-3 font-mono font-bold tabular-nums'>
                    {footer.capacity}
                  </TableCell>
                )}
                {visibleCols.book && (
                  <TableCell className='px-3 font-mono font-bold tabular-nums'>
                    {footer.book}
                  </TableCell>
                )}
                {visibleCols.physical && (
                  <TableCell className='px-3 font-mono font-bold tabular-nums'>
                    {footer.physical}
                  </TableCell>
                )}
                {visibleCols.variance && (
                  <TableCell
                    className={cn(
                      'px-3 font-mono font-bold tabular-nums',
                      footer.variance.startsWith('-')
                        ? 'text-rose-600 dark:text-rose-400'
                        : footer.variance.startsWith('+')
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : undefined
                    )}
                  >
                    {footer.variance}
                  </TableCell>
                )}
                {visibleCols.varPct && (
                  <TableCell className='px-3 font-mono font-bold tabular-nums'>
                    {footer.varPct}
                  </TableCell>
                )}
                {visibleCols.ullage && (
                  <TableCell className='px-3 font-mono font-bold tabular-nums'>
                    {footer.ullage}
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
                    ? 'Loading tank stock positions from API...'
                    : 'No tank records found for this terminal.'}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.tank}>
                  <ReportTd mono className='font-semibold'>
                    {r.tank}
                  </ReportTd>
                  <ReportTd>{r.product}</ReportTd>
                  {visibleCols.capacity && <ReportTd mono>{r.capacity}</ReportTd>}
                  {visibleCols.book && <ReportTd mono>{r.book}</ReportTd>}
                  {visibleCols.physical && <ReportTd mono>{r.physical}</ReportTd>}
                  {visibleCols.variance && (
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
                  )}
                  {visibleCols.varPct && <ReportTd mono>{r.varPct}</ReportTd>}
                  {visibleCols.ullage && <ReportTd mono>{r.ullage}</ReportTd>}
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
              Select which tank metrics to display on the Stock Reconciliation table and include in CSV exports.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3 py-2'>
            <div className='flex items-center justify-between rounded-lg border border-border/70 p-2.5 transition-colors hover:bg-muted/40'>
              <div className='space-y-0.5'>
                <p className='text-xs font-semibold text-foreground'>Nominal Capacity (m³)</p>
                <p className='text-[11px] text-muted-foreground'>Total volume rating of tank</p>
              </div>
              <Checkbox
                checked={visibleCols.capacity}
                onCheckedChange={(c) =>
                  setVisibleCols((prev) => ({ ...prev, capacity: Boolean(c) }))
                }
              />
            </div>

            <div className='flex items-center justify-between rounded-lg border border-border/70 p-2.5 transition-colors hover:bg-muted/40'>
              <div className='space-y-0.5'>
                <p className='text-xs font-semibold text-foreground'>Book Stock (m³)</p>
                <p className='text-[11px] text-muted-foreground'>Ledger accounting balance</p>
              </div>
              <Checkbox
                checked={visibleCols.book}
                onCheckedChange={(c) =>
                  setVisibleCols((prev) => ({ ...prev, book: Boolean(c) }))
                }
              />
            </div>

            <div className='flex items-center justify-between rounded-lg border border-border/70 p-2.5 transition-colors hover:bg-muted/40'>
              <div className='space-y-0.5'>
                <p className='text-xs font-semibold text-foreground'>Physical Stock (m³)</p>
                <p className='text-[11px] text-muted-foreground'>Actual dipped/gauged inventory</p>
              </div>
              <Checkbox
                checked={visibleCols.physical}
                onCheckedChange={(c) =>
                  setVisibleCols((prev) => ({ ...prev, physical: Boolean(c) }))
                }
              />
            </div>

            <div className='flex items-center justify-between rounded-lg border border-border/70 p-2.5 transition-colors hover:bg-muted/40'>
              <div className='space-y-0.5'>
                <p className='text-xs font-semibold text-foreground'>Variance (m³)</p>
                <p className='text-[11px] text-muted-foreground'>Physical minus Book stock</p>
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
                <p className='text-xs font-semibold text-foreground'>Variance Percentage (%)</p>
                <p className='text-[11px] text-muted-foreground'>Tolerance breach tracking ratio</p>
              </div>
              <Checkbox
                checked={visibleCols.varPct}
                onCheckedChange={(c) =>
                  setVisibleCols((prev) => ({ ...prev, varPct: Boolean(c) }))
                }
              />
            </div>

            <div className='flex items-center justify-between rounded-lg border border-border/70 p-2.5 transition-colors hover:bg-muted/40'>
              <div className='space-y-0.5'>
                <p className='text-xs font-semibold text-foreground'>Available Ullage (m³)</p>
                <p className='text-[11px] text-muted-foreground'>Headroom available to receive batches</p>
              </div>
              <Checkbox
                checked={visibleCols.ullage}
                onCheckedChange={(c) =>
                  setVisibleCols((prev) => ({ ...prev, ullage: Boolean(c) }))
                }
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
                setVisibleCols({
                  capacity: true,
                  book: true,
                  physical: true,
                  variance: true,
                  varPct: true,
                  ullage: true,
                })
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
              Operational Assistant · Stock Reconciliation
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Real-time tank level assessment and ullage management diagnosis.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3.5 py-1 text-xs'>
            <div className='rounded-xl border border-primary/20 bg-primary/5 p-3.5'>
              <div className='flex items-start gap-2.5'>
                <Sparkles className='mt-0.5 size-4 text-primary shrink-0' />
                <div>
                  <p className='font-semibold text-foreground'>Depot Stock Overview</p>
                  <p className='mt-1 text-muted-foreground leading-relaxed'>{meta.aiNote}</p>
                </div>
              </div>
            </div>

            {alarmingTanks.length > 0 && (
              <div className='rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5 dark:border-rose-500/30'>
                <div className='flex items-start gap-2.5'>
                  <AlertTriangle className='mt-0.5 size-4 text-rose-600 dark:text-rose-400 shrink-0' />
                  <div className='space-y-1.5'>
                    <p className='font-semibold text-rose-700 dark:text-rose-400'>
                      High-Level Fill Alarms ({alarmingTanks.length})
                    </p>
                    {alarmingTanks.map((tank) => (
                      <div
                        key={tank.tank}
                        className='flex items-center justify-between rounded-lg bg-background/60 px-2.5 py-1.5'
                      >
                        <span className='font-medium text-foreground'>
                          {tank.tank} ({tank.product})
                        </span>
                        <span className='font-mono font-bold text-rose-600 dark:text-rose-400'>
                          {tank.physical} m³ · Ullage {tank.ullage} m³
                        </span>
                      </div>
                    ))}
                    <p className='text-[11px] text-muted-foreground'>
                      Action Required: Halt inlet pumping and initiate tank transfer or truck loading dispatch.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {watchingTanks.length > 0 && (
              <div className='rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 dark:border-amber-500/30'>
                <div className='flex items-start gap-2.5'>
                  <Droplets className='mt-0.5 size-4 text-amber-600 dark:text-amber-400 shrink-0' />
                  <div className='space-y-1.5'>
                    <p className='font-semibold text-amber-700 dark:text-amber-400'>
                      Variance on Watch ({watchingTanks.length})
                    </p>
                    {watchingTanks.map((tank) => (
                      <div
                        key={tank.tank}
                        className='flex items-center justify-between rounded-lg bg-background/60 px-2.5 py-1.5'
                      >
                        <span className='font-medium text-foreground'>
                          {tank.tank} ({tank.product})
                        </span>
                        <span className='font-mono font-bold text-amber-600 dark:text-amber-400'>
                          {tank.varPct} ({tank.variance} m³)
                        </span>
                      </div>
                    ))}
                    <p className='text-[11px] text-muted-foreground'>
                      Recommendation: Verify automated tank gauge calibration and water bottom dips.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {alarmingTanks.length === 0 && watchingTanks.length === 0 && (
              <div className='rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 dark:border-emerald-500/30'>
                <div className='flex items-start gap-2.5'>
                  <CheckCircle2 className='mt-0.5 size-4 text-emerald-600 dark:text-emerald-400 shrink-0' />
                  <div>
                    <p className='font-semibold text-emerald-700 dark:text-emerald-400'>
                      Depot Operations Nominal
                    </p>
                    <p className='text-muted-foreground'>
                      All storage tanks are within tolerance envelopes with adequate receiving ullage.
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
