import { useCallback, useState } from 'react';

export const usePagination = (initialPageSize = 10) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const offset = currentPage * pageSize;

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(0);
  }, []);

  const resetPagination = useCallback(() => {
    setCurrentPage(0);
  }, []);

  return {
    currentPage,
    pageSize,
    offset,
    handlePageChange,
    handlePageSizeChange,
    resetPagination,
    setCurrentPage,
    setPageSize,
  };
};
