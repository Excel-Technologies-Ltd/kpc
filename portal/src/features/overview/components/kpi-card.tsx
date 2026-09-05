import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export type KpiCardProps = {
  label: string;
  value: string | number;
  unit?: string;
  delta: string;
  deltaType?: 'up' | 'down' | 'flat' | 'warn';
  icon?: ReactNode;
  className?: string;
};

export function KpiCard({
  label,
  value,
  unit,
  delta,
  deltaType = 'up',
  icon,
  className,
}: KpiCardProps) {
  return (
    <Card className={cn('relative overflow-hidden', className)} size='sm'>
      <CardContent className='relative pt-2'>
        {icon ? (
          <div className='text-muted-foreground absolute top-3 right-3 opacity-70'>{icon}</div>
        ) : null}
        <div className='pr-10'>
          <p className='text-2xl font-semibold tracking-tight text-foreground'>
            {value}
            {unit ? (
              <span className='text-muted-foreground ml-1 text-sm font-medium'>{unit}</span>
            ) : null}
          </p>
          <p className='text-muted-foreground mt-1 text-xs font-medium'>{label}</p>
          <p
            className={cn(
              'mt-1 font-mono text-[11px] font-semibold',
              deltaType === 'up' && 'text-foreground',
              deltaType === 'down' && 'text-destructive',
              deltaType === 'warn' && 'text-muted-foreground',
              deltaType === 'flat' && 'text-muted-foreground'
            )}
          >
            {delta}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
