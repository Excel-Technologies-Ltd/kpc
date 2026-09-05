import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  formatUpdatedAgo,
  usePipelineFlowRefresh,
} from '../pipeline-flow-refresh';

export function FlowPageHeader() {
  const { refresh, isRefreshing, lastUpdatedAt } = usePipelineFlowRefresh();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className='flex flex-wrap items-end justify-between gap-3'>
      <div>
        <h1 className='text-foreground text-[23px] font-bold tracking-tight'>Pipeline Flow</h1>
        <p className='text-muted-foreground mt-1 text-sm'>
          Throughput, line fill and batch movement across the trunk line
        </p>
      </div>
      <div className='flex flex-wrap items-center gap-2'>
        <span className='border-border bg-card text-muted-foreground inline-flex items-center rounded-lg border px-3 py-1.5 text-[11.5px] font-medium'>
          Updated{' '}
          <b className='text-foreground ml-1'>{formatUpdatedAgo(lastUpdatedAt, now)}</b>
        </span>
        <Button
          type='button'
          variant='outline'
          size='sm'
          disabled={isRefreshing}
          onClick={() => {
            void refresh();
          }}
          className='h-8 gap-1.5 text-xs font-semibold'
        >
          <RefreshCw className={cn('size-3.5', isRefreshing && 'animate-spin')} />
          Refresh
        </Button>
      </div>
    </div>
  );
}
