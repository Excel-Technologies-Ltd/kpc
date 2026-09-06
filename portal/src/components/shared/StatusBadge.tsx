import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type StatusTone = 'good' | 'warn' | 'alarm' | 'info' | 'neutral';

const TONE_CLASS: Record<StatusTone, string> = {
  good: 'border-emerald-200/80 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/20',
  warn: 'border-amber-200/80 bg-amber-50 text-amber-700 ring-1 ring-amber-100 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/20',
  alarm:
    'border-rose-200/80 bg-rose-50 text-rose-700 ring-1 ring-rose-100 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/20',
  info: 'border-sky-200/80 bg-sky-50 text-sky-700 ring-1 ring-sky-100 dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-500/20',
  neutral: 'border-border/80 bg-muted/50 text-muted-foreground ring-1 ring-border/40',
};

export function StatusBadge({
  label,
  tone = 'neutral',
  className,
}: {
  label: string;
  tone?: StatusTone;
  className?: string;
}) {
  return (
    <Badge
      variant='outline'
      className={cn('text-[10px] font-semibold', TONE_CLASS[tone], className)}
    >
      {label}
    </Badge>
  );
}
