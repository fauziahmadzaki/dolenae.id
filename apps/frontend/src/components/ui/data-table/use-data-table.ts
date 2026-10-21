"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_PAGE_SIZE } from "~/lib/pagination";
import type { SortOrder, SortState } from "./data-table-types";

interface DataTableStateOptions {
  initialPageSize?: number;
  initialSort?: SortState;
  /** Delay before the search value is sent to the API. */
  searchDebounceMs?: number;
}

/**
 * State helper for server-side data tables: page, page size, debounced search,
 * and sorting. Changing any of them resets the page to the first one.
 */
export function useDataTableState({
  initialPageSize = DEFAULT_PAGE_SIZE,
  initialSort = { sort: "createdAt", order: "desc" },
  searchDebounceMs = 300,
}: DataTableStateOptions = {}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeValue] = useState(initialPageSize);
  const [search, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSortValue] = useState<SortState>(initialSort);

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSearch(search.trim()),
      searchDebounceMs,
    );
    return () => clearTimeout(timer);
  }, [search, searchDebounceMs]);

  const setSearch = useCallback((value: string) => {
    setSearchValue(value);
    setPage(1);
  }, []);

  const setPageSize = useCallback((value: number) => {
    setPageSizeValue(value);
    setPage(1);
  }, []);

  const setSort = useCallback((next: SortState) => {
    setSortValue(next);
    setPage(1);
  }, []);

  const resetPage = useCallback(() => setPage(1), []);

  const query = useMemo(
    () => ({
      page,
      limit: pageSize,
      sort: sort.sort,
      order: sort.order as SortOrder,
      search: debouncedSearch,
    }),
    [page, pageSize, sort, debouncedSearch],
  );

  return {
    page,
    pageSize,
    search,
    sort,
    query,
    setPage,
    setPageSize,
    setSearch,
    setSort,
    resetPage,
  };
}
