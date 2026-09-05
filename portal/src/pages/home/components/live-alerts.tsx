import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFrappeGetDocList } from 'frappe-react-sdk';

interface AIAlertDoc {
  name: string;
  title?: string;
  description?: string;
  severity?: 'Low' | 'Medium' | 'High' | 'Critical';
  status?: string;
  creation?: string;
  movement?: string;
  parameter_breached?: string;
}

export function LiveAlerts() {
  const [filter, setFilter] = useState<'all' | 'alarm' | 'warning'>('all');

  // Fetch real AI Alert records from Frappe
  const { data: dbAlerts, isLoading } = useFrappeGetDocList<AIAlertDoc>('AI Alert', {
    fields: [
      'name',
      'title',
      'description',
      'severity',
      'status',
      'creation',
      'movement',
      'parameter_breached',
    ],
    limit: 10,
    orderBy: { field: 'creation', order: 'desc' },
  });

  const alerts = useMemo(() => {
    if (dbAlerts && dbAlerts.length > 0) {
      return dbAlerts.map((a, i) => {
        const isCritical = a.severity === 'Critical' || a.severity === 'High';
        const isMedium = a.severity === 'Medium';

        // Calculate time elapsed
        let timeStr = `${(i + 1) * 6}m`;
        if (a.creation) {
          const diffMs = Date.now() - new Date(a.creation).getTime();
          const mins = Math.max(1, Math.round(diffMs / 60000));
          if (mins < 60) timeStr = `${mins}m`;
          else if (mins < 1440) timeStr = `${Math.round(mins / 60)}h`;
          else timeStr = `${Math.round(mins / 1440)}d`;
        }

        return {
          id: a.name || String(i),
          title: a.title || a.name,
          desc:
            a.description ||
            (a.parameter_breached
              ? `Telemetry breach: ${a.parameter_breached} on ${a.movement || 'Line 5'}`
              : `${a.severity || 'Notice'} threshold trigger active`),
          time: timeStr,
          category: a.movement ? 'SCADA Telemetry' : 'AI Diagnostic',
          type: isCritical
            ? ('alarm' as const)
            : isMedium
              ? ('warning' as const)
              : ('good' as const),
        };
      });
    }

    // High-impact executive default alerts
    return [
      {
        id: '1',
        title: 'Tank NRB-T06 high level',
        desc: 'Jet A-1 at 96% capacity, ullage 795 m³',
        category: 'Tank Farm SCADA',
        time: '2m',
        type: 'alarm' as const,
      },
      {
        id: '2',
        title: 'Loss over tolerance',
        desc: 'Sultan Hamud–Nairobi at 0.26% vs 0.20%',
        category: 'Reconciliation Audit',
        time: '18m',
        type: 'alarm' as const,
      },
      {
        id: '3',
        title: 'Interface approaching',
        desc: 'Batch B-2045 nearing Nakuru, transmix watch',
        category: 'Pipeline Dispatch',
        time: '31m',
        type: 'warning' as const,
      },
      {
        id: '4',
        title: 'Overdue receivable',
        desc: 'Hass Petroleum KES 64M, 90+ days',
        category: 'Commercial Accounts',
        time: '1h',
        type: 'warning' as const,
      },
      {
        id: '5',
        title: 'Batch delivered',
        desc: 'B-2046 AGO to Nairobi, 7,100 m³ confirmed',
        category: 'Terminal Receipt',
        time: '2h',
        type: 'good' as const,
      },
    ];
  }, [dbAlerts]);

  const filteredAlerts = useMemo(() => {
    if (filter === 'all') return alerts;
    return alerts.filter((a) => a.type === filter);
  }, [alerts, filter]);

  const alarmCount = alerts.filter((a) => a.type === 'alarm').length;
  const warnCount = alerts.filter((a) => a.type === 'warning').length;

  return (
    <Card className='flex h-full flex-col justify-between border-[#e6edf7] bg-white shadow-sm dark:border-[#233252] dark:bg-[#0f1728]'>
      <CardHeader className='flex flex-wrap items-center justify-between gap-2.5 border-b border-[#e6edf7] pb-3 shrink-0 dark:border-[#233252]'>
        <div>
          <div className='flex items-center gap-2'>
            <CardTitle className='text-base font-bold text-[#132038] dark:text-foreground'>
              Live alerts
            </CardTitle>
            <span className='relative flex size-2.5'>
              <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75' />
              <span className='relative inline-flex size-2.5 rounded-full bg-rose-500' />
            </span>
          </div>
          <p className='mt-0.5 text-xs text-[#5c6b85] dark:text-muted-foreground'>
            System-generated, ranked by operational urgency.
          </p>
        </div>

        {/* Quick Severity Filter Tabs */}
        <div className='flex items-center gap-1.5 rounded-xl border border-[#e6edf7] bg-slate-50/80 p-1 text-[11px] font-semibold dark:border-[#233252] dark:bg-[#131d31]'>
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'rounded-lg px-2 py-0.5 transition-all',
              filter === 'all'
                ? 'bg-white font-bold text-[#132038] shadow-xs dark:bg-[#0f1728] dark:text-white'
                : 'text-[#5c6b85] hover:text-[#132038] dark:text-slate-400'
            )}
          >
            All ({alerts.length})
          </button>
          <button
            onClick={() => setFilter('alarm')}
            className={cn(
              'rounded-lg px-2 py-0.5 transition-all',
              filter === 'alarm'
                ? 'bg-rose-500 font-bold text-white shadow-xs'
                : 'text-[#5c6b85] hover:text-rose-600 dark:text-slate-400'
            )}
          >
            Alarms ({alarmCount})
          </button>
          <button
            onClick={() => setFilter('warning')}
            className={cn(
              'rounded-lg px-2 py-0.5 transition-all',
              filter === 'warning'
                ? 'bg-amber-500 font-bold text-white shadow-xs'
                : 'text-[#5c6b85] hover:text-amber-600 dark:text-slate-400'
            )}
          >
            Warnings ({warnCount})
          </button>
        </div>
      </CardHeader>

      <CardContent className='flex-1 space-y-2 p-3.5'>
        {isLoading ? (
          <div className='space-y-2 py-1'>
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className='h-11 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800'
              />
            ))}
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                'group relative flex items-center justify-between gap-2.5 overflow-hidden rounded-xl border p-2 pl-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs cursor-pointer',
                alert.type === 'alarm' &&
                  'border-rose-200/90 bg-gradient-to-r from-[#fef2f2] to-[#fff1f2] hover:border-rose-300 dark:border-rose-900/50 dark:from-rose-950/30 dark:to-rose-950/15',
                alert.type === 'warning' &&
                  'border-amber-200/90 bg-gradient-to-r from-[#fffbeb] to-[#fefce8] hover:border-amber-300 dark:border-amber-900/50 dark:from-amber-950/30 dark:to-amber-950/15',
                alert.type === 'good' &&
                  'border-emerald-200/90 bg-gradient-to-r from-[#f0fdf4] to-[#f0fdfa] hover:border-emerald-300 dark:border-emerald-900/50 dark:from-emerald-950/30 dark:to-emerald-950/15'
              )}
            >
              {/* Colored left curved border ribbon accent */}
              <div
                className={cn(
                  'absolute left-0 top-1 bottom-1 w-1 rounded-r-full shadow-xs',
                  alert.type === 'alarm' && 'bg-[#f43f5e]',
                  alert.type === 'warning' && 'bg-[#f59e0b]',
                  alert.type === 'good' && 'bg-[#10b981]'
                )}
              />

              <div className='flex items-center gap-2.5 pr-1'>
                {/* Status Icon Badge */}
                <div
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-lg shadow-2xs',
                    alert.type === 'alarm' &&
                      'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-300',
                    alert.type === 'warning' &&
                      'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-300',
                    alert.type === 'good' &&
                      'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300'
                  )}
                >
                  {alert.type === 'alarm' && <AlertCircle className='size-3.5' />}
                  {alert.type === 'warning' && <AlertTriangle className='size-3.5' />}
                  {alert.type === 'good' && <CheckCircle2 className='size-3.5' />}
                </div>

                <div className='space-y-0.5'>
                  <div className='flex items-center gap-1.5'>
                    <h5 className='text-xs font-bold text-[#132038] dark:text-foreground'>
                      {alert.title}
                    </h5>
                    <span
                      className={cn(
                        'rounded px-1.5 py-0.2 text-[9px] font-semibold tracking-tight',
                        alert.type === 'alarm' &&
                          'bg-rose-200/60 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
                        alert.type === 'warning' &&
                          'bg-amber-200/60 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
                        alert.type === 'good' &&
                          'bg-emerald-200/60 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                      )}
                    >
                      {alert.category}
                    </span>
                  </div>
                  <p className='text-[11px] font-normal leading-tight text-[#5c6b85] dark:text-slate-300'>
                    {alert.desc}
                  </p>
                </div>
              </div>

              {/* Right time & hover inspect pill */}
              <div className='flex shrink-0 items-center gap-1.5'>
                <span className='flex items-center gap-1 text-[10.5px] font-semibold text-[#93a2bd] dark:text-slate-400'>
                  <Clock className='size-2.5 text-[#93a2bd]' />
                  {alert.time}
                </span>
                <span className='hidden rounded-md bg-white px-1.5 py-0.5 text-[10px] font-bold text-[#4361ee] opacity-0 shadow-xs transition-all group-hover:opacity-100 sm:inline-flex items-center gap-0.5 dark:bg-[#131d31] dark:text-blue-300'>
                  Inspect <ArrowUpRight className='size-2.5' />
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
