import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import React from 'react';

interface ReusablePaginationProps {
  total: number;
  pageIndex: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

const ReusablePagination: React.FC<ReusablePaginationProps> = ({
  total,
  pageIndex,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions,
}) => {
  const totalPages = Math.ceil(total / pageSize);

  const renderPageLinks = () => {
    const links = [];
    const maxVisiblePages = window.innerWidth < 640 ? 3 : 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 0; i < totalPages; i++) {
        links.push(renderPageLink(i));
      }
    } else {
      links.push(renderPageLink(0));

      if (pageIndex > (maxVisiblePages === 3 ? 1 : 2)) {
        links.push(<PaginationEllipsis key='ellipsis-start' />);
      }

      const start = Math.max(1, pageIndex - (maxVisiblePages === 3 ? 0 : 1));
      const end = Math.min(totalPages - 2, pageIndex + (maxVisiblePages === 3 ? 0 : 1));

      for (let i = start; i <= end; i++) {
        if (i > 0 && i < totalPages - 1) {
          links.push(renderPageLink(i));
        }
      }

      if (pageIndex < totalPages - (maxVisiblePages === 3 ? 2 : 3)) {
        links.push(<PaginationEllipsis key='ellipsis-end' />);
      }

      links.push(renderPageLink(totalPages - 1));
    }

    return links;
  };

  const renderPageLink = (index: number) => (
    <PaginationItem key={index}>
      <PaginationLink
        isActive={index === pageIndex}
        onClick={() => onPageChange(index)}
        className={cn(
          'w-6 h-6 md:w-8 md:h-8 rounded-md md:rounded-lg border-none transition-colors cursor-pointer text-xs md:text-sm',
          index === pageIndex
            ? 'bg-primary text-primary-foreground hover:text-white hover:bg-primary/90 dark:text-white'
            : 'bg-muted text-muted-foreground hover:bg-muted/80'
        )}
      >
        {index + 1}
      </PaginationLink>
    </PaginationItem>
  );

  return (
    <div className='flex flex-col items-end gap-4 md:flex-row md:items-center md:justify-between px-1 py-2'>
      <div className='text-xs md:text-sm text-foreground text-right md:text-left'>
        Showing <span className='font-medium'>{Math.min(pageIndex * pageSize + 1, total)}</span> to{' '}
        <span className='font-medium'>{Math.min((pageIndex + 1) * pageSize, total)}</span> of{' '}
        <span className='font-medium'>{total}</span> entries
      </div>

      <div className='flex flex-col items-end gap-2 md:flex-row md:items-center md:gap-6'>
        <Pagination className='w-auto mx-0'>
          <PaginationContent className='gap-1'>
            <PaginationItem>
              <PaginationPrevious
                isActive={pageIndex === 0}
                onClick={() => onPageChange(pageIndex - 1)}
                className='w-6 h-6 md:w-8 md:h-8 rounded-md md:rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
              />
            </PaginationItem>

            {renderPageLinks()}

            <PaginationItem>
              <PaginationNext
                isActive={pageIndex >= totalPages - 1}
                onClick={() => onPageChange(pageIndex + 1)}
                className='w-6 h-6 md:w-8 md:h-8 rounded-md md:rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        {pageSizeOptions && (
          <div className='flex items-center gap-2'>
            <span className='text-xs md:text-sm text-foreground'>Show</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger
                size='sm'
                className='w-14 h-7 md:w-18 md:h-8 bg-background border-border text-xs md:text-sm'
              >
                <SelectValue placeholder={pageSize.toString()} />
              </SelectTrigger>
              <SelectContent align='end'>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()} className='text-xs md:text-sm'>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className='text-xs md:text-sm text-foreground'>entries</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReusablePagination;
