import { cn } from '@/lib/utils';
import type { ReportSummary } from '../data/dummy';

const TONE: Record<ReportSummary['tone'], string> = {
  blue: 'border-sky-200/70 from-sky-50/80 to-card dark:border-sky-500/25 dark:from-sky-950/40',
  green:
    'border-emerald-200/70 from-emerald-50/80 to-card dark:border-emerald-500/25 dark:from-emerald-950/40',
  amber:
    'border-amber-200/70 from-amber-50/80 to-card dark:border-amber-500/25 dark:from-amber-950/40',
  rose: 'border-rose-200/70 from-rose-50/80 to-card dark:border-rose-500/25 dark:from-rose-950/40',
};

export function ReportSummaryRow({ items }: { items: ReportSummary[] }) {
  return (
    <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
      {items.map((s) => (
        <div
          key={s.label}
          className={cn('rounded-xl border bg-linear-to-br p-3.5 shadow-sm', TONE[s.tone])}
        >
          <div className='text-muted-foreground text-[11px] font-medium'>{s.label}</div>
          <div className='text-foreground mt-1 font-mono text-xl font-bold tracking-tight tabular-nums'>
            {s.value}
          </div>
          <div className='text-muted-foreground mt-1 text-[11px]'>{s.delta}</div>
        </div>
      ))}
    </div>
  );
}
