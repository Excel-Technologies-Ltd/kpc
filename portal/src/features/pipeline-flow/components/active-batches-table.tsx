import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';
import { ACTIVE_BATCHES, PRODUCT_COLORS, type BatchStatus } from '../data/dummy';
import { AnimatedSection } from './animated-section';
import { FlowInfoButton } from './flow-info-button';

const PAGE_SIZE = 5;

function statusBadgeClass(status: BatchStatus) {
  switch (status) {
    case 'Delivered':
      return 'border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-300';
    case 'Pumping':
      return 'border-transparent bg-sky-500/15 text-sky-700 dark:text-sky-300';
    case 'Interface':
      return 'border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-300';
    default:
      return 'border-transparent bg-muted text-muted-foreground';
  }
}

export function ActiveBatchesTable() {
  const [page, setPage] = useState(0);
  const total = ACTIVE_BATCHES.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const pageRows = useMemo(() => {
    const start = page * PAGE_SIZE;
    return ACTIVE_BATCHES.slice(start, start + PAGE_SIZE);
  }, [page]);

  const from = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const to = Math.min((page + 1) * PAGE_SIZE, total);

  return (
    <AnimatedSection delay={0.3}>
      <Card className='transition-shadow hover:shadow-md'>
        <CardHeader className='pb-2'>
          <div className='flex items-center gap-2'>
            <CardTitle className='text-[14.5px]'>Active batches</CardTitle>
            <FlowInfoButton guideKey='flow-batch' />
          </div>
        </CardHeader>
        <CardContent className='space-y-3 overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>Injected</TableHead>
                <TableHead>Line position</TableHead>
                <TableHead>ETA</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((batch, i) => (
                <TableRow
                  key={batch.id}
                  className='animate-in fade-in slide-in-from-bottom-1 fill-mode-both'
                  style={{ animationDelay: `${80 + i * 40}ms` }}
                >
                  <TableCell className='font-mono tabular-nums'>{batch.id}</TableCell>
                  <TableCell>
                    <span className='inline-flex items-center gap-1.5'>
                      <span
                        className='inline-block size-2.5 rounded-sm'
                        style={{ background: PRODUCT_COLORS[batch.productKey] }}
                      />
                      {batch.product}
                    </span>
                  </TableCell>
                  <TableCell>{batch.route}</TableCell>
                  <TableCell className='font-mono tabular-nums'>{batch.volume}</TableCell>
                  <TableCell className='font-mono tabular-nums'>{batch.injected}</TableCell>
                  <TableCell>{batch.linePosition}</TableCell>
                  <TableCell className='font-mono tabular-nums'>{batch.eta}</TableCell>
                  <TableCell>
                    <Badge className={cn(statusBadgeClass(batch.status))}>{batch.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <p className='text-muted-foreground text-xs'>
              Showing {from}–{to} of {total}
            </p>
            <Pagination className='mx-0 w-auto justify-end'>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href='#'
                    aria-disabled={page === 0}
                    className={cn(page === 0 && 'pointer-events-none opacity-50')}
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.max(0, p - 1));
                    }}
                  />
                </PaginationItem>
                {Array.from({ length: pageCount }, (_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href='#'
                      isActive={i === page}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(i);
                      }}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href='#'
                    aria-disabled={page >= pageCount - 1}
                    className={cn(page >= pageCount - 1 && 'pointer-events-none opacity-50')}
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.min(pageCount - 1, p + 1));
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </AnimatedSection>
  );
}
