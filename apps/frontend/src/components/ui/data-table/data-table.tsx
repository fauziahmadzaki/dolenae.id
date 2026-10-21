"use client";

import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/cn";
import { pageCount } from "~/lib/pagination";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import {
  sortOptionsFromColumns,
  type DataTableColumn,
  type SortOption,
  type SortOrder,
  type SortState,
} from "./data-table-types";

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => string;

  /** Server-side pagination and sorting state (controlled by the page). */
  page: number;
  pageSize: number;
  total: number;
  sort: SortState;
  search: string;

  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortChange: (sort: SortState) => void;
  onSearchChange: (value: string) => void;

  sortOptions?: SortOption[];
  searchPlaceholder?: string;
  /** Plural noun used in states and the count, e.g. "pengguna". */
  itemLabel: string;

  isLoading?: boolean;
  isFetching?: boolean;
  error?: unknown;
  onRetry?: () => void;
  emptyState?: ReactNode;
  filters?: ReactNode;
  actions?: ReactNode;
  minWidthClassName?: string;
}

const errorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "Permintaan gagal. Silakan coba lagi.";

export function DataTable<T>({
  data,
  columns,
  getRowId,
  page,
  pageSize,
  total,
  sort,
  search,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onSearchChange,
  sortOptions,
  searchPlaceholder,
  itemLabel,
  isLoading = false,
  isFetching = false,
  error,
  onRetry,
  emptyState,
  filters,
  actions,
  minWidthClassName = "min-w-[960px]",
}: DataTableProps<T>) {
  const pages = pageCount(total, pageSize);

  // Keep the page in range when the result set shrinks (filter/search).
  useEffect(() => {
    if (page > pages) onPageChange(pages);
  }, [page, pages, onPageChange]);

  return (
    <div className="space-y-4">
      <DataTableToolbar
        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
        sort={sort}
        onSortChange={onSortChange}
        sortOptions={sortOptions ?? sortOptionsFromColumns(columns)}
        filters={filters}
        actions={actions}
        total={total}
        itemLabel={itemLabel}
      />

      {isLoading ? (
        <p role="status" className="text-sm text-body">
          Memuat {itemLabel}…
        </p>
      ) : error ? (
        <div
          role="alert"
          className="rounded-lg border border-hairline bg-surface p-6"
        >
          <p className="text-sm text-danger">{errorMessage(error)}</p>
          {onRetry && (
            <Button variant="secondary" className="mt-3" onClick={onRetry}>
              Coba lagi
            </Button>
          )}
        </div>
      ) : (
        <>
          {data.length === 0 ? (
            (emptyState ?? (
              <div className="rounded-lg border border-dashed border-hairline bg-surface p-10 text-center">
                <h3 className="font-display font-semibold text-ink">
                  Belum ada {itemLabel}
                </h3>
                <p className="mt-1 text-sm text-body">
                  Coba ubah pencarian atau filter.
                </p>
              </div>
            ))
          ) : (
            <div
              className="overflow-x-auto rounded-xl border border-hairline bg-surface"
              aria-busy={isFetching}
            >
              <table
                className={cn("w-full text-left text-sm", minWidthClassName)}
              >
                <thead className="h-12 bg-surface-2 text-[11px] uppercase tracking-wide text-body">
                  <tr>
                    {columns.map((column) => {
                      const sortKey = column.sortKey;
                      const active = sortKey ? sortKey === sort.sort : false;
                      const nextOrder: SortOrder =
                        active && sort.order === "asc" ? "desc" : "asc";

                      return (
                        <th
                          key={column.id}
                          scope="col"
                          aria-sort={
                            sortKey
                              ? active
                                ? sort.order === "asc"
                                  ? "ascending"
                                  : "descending"
                                : "none"
                              : undefined
                          }
                          className={cn(
                            "px-5 font-semibold",
                            column.headerClassName,
                            column.align === "right" && "text-right",
                            column.align === "center" && "text-center",
                          )}
                        >
                          {sortKey ? (
                            <button
                              type="button"
                              onClick={() =>
                                onSortChange({ sort: sortKey, order: nextOrder })
                              }
                              className="inline-flex items-center gap-1 hover:text-ink"
                            >
                              {column.header}
                              <SortIcon active={active} order={sort.order} />
                            </button>
                          ) : (
                            column.header
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody
                  className={cn(
                    "transition-opacity",
                    isFetching && "opacity-60",
                  )}
                >
                  {data.map((row) => (
                    <tr
                      key={getRowId(row)}
                      className="h-16 border-t border-hairline align-middle"
                    >
                      {columns.map((column) => (
                        <td
                          key={column.id}
                          className={cn(
                            "px-5",
                            column.align === "right" && "text-right",
                            column.align === "center" && "text-center",
                            column.className,
                          )}
                        >
                          {column.cell(row)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <DataTablePagination
            page={page}
            pageSize={pageSize}
            total={total}
            itemLabel={itemLabel}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            isFetching={isFetching}
          />
        </>
      )}
    </div>
  );
}

function SortIcon({ active, order }: { active: boolean; order: SortOrder }) {
  if (!active) {
    return <ChevronsUpDown aria-hidden className="h-3.5 w-3.5" />;
  }

  const Icon = order === "asc" ? ArrowUp : ArrowDown;

  return <Icon aria-hidden className="h-3.5 w-3.5 text-primary" />;
}
