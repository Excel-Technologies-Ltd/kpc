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
  useTariffRevenueReport,
} from '@/features/reports';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  AlertTriangle,
  Banknote,
  Bot,
  CheckCircle2,
  Clock,
  Coins,
  CreditCard,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useCallback, useState } from 'react';

interface VisibleColumns {
  volume: boolean;
  tariff: boolean;
  invoiced: boolean;
  paid: boolean;
  outstanding: boolean;
  aging: boolean;
}

export default function TariffRevenueReport() {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isColumnsOpen, setIsColumnsOpen] = useState(false);
  const [visibleCols, setVisibleCols] = useState<VisibleColumns>({
    volume: true,
    tariff: true,
    invoiced: true,
    paid: true,
    outstanding: true,
    aging: true,
  });

  const { meta, rows, footer, isLive, isLoading, mutate } = useTariffRevenueReport('MTD');

  const handleToolClick = useCallback(
    (toolId: string) => {
      if (toolId === 'excel') {
        const headers = ['OMC Customer'];
        if (visibleCols.volume) headers.push('Volume (m³)');
        if (visibleCols.tariff) headers.push('Tariff ($/m³)');
        if (visibleCols.invoiced) headers.push('Invoiced (KES M)');
        if (visibleCols.paid) headers.push('Paid (KES M)');
        if (visibleCols.outstanding) headers.push('Outstanding (KES M)');
        if (visibleCols.aging) headers.push('Aging Bracket');
        headers.push('Credit Status');

        const csvRows = rows.map((r) => {
          const cells = [`"${r.customer}"`];
          if (visibleCols.volume) cells.push(`"${r.volume}"`);
          if (visibleCols.tariff) cells.push(`"${r.tariff}"`);
          if (visibleCols.invoiced) cells.push(`"${r.invoiced}"`);
          if (visibleCols.paid) cells.push(`"${r.paid}"`);
          if (visibleCols.outstanding) cells.push(`"${r.outstanding}"`);
          if (visibleCols.aging) cells.push(`"${r.aging}"`);
          cells.push(`"${r.status}"`);
          return cells.join(',');
        });

        const footerRowCells = [`"Total"`];
        if (visibleCols.volume) footerRowCells.push(`"${footer.volume}"`);
        if (visibleCols.tariff) footerRowCells.push(`"${footer.tariff}"`);
        if (visibleCols.invoiced) footerRowCells.push(`"${footer.invoiced}"`);
        if (visibleCols.paid) footerRowCells.push(`"${footer.paid}"`);
        if (visibleCols.outstanding) footerRowCells.push(`"${footer.outstanding}"`);
        if (visibleCols.aging) footerRowCells.push(`""`);
        footerRowCells.push(`""`);

        const csvContent = [headers.join(','), ...csvRows, footerRowCells.join(',')].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute(
          'download',
          `tariff_revenue_omc_billing_report_${new Date().toISOString().slice(0, 10)}.csv`
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
    [rows, footer, visibleCols]
  );

  // Dynamic headers
  const tableHeaders = ['OMC Customer'];
  if (visibleCols.volume) tableHeaders.push('Volume (m³)');
  if (visibleCols.tariff) tableHeaders.push('Tariff ($/m³)');
  if (visibleCols.invoiced) tableHeaders.push('Invoiced (KES M)');
  if (visibleCols.paid) tableHeaders.push('Paid');
  if (visibleCols.outstanding) tableHeaders.push('Outstanding');
  if (visibleCols.aging) tableHeaders.push('Aging');
  tableHeaders.push('Status');

  const overdueCustomers = rows.filter((r) => r.aging === '90+' || r.status === 'Overdue');
  const onHoldCustomers = rows.filter((r) => r.status === 'On hold');

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
                <TableCell className='px-3 font-bold'>Total</TableCell>
                {visibleCols.volume && (
                  <TableCell className='px-3 font-mono font-bold tabular-nums'>
                    {footer.volume}
                  </TableCell>
                )}
                {visibleCols.tariff && (
                  <TableCell className='px-3 font-mono font-bold tabular-nums'>
                    {footer.tariff}
                  </TableCell>
                )}
                {visibleCols.invoiced && (
                  <TableCell className='px-3 font-mono font-bold tabular-nums'>
                    {footer.invoiced}
                  </TableCell>
                )}
                {visibleCols.paid && (
                  <TableCell className='px-3 font-mono font-bold tabular-nums'>
                    {footer.paid}
                  </TableCell>
                )}
                {visibleCols.outstanding && (
                  <TableCell
                    className={cn(
                      'px-3 font-mono font-bold tabular-nums',
                      Number(footer.outstanding) > 0 && 'text-rose-600 dark:text-rose-400'
                    )}
                  >
                    {footer.outstanding}
                  </TableCell>
                )}
                {visibleCols.aging && <TableCell colSpan={2} />}
                {!visibleCols.aging && <TableCell />}
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
                    ? 'Loading billing records from API...'
                    : 'No customer billing records found for this period.'}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.customer}>
                  <ReportTd className='font-semibold'>{r.customer}</ReportTd>
                  {visibleCols.volume && <ReportTd mono>{r.volume}</ReportTd>}
                  {visibleCols.tariff && <ReportTd mono>{r.tariff}</ReportTd>}
                  {visibleCols.invoiced && <ReportTd mono>{r.invoiced}</ReportTd>}
                  {visibleCols.paid && <ReportTd mono>{r.paid}</ReportTd>}
                  {visibleCols.outstanding && (
                    <ReportTd
                      mono
                      className={cn(
                        Number(r.outstanding) > 0
                          ? r.aging === '90+'
                            ? 'font-bold text-rose-600 dark:text-rose-400'
                            : 'text-amber-600 dark:text-amber-400'
                          : undefined
                      )}
                    >
                      {r.outstanding}
                    </ReportTd>
                  )}
                  {visibleCols.aging && <ReportTd>{r.aging}</ReportTd>}
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
              Select which commercial billing metrics to display and include in CSV exports.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3 py-2'>
            <div className='flex items-center justify-between rounded-lg border border-border/70 p-2.5 transition-colors hover:bg-muted/40'>
              <div className='space-y-0.5'>
                <p className='text-xs font-semibold text-foreground'>Throughput Volume (m³)</p>
                <p className='text-[11px] text-muted-foreground'>Billed parcel volume</p>
              </div>
              <Checkbox
                checked={visibleCols.volume}
                onCheckedChange={(c) => setVisibleCols((prev) => ({ ...prev, volume: Boolean(c) }))}
              />
            </div>

            <div className='flex items-center justify-between rounded-lg border border-border/70 p-2.5 transition-colors hover:bg-muted/40'>
              <div className='space-y-0.5'>
                <p className='text-xs font-semibold text-foreground'>Effective Tariff ($/m³)</p>
                <p className='text-[11px] text-muted-foreground'>Pumping tariff rate card</p>
              </div>
              <Checkbox
                checked={visibleCols.tariff}
                onCheckedChange={(c) => setVisibleCols((prev) => ({ ...prev, tariff: Boolean(c) }))}
              />
            </div>

            <div className='flex items-center justify-between rounded-lg border border-border/70 p-2.5 transition-colors hover:bg-muted/40'>
              <div className='space-y-0.5'>
                <p className='text-xs font-semibold text-foreground'>Invoiced Gross (KES M)</p>
                <p className='text-[11px] text-muted-foreground'>Total amount billed</p>
              </div>
              <Checkbox
                checked={visibleCols.invoiced}
                onCheckedChange={(c) =>
                  setVisibleCols((prev) => ({ ...prev, invoiced: Boolean(c) }))
                }
              />
            </div>

            <div className='flex items-center justify-between rounded-lg border border-border/70 p-2.5 transition-colors hover:bg-muted/40'>
              <div className='space-y-0.5'>
                <p className='text-xs font-semibold text-foreground'>Collected / Paid (KES M)</p>
                <p className='text-[11px] text-muted-foreground'>Settled receipts</p>
              </div>
              <Checkbox
                checked={visibleCols.paid}
                onCheckedChange={(c) => setVisibleCols((prev) => ({ ...prev, paid: Boolean(c) }))}
              />
            </div>

            <div className='flex items-center justify-between rounded-lg border border-border/70 p-2.5 transition-colors hover:bg-muted/40'>
              <div className='space-y-0.5'>
                <p className='text-xs font-semibold text-foreground'>Outstanding Receivables (KES M)</p>
                <p className='text-[11px] text-muted-foreground'>Uncollected balance</p>
              </div>
              <Checkbox
                checked={visibleCols.outstanding}
                onCheckedChange={(c) =>
                  setVisibleCols((prev) => ({ ...prev, outstanding: Boolean(c) }))
                }
              />
            </div>

            <div className='flex items-center justify-between rounded-lg border border-border/70 p-2.5 transition-colors hover:bg-muted/40'>
              <div className='space-y-0.5'>
                <p className='text-xs font-semibold text-foreground'>Aging Bracket</p>
                <p className='text-[11px] text-muted-foreground'>Days past due (31–60, 61–90, 90+)</p>
              </div>
              <Checkbox
                checked={visibleCols.aging}
                onCheckedChange={(c) => setVisibleCols((prev) => ({ ...prev, aging: Boolean(c) }))}
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
                  volume: true,
                  tariff: true,
                  invoiced: true,
                  paid: true,
                  outstanding: true,
                  aging: true,
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
              Operational Assistant · Commercial Collections Analysis
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Receivables risk assessment, OMC aging breakdown, and dispatch hold enforcement.
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

            {overdueCustomers.length > 0 && (
              <div className='rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5 dark:border-rose-500/30'>
                <div className='flex items-start gap-2.5'>
                  <AlertTriangle className='mt-0.5 size-4 text-rose-600 dark:text-rose-400 shrink-0' />
                  <div className='space-y-1.5'>
                    <p className='font-semibold text-rose-700 dark:text-rose-400'>
                      High-Risk Collections (90+ Days Past Due)
                    </p>
                    {overdueCustomers.map((cust) => (
                      <div
                        key={cust.customer}
                        className='flex items-center justify-between rounded-lg bg-background/60 px-2.5 py-1.5'
                      >
                        <span className='font-medium text-foreground'>
                          {cust.customer} ({cust.status})
                        </span>
                        <span className='font-mono font-bold text-rose-600 dark:text-rose-400'>
                          KES {cust.outstanding}M · Invoiced KES {cust.invoiced}M
                        </span>
                      </div>
                    ))}
                    <p className='text-[11px] text-muted-foreground'>
                      Credit Action: Enforce automatic dispatch suspension gate on Galana Oil and
                      issue 7-day demand notices under KPC standard transportation agreements.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className='rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 dark:border-emerald-500/30'>
              <div className='flex items-start gap-2.5'>
                <CheckCircle2 className='mt-0.5 size-4 text-emerald-600 dark:text-emerald-400 shrink-0' />
                <div className='space-y-1'>
                  <p className='font-semibold text-emerald-700 dark:text-emerald-400'>
                    Prime Accounts (100% Settlement)
                  </p>
                  <p className='text-muted-foreground'>
                    Vivo Energy, Rubis Energy, and KenolKobil are fully settled with zero
                    outstanding balances this period.
                  </p>
                </div>
              </div>
            </div>
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
