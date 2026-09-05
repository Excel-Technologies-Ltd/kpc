import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { type Filter, useFrappeGetCall, useFrappeGetDocList } from 'frappe-react-sdk';
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface AIAlertDoc {
  name: string;
  journey_ref?: string;
  movement?: string;
  alert_datetime?: string;
  status?: string;
  anomaly_score?: number;
  severity?: 'Low' | 'Medium' | 'High' | 'Critical';
  parameter_breached?: string;
  description?: string;
  creation?: string;
}

interface SeverityStatRow {
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  count: number;
}

type SeverityTab = 'all' | 'Critical' | 'High' | 'Medium' | 'Low';

const ITEMS_PER_PAGE = 5;

export function LiveAlerts() {
  const [activeTab, setActiveTab] = useState<SeverityTab>('all');
  const [page, setPage] = useState(1);

  // 1. ONE single API call to get counts for ALL severity levels at once (GROUP BY severity)
  const { data: statsResponse } = useFrappeGetCall<
    { message?: SeverityStatRow[] } | SeverityStatRow[]
  >('frappe.client.get_list', {
    doctype: 'AI Alert',
    fields: ['severity', 'count(name) as count'],
    group_by: 'severity',
  });

  // Parse grouped severity counts from single response
  const counts = useMemo(() => {
    const rows: SeverityStatRow[] = Array.isArray(statsResponse)
      ? statsResponse
      : (statsResponse as any)?.message || [];

    const map: Record<string, number> = {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0,
    };

    let total = 0;
    rows.forEach((r) => {
      const sev = r.severity;
      const cnt = Number(r.count) || 0;
      if (sev && map[sev] !== undefined) {
        map[sev] = cnt;
      }
      total += cnt;
    });

    return {
      all: total,
      Critical: map.Critical,
      High: map.High,
      Medium: map.Medium,
      Low: map.Low,
    };
  }, [statsResponse]);

  // 2. Direct Server-Side API Filters based on selected tab
  const activeFilters = useMemo<Filter<AIAlertDoc>[]>(() => {
    if (activeTab === 'all') return [];
    return [['severity', '=', activeTab]];
  }, [activeTab]);

  // 3. Direct Server-Side API Pagination (Fetch ONLY 5 records for current page)
  const { data: dbAlerts, isLoading } = useFrappeGetDocList<AIAlertDoc>('AI Alert', {
    fields: [
      'name',
      'journey_ref',
      'movement',
      'alert_datetime',
      'status',
      'anomaly_score',
      'severity',
      'parameter_breached',
      'description',
      'creation',
    ],
    filters: activeFilters,
    limit: ITEMS_PER_PAGE,
    limit_start: (page - 1) * ITEMS_PER_PAGE,
    orderBy: { field: 'creation', order: 'desc' },
  });

  // Calculate total pages from current tab count
  const activeCount = counts[activeTab] || 0;
  const totalPages = Math.max(1, Math.ceil(activeCount / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);

  const handleTabChange = (tab: SeverityTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  // Helper to format relative time
  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'just now';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.max(1, Math.round(diffMs / 60000));
    if (mins < 60) return `${mins}m`;
    if (mins < 1440) return `${Math.round(mins / 60)}h`;
    return `${Math.round(mins / 1440)}d`;
  };

  return (
    <Card className='flex h-full min-h-52.5 flex-col justify-between border-[#e6edf7] bg-white shadow-sm dark:border-[#233252] dark:bg-[#0f1728]'>
      <CardHeader className='flex flex-wrap items-center justify-between gap-2 border-b border-[#e6edf7] px-4 py-2.5 shrink-0 dark:border-[#233252]'>
        <div>
          <div className='flex items-center gap-2'>
            <CardTitle className='text-base font-bold text-[#132038] dark:text-foreground'>
              Live alerts &amp; telemetry
            </CardTitle>
            <span className='relative flex size-2.5'>
              <span
                className={cn(
                  'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
                  counts.Critical > 0
                    ? 'bg-rose-400'
                    : counts.High > 0
                      ? 'bg-orange-400'
                      : counts.Medium > 0
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                )}
              />
              <span
                className={cn(
                  'relative inline-flex size-2.5 rounded-full',
                  counts.Critical > 0
                    ? 'bg-rose-500'
                    : counts.High > 0
                      ? 'bg-orange-500'
                      : counts.Medium > 0
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                )}
              />
            </span>
          </div>
          <p className='mt-0.5 text-xs text-[#5c6b85] dark:text-muted-foreground'>
            Live AI anomaly detection &amp; SCADA telemetry diagnostics
          </p>
        </div>

        {/* Severity-Wise Tabs with Grouped API Counts */}
        <div className='flex items-center gap-1 rounded-xl border border-[#e6edf7] bg-slate-50/80 p-0.5 text-[11px] font-semibold dark:border-[#233252] dark:bg-[#131d31]'>
          {/* All Tab */}
          <button
            onClick={() => handleTabChange('all')}
            className={cn(
              'rounded-lg px-2 py-0.5 transition-all cursor-pointer flex items-center gap-1',
              activeTab === 'all'
                ? 'bg-white font-bold text-[#132038] shadow-xs dark:bg-[#0f1728] dark:text-white'
                : 'text-[#5c6b85] hover:text-[#132038] dark:text-slate-400'
            )}
          >
            All <span className='opacity-80 font-mono'>({counts.all})</span>
          </button>

          {/* Critical Tab */}
          <button
            onClick={() => handleTabChange('Critical')}
            className={cn(
              'rounded-lg px-2 py-0.5 transition-all cursor-pointer flex items-center gap-1',
              activeTab === 'Critical'
                ? 'bg-rose-600 font-bold text-white shadow-xs'
                : 'text-[#5c6b85] hover:text-rose-600 dark:text-slate-400'
            )}
          >
            Critical <span className='font-mono'>({counts.Critical})</span>
          </button>

          {/* High Tab */}
          <button
            onClick={() => handleTabChange('High')}
            className={cn(
              'rounded-lg px-2 py-0.5 transition-all cursor-pointer flex items-center gap-1',
              activeTab === 'High'
                ? 'bg-orange-500 font-bold text-white shadow-xs'
                : 'text-[#5c6b85] hover:text-orange-600 dark:text-slate-400'
            )}
          >
            High <span className='font-mono'>({counts.High})</span>
          </button>

          {/* Medium Tab */}
          <button
            onClick={() => handleTabChange('Medium')}
            className={cn(
              'rounded-lg px-2 py-0.5 transition-all cursor-pointer flex items-center gap-1',
              activeTab === 'Medium'
                ? 'bg-amber-500 font-bold text-white shadow-xs'
                : 'text-[#5c6b85] hover:text-amber-600 dark:text-slate-400'
            )}
          >
            Medium <span className='font-mono'>({counts.Medium})</span>
          </button>

          {/* Low Tab */}
          <button
            onClick={() => handleTabChange('Low')}
            className={cn(
              'rounded-lg px-2 py-0.5 transition-all cursor-pointer flex items-center gap-1',
              activeTab === 'Low'
                ? 'bg-emerald-600 font-bold text-white shadow-xs'
                : 'text-[#5c6b85] hover:text-emerald-600 dark:text-slate-400'
            )}
          >
            Low <span className='font-mono'>({counts.Low})</span>
          </button>
        </div>
      </CardHeader>

      <CardContent className='flex-1 space-y-px p-2.5 flex flex-col justify-start'>
        {isLoading ? (
          <div className='space-y-px py-0.5'>
            {[1, 2, 3, 4, 5].map((n) => (
              <Skeleton key={n} className='h-12 w-full rounded-lg' />
            ))}
          </div>
        ) : !dbAlerts || dbAlerts.length === 0 ? (
          <div className='flex h-full flex-col items-center justify-center py-6 text-center'>
            <div className='mb-3 flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-xs dark:bg-emerald-950/40 dark:text-emerald-400'>
              <ShieldCheck className='size-6' />
            </div>
            <h4 className='text-sm font-bold text-[#132038] dark:text-white'>
              {activeTab === 'all'
                ? 'All Pipeline Operations Nominal'
                : `No active ${activeTab} severity alerts`}
            </h4>
            <p className='mt-1 max-w-xs text-xs text-[#5c6b85] dark:text-slate-400'>
              {activeTab === 'all'
                ? 'Pressure, vibration, and flow rate sensors across Line 1, 4 & 5 are operating within certified limits.'
                : `There are currently 0 alerts categorized as ${activeTab}.`}
            </p>
          </div>
        ) : (
          dbAlerts.map((alert) => {
            const isCritical = alert.severity === 'Critical';
            const isHigh = alert.severity === 'High';
            const isMedium = alert.severity === 'Medium';
            const title = alert.parameter_breached
              ? `${alert.parameter_breached} Telemetry Anomaly`
              : `Pipeline Anomaly (Score: ${alert.anomaly_score || 0})`;

            const desc =
              alert.description ||
              (alert.movement
                ? `Telemetry excursion detected on Movement ${alert.movement} (${alert.status || 'Active'})`
                : `Anomaly severity: ${alert.severity || 'Medium'}`);

            return (
              <div
                key={alert.name}
                className={cn(
                  'group relative flex items-center justify-between gap-2 rounded-lg border p-1.5 pl-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs cursor-pointer',
                  isCritical &&
                    'border-rose-200/90 bg-linear-to-r from-[#fef2f2] to-[#fff1f2] hover:border-rose-300 dark:border-rose-900/50 dark:from-rose-950/30 dark:to-rose-950/15',
                  isHigh &&
                    'border-orange-200/90 bg-linear-to-r from-[#fff7ed] to-[#ffedd5] hover:border-orange-300 dark:border-orange-900/50 dark:from-orange-950/30 dark:to-orange-950/15',
                  isMedium &&
                    'border-amber-200/90 bg-linear-to-r from-[#fffbeb] to-[#fefce8] hover:border-amber-300 dark:border-amber-900/50 dark:from-amber-950/30 dark:to-amber-950/15',
                  !isCritical &&
                    !isHigh &&
                    !isMedium &&
                    'border-emerald-200/90 bg-linear-to-r from-[#f0fdf4] to-[#f0fdfa] hover:border-emerald-300 dark:border-emerald-900/50 dark:from-emerald-950/30 dark:to-emerald-950/15'
                )}
              >
                {/* Colored left curved border ribbon accent */}
                <div
                  className={cn(
                    'absolute left-0 top-1 bottom-1 w-1 rounded-r-full shadow-xs',
                    isCritical && 'bg-[#f43f5e]',
                    isHigh && 'bg-[#f97316]',
                    isMedium && 'bg-[#f59e0b]',
                    !isCritical && !isHigh && !isMedium && 'bg-[#10b981]'
                  )}
                />

                <div className='flex items-center gap-2 pr-1 min-w-0 flex-1'>
                  {/* Status Icon Badge */}
                  <div
                    className={cn(
                      'flex size-5 shrink-0 items-center justify-center rounded-md shadow-2xs',
                      isCritical &&
                        'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-300',
                      isHigh &&
                        'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-300',
                      isMedium &&
                        'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-300',
                      !isCritical &&
                        !isHigh &&
                        !isMedium &&
                        'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300'
                    )}
                  >
                    {isCritical && <AlertCircle className='size-3' />}
                    {isHigh && <ShieldAlert className='size-3' />}
                    {isMedium && <AlertTriangle className='size-3' />}
                    {!isCritical && !isHigh && !isMedium && <CheckCircle2 className='size-3' />}
                  </div>

                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center gap-1.5 flex-wrap'>
                      <h5 className='text-xs font-bold text-[#132038] dark:text-foreground truncate'>
                        {title}
                      </h5>
                      <span
                        className={cn(
                          'rounded px-1.5 py-0.2 text-[9px] font-semibold tracking-tight shrink-0',
                          isCritical &&
                            'bg-rose-200/70 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
                          isHigh &&
                            'bg-orange-200/70 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
                          isMedium &&
                            'bg-amber-200/70 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
                          !isCritical &&
                            !isHigh &&
                            !isMedium &&
                            'bg-emerald-200/70 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                        )}
                      >
                        {alert.movement ? `SCADA · ${alert.movement}` : 'AI Alert'}
                      </span>
                      {alert.anomaly_score !== undefined && alert.anomaly_score > 0 && (
                        <span className='font-mono text-[9px] font-bold text-slate-500 dark:text-slate-400'>
                          Score: {alert.anomaly_score}
                        </span>
                      )}
                    </div>
                    <p className='text-[10.5px] font-normal leading-tight text-[#5c6b85] dark:text-slate-300 truncate'>
                      {desc}
                    </p>
                  </div>
                </div>

                {/* Right time & hover inspect pill */}
                <div className='flex shrink-0 flex-col items-end justify-center gap-0.5 pl-1.5'>
                  <span className='flex items-center gap-1 text-[10px] font-semibold text-[#93a2bd] dark:text-slate-400'>
                    <Clock className='size-2.5 text-[#93a2bd]' />
                    {formatTimeAgo(alert.alert_datetime || alert.creation)}
                  </span>
                  <span className='hidden rounded bg-white px-1.5 py-0.2 text-[9px] font-bold text-[#4361ee] opacity-0 shadow-xs transition-all group-hover:opacity-100 sm:inline-flex items-center gap-0.5 dark:bg-[#131d31] dark:text-blue-300'>
                    Inspect <ArrowUpRight className='size-2.5' />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </CardContent>

      {/* Pagination Footer (Slim & Direct Server API Driven) */}
      {activeCount > 0 && (
        <CardFooter className='flex items-center justify-between px-3.5 pt-1! pb-1 text-xs shrink-0 dark:border-[#233252]'>
          <span className='text-[11px] font-medium text-[#5c6b85] dark:text-slate-400'>
            Showing{' '}
            <b className='text-[#132038] dark:text-white'>
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}
            </b>
            –
            <b className='text-[#132038] dark:text-white'>
              {Math.min(currentPage * ITEMS_PER_PAGE, activeCount)}
            </b>{' '}
            of <b className='text-[#132038] dark:text-white'>{activeCount}</b> alerts
          </span>

          <div className='flex items-center gap-1'>
            <Button
              variant='outline'
              size='sm'
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className='h-6.5 w-6.5 p-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed'
            >
              <ChevronLeft className='size-3.5' />
            </Button>

            <span className='px-1.5 text-[11px] font-bold text-[#132038] dark:text-slate-300'>
              {currentPage} / {totalPages}
            </span>

            <Button
              variant='outline'
              size='sm'
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className='h-6.5 w-6.5 p-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed'
            >
              <ChevronRight className='size-3.5' />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
