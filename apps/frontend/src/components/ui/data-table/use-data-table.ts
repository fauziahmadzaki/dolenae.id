"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  sanitizeUrlSearch,
  useShellSearchContext,
  useUrlSearchSync,
} from "~/features/admin/components/shell-search-context";
import { DEFAULT_PAGE_SIZE } from "~/lib/pagination";
import type { SortOrder, SortState } from "./data-table-types";

interface DataTableStateOptions {
  initialPageSize?: number;
  initialSort?: SortState;
  /** Delay before the search value is sent to the API. */
  searchDebounceMs?: number;
  /** Hydrate and sync search term from `?search=` query param. */
  syncFromUrl?: boolean;
}

function clearStandaloneUrlSearch() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  if (!params.has("search")) return;
  params.delete("search");
  const qs = params.toString();
  const nextUrl = `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`;
  window.history.replaceState(window.history.state, "", nextUrl);
}

/**
 * State helper for server-side data tables: page, page size, debounced search,
 * and sorting. Changing any of them resets the page to the first one.
 */
export function useDataTableState({
  initialPageSize = DEFAULT_PAGE_SIZE,
  initialSort = { sort: "createdAt", order: "desc" },
  searchDebounceMs = 300,
  syncFromUrl = false,
}: DataTableStateOptions = {}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeValue] = useState(initialPageSize);
  const [search, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSortValue] = useState<SortState>(initialSort);

  const shellSearch = useShellSearchContext();
  const hasShellSearch = shellSearch !== null;
  const lastStandaloneUrlRef = useRef<{
    pathname: string;
    search: string;
  } | null>(null);
  const handleUrlSync = useCallback((next: string) => {
    setSearchValue(next);
    setDebouncedSearch(next);
    setPage(1);
  }, []);

  const { clearUrlSearch } = useUrlSearchSync(
    handleUrlSync,
    syncFromUrl && hasShellSearch,
  );

  // Fallback for standalone DataTable usage outside AdminShell/ShellSearchProvider.
  useEffect(() => {
    if (!syncFromUrl || hasShellSearch || typeof window === "undefined") {
      return;
    }
    const readLocation = () => ({
      pathname: window.location.pathname,
      search: sanitizeUrlSearch(
        new URLSearchParams(window.location.search).get("search"),
      ),
    });
    const initial = readLocation();
    lastStandaloneUrlRef.current = initial;
    if (initial.search) {
      setSearchValue(initial.search);
      setDebouncedSearch(initial.search);
      setPage(1);
    }
    const onPopState = () => {
      const next = readLocation();
      const prev = lastStandaloneUrlRef.current;
      if (
        prev === null ||
        prev.pathname !== next.pathname ||
        prev.search !== next.search
      ) {
        lastStandaloneUrlRef.current = next;
        setSearchValue(next.search);
        setDebouncedSearch(next.search);
        setPage(1);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [syncFromUrl, hasShellSearch]);

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSearch(search.trim()),
      searchDebounceMs,
    );
    return () => clearTimeout(timer);
  }, [search, searchDebounceMs]);

  const setSearch = useCallback(
    (value: string) => {
      setSearchValue(value);
      setPage(1);
      if (syncFromUrl && !value.trim()) {
        if (!hasShellSearch) {
          clearStandaloneUrlSearch();
          if (typeof window !== "undefined") {
            lastStandaloneUrlRef.current = {
              pathname: window.location.pathname,
              search: "",
            };
          }
        } else {
          clearUrlSearch();
        }
      }
    },
    [syncFromUrl, hasShellSearch, clearUrlSearch],
  );

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
