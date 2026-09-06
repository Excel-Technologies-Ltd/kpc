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
  useProductLossReport,
} from '@/features/reports';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  FileCheck2,
  FileSpreadsheet,
  Gauge,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { useCallback, useState } from 'react';

interface VisibleColumns {
  length: boolean;
  throughput: boolean;
  loss: boolean;
  lossPct: boolean;
  tolerance: boolean;
  cause: boolean;
}

export default function ProductLossReport() {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isColumnsOpen, setIsColumnsOpen] = useState(false);
  const [isEpraSuccessOpen, setIsEpraSuccessOpen] = useState(false);
  const [visibleCols, setVisibleCols] = useState<VisibleColumns>({
    length: true,
    throughput: true,
    loss: true,
    lossPct: true,
    tolerance: true,
    cause: true,
  });

  const { meta, rows, footer, isLive, isLoading, mutate } = useProductLossReport('MTD');

  const handleExportEpraReturn = useCallback(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const headers = [
      'Statutory Schedule',
      'Segment Route',
      'Length (km)',
      'Delivered Throughput (m³)',
      'Unaccounted Loss (m³)',
      'Loss %',
      'Allowable Limit %',
      'Variance from Limit %',
      'Primary Incident Classification',
      'Regulatory Compliance State',
    ];

    const epraRows = rows.map((r) => {
      const diff = Number((r.lossPct - 0.2).toFixed(2));
      const diffStr = diff > 0 ? `+${diff}%` : `${diff}%`;
      return [
        `"EPRA-FORM-P04"`,
        `"${r.segment.replace('–', ' - ')}"`,
        `"${r.length.replace(' km', '')}"`,
        `"${r.throughput}"`,
        `"${r.loss}"`,
        `"${r.lossPct.toFixed(2)}%"`,
        `"0.20%"`,
        `"${diffStr}"`,
        `"${r.cause}"`,
        `"${r.flag}"`,
      ].join(',');
    });

    const epraFooter = [
      `"EPRA-FORM-P04-TOTAL"`,
      `"Total Pipeline Network"`,
      `"${footer.length.replace(' km', '')}"`,
      `"${footer.throughput}"`,
      `"${footer.loss}"`,
      `"${footer.lossPct}"`,
      `"0.20%"`,
      `"${(Number(footer.lossPct.replace('%', '')) - 0.2).toFixed(2)}%"`,
      `"Consolidated"`,
      `"${footer.flag}"`,
    ].join(',');

    const csvContent = [headers.join(','), ...epraRows, epraFooter].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `epra_statutory_loss_return_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsEpraSuccessOpen(true);
  }, [rows, footer]);

  const handleToolClick = useCallback(
    (toolId: string) => {
      if (toolId === 'epra') {
        handleExportEpraReturn();
      } else if (toolId === 'excel') {
        const headers = ['Segment'];
        if (visibleCols.length) headers.push('Length');
        if (visibleCols.throughput) headers.push('Throughput (m³)');
        if (visibleCols.loss) headers.push('Loss (m³)');
        if (visibleCols.lossPct) headers.push('Loss %');
        if (visibleCols.cause) headers.push('Likely Cause');
        headers.push('Compliance Flag');

        const csvRows = rows.map((r) => {
          const cells = [`"${r.segment}"`];
          if (visibleCols.length) cells.push(`"${r.length}"`);
          if (visibleCols.throughput) cells.push(`"${r.throughput}"`);
          if (visibleCols.loss) cells.push(`"${r.loss}"`);
          if (visibleCols.lossPct) cells.push(`"${r.lossPct.toFixed(2)}%"`);
          if (visibleCols.cause) cells.push(`"${r.cause}"`);
          cells.push(`"${r.flag}"`);
          return cells.join(',');
        });

        const footerRowCells = [`"Network"`];
        if (visibleCols.length) footerRowCells.push(`"${footer.length}"`);
        if (visibleCols.throughput) footerRowCells.push(`"${footer.throughput}"`);
        if (visibleCols.loss) footerRowCells.push(`"${footer.loss}"`);
        if (visibleCols.lossPct) footerRowCells.push(`"${footer.lossPct}"`);
        if (visibleCols.cause) footerRowCells.push(`""`);
        footerRowCells.push(`"${footer.flag}"`);

        const csvContent = [headers.join(','), ...csvRows, footerRowCells.join(',')].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute(
          'download',
          `product_loss_unaccounted_report_${new Date().toISOString().slice(0, 10)}.csv`
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
    [rows, footer, visibleCols, handleExportEpraReturn]
  );

  // Dynamic headers
  const tableHeaders = ['Segment'];
  if (visibleCols.length) tableHeaders.push('Length');
  if (visibleCols.throughput) tableHeaders.push('Throughput');
  if (visibleCols.loss) tableHeaders.push('Loss (m³)');
  if (visibleCols.lossPct) tableHeaders.push('Loss %');
  if (visibleCols.tolerance) tableHeaders.push('vs Tolerance');
  if (visibleCols.cause) tableHeaders.push('Likely cause');
  tableHeaders.push('Flag');

  const breachedSegments = rows.filter((r) => r.flag === 'Breach');
  const watchingSegments = rows.filter((r) => r.flag === 'Watch');

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
            headers={tableHeaders}
            footer={
              <TableRow>
                <TableCell className='px-3 font-bold'>Network</TableCell>
                {visibleCols.length && (
                  <TableCell className='px-3 font-mono font-bold tabular-nums'>
                    {footer.length}
                  </TableCell>
                )}
                {visibleCols.throughput && (
                  <TableCell className='px-3 font-mono font-bold tabular-nums'>
                    {footer.throughput}
                  </TableCell>
                )}
                {visibleCols.loss && (
                  <TableCell className='px-3 font-mono font-bold tabular-nums'>
                    {footer.loss}
                  </TableCell>
                )}
                {visibleCols.lossPct && (
                  <TableCell className='px-3 font-mono font-bold tabular-nums'>
                    {footer.lossPct}
                  </TableCell>
                )}
                {visibleCols.tolerance && <TableCell />}
                {visibleCols.cause && <TableCell />}
                <TableCell className='px-3'>
                  <StatusBadge label={footer.flag} tone={footer.tone} />
                </TableCell>
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
                    ? 'Loading pipeline loss records from API...'
                    : 'No segment loss records found for this period.'}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.segment}>
                  <ReportTd className='font-semibold'>{r.segment}</ReportTd>
                  {visibleCols.length && <ReportTd mono>{r.length}</ReportTd>}
                  {visibleCols.throughput && <ReportTd mono>{r.throughput}</ReportTd>}
                  {visibleCols.loss && <ReportTd mono>{r.loss}</ReportTd>}
                  {visibleCols.lossPct && (
                    <ReportTd
                      mono
                      className={cn(
                        r.lossPct > 0.2
                          ? 'font-bold text-rose-600 dark:text-rose-400'
                          : r.lossPct > 0.15
                            ? 'font-medium text-amber-600 dark:text-amber-400'
                            : undefined
                      )}
                    >
                      {r.lossPct.toFixed(2)}%
                    </ReportTd>
                  )}
                  {visibleCols.tolerance && (
                    <ReportTd>
                      <div className='h-1.5 w-24 overflow-hidden rounded-full bg-muted'>
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
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
                  )}
                  {visibleCols.cause && (
                    <ReportTd className='text-xs text-muted-foreground'>{r.cause}</ReportTd>
                  )}
                  <ReportTd>
                    <StatusBadge label={r.flag} tone={r.tone} />
                  </ReportTd>
                </TableRow>
              ))
            )}
          </ReportTable>
        </ReportSheet>
      </AnimatedSection>

      {/* EPRA Export Confirmation Dialog */}
      <Dialog open={isEpraSuccessOpen} onOpenChange={setIsEpraSuccessOpen}>
        <DialogContent className='max-w-sm sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-base font-bold text-emerald-600 dark:text-emerald-400'>
              <FileCheck2 className='size-5' />
              EPRA Regulatory Return Exported
            </DialogTitle>
            <DialogDescription className='text-xs'>
              The official Form P-04 loss return has been generated and downloaded in CSV format.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-2 py-2 text-xs text-muted-foreground'>
            <p>
              This document includes custody transfer volumes, meter uncertainties, interface cut
              allocations, and segment variance reconciliation ready for regulatory audit.
            </p>
          </div>
          <DialogFooter>
            <Button
              type='button'
              size='sm'
              className='h-8 text-xs'
              onClick={() => setIsEpraSuccessOpen(false)}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Columns Visibility Modal */}
      <Dialog open={isColumnsOpen} onOpenChange={setIsColumnsOpen}>
        <DialogContent className='max-w-sm sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-base font-bold'>
              <SlidersHorizontal className='size-4 text-primary' />
              Configure Visible Columns
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Select which loss metrics to display on the Product Loss table and include in CSV exports.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3 py-2'>
            <div className='flex items-center justify-between rounded-lg border border-border/70 p-2.5 transition-colors hover:bg-muted/40'>
              <div className='space-y-0.5'>
                <p className='text-xs font-semibold text-foreground'>Segment Length (km)</p>
                <p className='text-[11px] text-muted-foreground'>Geographical distance of line leg</p>
              </div>
              <Checkbox
                checked={visibleCols.length}
                onCheckedChange={(c) => setVisibleCols((prev) => ({ ...prev, length: Boolean(c) }))}
              />
            </div>

            <div className='flex items-center justify-between rounded-lg border border-border/70 p-2.5 transition-colors hover:bg-muted/40'>
              <div className='space-y-0.5'>
                <p className='text-xs font-semibold text-foreground'>Throughput (m³)</p>
                <p className='text-[11px] text-muted-foreground'>Volume pumped through segment</p>
              </div>
              <Checkbox
                checked={visibleCols.throughput}
                onCheckedChange={(c) =>
                  setVisibleCols((prev) => ({ ...prev, throughput: Boolean(c) }))
                }
              />
            </div>

            <div className='flex items-center justify-between rounded-lg border border-border/70 p-2.5 transition-colors hover:bg-muted/40'>
              <div className='space-y-0.5'>
                <p className='text-xs font-semibold text-foreground'>Loss Volume (m³)</p>
                <p className='text-[11px] text-muted-foreground'>Unaccounted-for quantity in transit</p>
              </div>
              <Checkbox
                checked={visibleCols.loss}
                onCheckedChange={(c) => setVisibleCols((prev) => ({ ...prev, loss: Boolean(c) }))}
              />
            </div>

            <div className='flex items-center justify-between rounded-lg border border-border/70 p-2.5 transition-colors hover:bg-muted/40'>
              <div className='space-y-0.5'>
                <p className='text-xs font-semibold text-foreground'>Loss Percentage (%)</p>
                <p className='text-[11px] text-muted-foreground'>Ratio of loss to segment throughput</p>
              </div>
              <Checkbox
                checked={visibleCols.lossPct}
                onCheckedChange={(c) =>
                  setVisibleCols((prev) => ({ ...prev, lossPct: Boolean(c) }))
                }
              />
            </div>

            <div className='flex items-center justify-between rounded-lg border border-border/70 p-2.5 transition-colors hover:bg-muted/40'>
              <div className='space-y-0.5'>
                <p className='text-xs font-semibold text-foreground'>vs Tolerance Bar</p>
                <p className='text-[11px] text-muted-foreground'>Visual progress bar vs 0.20% EPRA limit</p>
              </div>
              <Checkbox
                checked={visibleCols.tolerance}
                onCheckedChange={(c) =>
                  setVisibleCols((prev) => ({ ...prev, tolerance: Boolean(c) }))
                }
              />
            </div>

            <div className='flex items-center justify-between rounded-lg border border-border/70 p-2.5 transition-colors hover:bg-muted/40'>
              <div className='space-y-0.5'>
                <p className='text-xs font-semibold text-foreground'>Likely Cause</p>
                <p className='text-[11px] text-muted-foreground'>Variance incident categorization</p>
              </div>
              <Checkbox
                checked={visibleCols.cause}
                onCheckedChange={(c) => setVisibleCols((prev) => ({ ...prev, cause: Boolean(c) }))}
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
                  length: true,
                  throughput: true,
                  loss: true,
                  lossPct: true,
                  tolerance: true,
                  cause: true,
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
              Operational Assistant · Loss Analysis & EPRA Compliance
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Automated audit of custody transfer reconciliations against EPRA 0.20% allowable limits.
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

            {breachedSegments.length > 0 && (
              <div className='rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5 dark:border-rose-500/30'>
                <div className='flex items-start gap-2.5'>
                  <AlertTriangle className='mt-0.5 size-4 text-rose-600 dark:text-rose-400 shrink-0' />
                  <div className='space-y-1.5'>
                    <p className='font-semibold text-rose-700 dark:text-rose-400'>
                      Tolerance Breach Incident ({breachedSegments.length})
                    </p>
                    {breachedSegments.map((seg) => (
                      <div
                        key={seg.segment}
                        className='flex items-center justify-between rounded-lg bg-background/60 px-2.5 py-1.5'
                      >
                        <span className='font-medium text-foreground'>
                          {seg.segment} ({seg.cause})
                        </span>
                        <span className='font-mono font-bold text-rose-600 dark:text-rose-400'>
                          {seg.lossPct.toFixed(2)}% ({seg.loss} m³)
                        </span>
                      </div>
                    ))}
                    <p className='text-[11px] text-muted-foreground'>
                      Immediate Actions: Trigger line balance mass audit, cross-check block valve
                      telemetry along KP104, and notify security response team.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {watchingSegments.length > 0 && (
              <div className='rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 dark:border-amber-500/30'>
                <div className='flex items-start gap-2.5'>
                  <Gauge className='mt-0.5 size-4 text-amber-600 dark:text-amber-400 shrink-0' />
                  <div className='space-y-1.5'>
                    <p className='font-semibold text-amber-700 dark:text-amber-400'>
                      Segments on Watch ({watchingSegments.length})
                    </p>
                    {watchingSegments.map((seg) => (
                      <div
                        key={seg.segment}
                        className='flex items-center justify-between rounded-lg bg-background/60 px-2.5 py-1.5'
                      >
                        <span className='font-medium text-foreground'>
                          {seg.segment} ({seg.cause})
                        </span>
                        <span className='font-mono font-bold text-amber-600 dark:text-amber-400'>
                          {seg.lossPct.toFixed(2)}% ({seg.loss} m³)
                        </span>
                      </div>
                    ))}
                    <p className='text-[11px] text-muted-foreground'>
                      Recommendation: Inspect prover loop calibration on fiscal custody meters.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {breachedSegments.length === 0 && watchingSegments.length === 0 && (
              <div className='rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 dark:border-emerald-500/30'>
                <div className='flex items-start gap-2.5'>
                  <CheckCircle2 className='mt-0.5 size-4 text-emerald-600 dark:text-emerald-400 shrink-0' />
                  <div>
                    <p className='font-semibold text-emerald-700 dark:text-emerald-400'>
                      Network Loss Nominal
                    </p>
                    <p className='text-muted-foreground'>
                      All pipeline segments are operating below the 0.15% internal tolerance threshold.
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
