import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export type SectionCardProps = {
  title: string;
  tag?: string;
  caption?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function SectionCard({
  title,
  tag,
  caption,
  children,
  className,
  contentClassName,
}: SectionCardProps) {
  return (
    <Card
      className={cn(
        'border-border/80 from-card via-sky-50/25 to-teal-50/15 bg-linear-to-br dark:via-sky-950/20 dark:to-teal-950/10',
        className
      )}
    >
      <CardHeader className='pb-2'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <CardTitle className='text-[15px] font-semibold tracking-tight'>{title}</CardTitle>
          {tag ? (
            <span className='text-muted-foreground rounded-full border px-2.5 py-0.5 text-[11px] font-medium'>
              {tag}
            </span>
          ) : null}
        </div>
        {caption ? <p className='text-muted-foreground text-[11px]'>{caption}</p> : null}
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  );
}
