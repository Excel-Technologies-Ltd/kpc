import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export function ReportTable({
  headers,
  children,
  footer,
}: {
  headers: string[];
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className='border-border/70 bg-card/70 overflow-hidden rounded-xl border shadow-inner'>
      <Table>
        <TableHeader className='[&_tr]:border-border/60 [&_tr]:bg-linear-to-r [&_tr]:from-muted/80 [&_tr]:via-sky-50/50 [&_tr]:to-teal-50/30 dark:[&_tr]:via-sky-950/30 dark:[&_tr]:to-teal-950/20'>
          <TableRow className='hover:bg-transparent'>
            {headers.map((h) => (
              <TableHead
                key={h}
                className='text-muted-foreground h-10 px-3 text-[11px] font-semibold tracking-wide uppercase'
              >
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>{children}</TableBody>
        {footer ? (
          <TableFooter className='bg-muted/40 font-semibold'>{footer}</TableFooter>
        ) : null}
      </Table>
    </div>
  );
}

export function ReportTd({
  children,
  mono,
  className,
}: {
  children: ReactNode;
  mono?: boolean;
  className?: string;
}) {
  return (
    <TableCell
      className={cn('px-3 py-2.5 text-[12px]', mono && 'font-mono tabular-nums', className)}
    >
      {children}
    </TableCell>
  );
}
