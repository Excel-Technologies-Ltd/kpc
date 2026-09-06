// Reusable DataTable with pagination, sorting and filter support
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';
import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Empty from './empty';
import ReusablePagination from './reusable-pagination';

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  total: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onRowClick?: (row: TData) => void;
  getRowLink?: (row: TData) => string | undefined;
  tableHeader?: React.ReactNode;
  tableFooter?: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  showpagination?: boolean;
  /** Soft light chrome for refined list surfaces */
  variant?: 'default' | 'soft';
}

function DataTable<TData>({
  columns,
  data,
  total,
  currentPage = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  onRowClick,
  getRowLink,
  tableHeader,
  tableFooter,
  className = '',
  isLoading = false,
  loadingMessage = 'Loading...',
  emptyMessage = 'No data found',
  showpagination = true,
  variant = 'default',
}: DataTableProps<TData>) {
  const soft = variant === 'soft';
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: currentPage,
    pageSize: pageSize,
  });

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: currentPage,
      pageSize: pageSize,
    }));
  }, [currentPage, pageSize]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(total / pagination.pageSize),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
  });

  useEffect(() => {
    onPageChange?.(pagination.pageIndex);
  }, [pagination.pageIndex, onPageChange]);

  useEffect(() => {
    onPageSizeChange?.(pagination.pageSize);
  }, [pagination.pageSize, onPageSizeChange]);

  return (
    <Card
      className={cn(
        'transition-shadow hover:shadow-md',
        soft && 'border-border/80 shadow-sm',
        className
      )}
    >
      {tableHeader ? (
        <CardHeader className={cn('pb-2', soft && 'border-border/60 bg-card/50 border-b')}>
          {tableHeader}
        </CardHeader>
      ) : null}

      <CardContent className={cn('space-y-3 overflow-x-auto', soft && 'pt-4')}>
        <div
          className={cn(
            'relative',
            soft && 'border-border/70 bg-card/70 overflow-hidden rounded-xl border shadow-inner'
          )}
        >
          {isLoading && (
            <div className='bg-background/60 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[2px]'>
              <div className='bg-card flex flex-col items-center gap-3 rounded-lg border p-4'>
                <Loader2 className='text-primary h-8 w-8 animate-spin' />
                <span className='text-muted-foreground text-sm font-medium'>{loadingMessage}</span>
              </div>
            </div>
          )}

          <Table>
            <TableHeader
              className={cn(
                soft &&
                  '[&_tr]:border-border/60 [&_tr]:bg-linear-to-r [&_tr]:from-muted/80 [&_tr]:via-sky-50/60 [&_tr]:to-indigo-50/40 dark:[&_tr]:via-sky-950/40 dark:[&_tr]:to-indigo-950/30'
              )}
            >
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className={cn(soft && 'hover:bg-transparent')}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        soft &&
                          'text-muted-foreground h-11 px-3 text-[11px] font-semibold tracking-wide uppercase'
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, i) => {
                  const rowData = row.original;
                  const rowLink = getRowLink?.(rowData);

                  return (
                    <TableRow
                      key={row.id}
                      onClick={() => onRowClick?.(rowData)}
                      className={cn(
                        'animate-in fade-in slide-in-from-bottom-1 fill-mode-both',
                        (onRowClick || rowLink) && 'hover:cursor-pointer',
                        soft &&
                          'border-border/50 odd:bg-card even:bg-muted/30 hover:bg-sky-50/50 transition-colors dark:hover:bg-sky-950/30'
                      )}
                      style={{ animationDelay: `${80 + i * 40}ms` }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className={cn(soft && 'px-3 py-3')}>
                          {rowLink ? (
                            <Link to={rowLink} className='block h-full w-full'>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </Link>
                          ) : (
                            flexRender(cell.column.columnDef.cell, cell.getContext())
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className='text-center'>
                    {!isLoading ? <Empty description={emptyMessage} /> : null}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            {tableFooter}
          </Table>
        </div>

        {showpagination && total > 0 ? (
          <ReusablePagination
            total={total}
            pageIndex={pagination.pageIndex}
            pageSize={pagination.pageSize}
            onPageChange={(page) => table.setPageIndex(page)}
            onPageSizeChange={(size) => table.setPageSize(size)}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}

export default DataTable;
