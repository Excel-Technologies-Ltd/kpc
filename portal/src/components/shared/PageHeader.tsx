import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';

function formatUpdatedAgo(lastUpdatedAt: number, now = Date.now()): string {
  const seconds = Math.max(0, Math.floor((now - lastUpdatedAt) / 1000));
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export type PageHeaderChip = {
  label: string;
  value: string;
};

export type PageHeaderProps = {
  title: string;
  subtitle: string;
  chips?: PageHeaderChip[];
  /** Extra actions to the left of Updated/Refresh */
  actions?: ReactNode;
};

/** Lightweight header with local Updated/Refresh (dummy-data pages). */
export function PageHeader({ title, subtitle, chips, actions }: PageHeaderProps) {
  const [lastUpdatedAt, setLastUpdatedAt] = useState(() => Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const refresh = () => {
    setIsRefreshing(true);
    window.setTimeout(() => {
      setLastUpdatedAt(Date.now());
      setIsRefreshing(false);
    }, 400);
  };

  return (
    <div className='flex flex-wrap items-end justify-between gap-3'>
      <div>
        <h1 className='text-foreground text-[23px] font-bold tracking-tight'>{title}</h1>
        <p className='text-muted-foreground mt-1 text-sm'>{subtitle}</p>
        {chips && chips.length > 0 ? (
          <div className='mt-2.5 flex flex-wrap gap-2'>
            {chips.map((chip) => (
              <span
                key={`${chip.label}-${chip.value}`}
                className='border-border bg-card text-muted-foreground inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium'
              >
                {chip.label} <b className='text-foreground'>{chip.value}</b>
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className='flex flex-wrap items-center gap-2'>
        {actions}
        <span className='border-border bg-card text-muted-foreground inline-flex items-center rounded-lg border px-3 py-1.5 text-[11.5px] font-medium'>
          Updated <b className='text-foreground ml-1'>{formatUpdatedAgo(lastUpdatedAt, now)}</b>
        </span>
        <Button
          type='button'
          variant='outline'
          size='sm'
          disabled={isRefreshing}
          onClick={refresh}
          className='h-8 gap-1.5 text-xs font-semibold'
        >
          <RefreshCw className={cn('size-3.5', isRefreshing && 'animate-spin')} />
          Refresh
        </Button>
      </div>
    </div>
  );
}
