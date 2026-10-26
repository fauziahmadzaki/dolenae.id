"use client";

import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "~/lib/cn";
import { DataTableFilterPanel } from "./data-table-filter-panel";
import type {
  DataTableFilter,
  SortOption,
  SortState,
} from "./data-table-types";

export interface DataTableToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  sort: SortState;
  onSortChange: (sort: SortState) => void;
  sortOptions: SortOption[];
  /** Filter controls rendered inside the filter panel. */
  filters?: DataTableFilter[];
  /** Extra controls on the right side, after the result count. */
  actions?: ReactNode;
  total: number;
  /** Plural noun used in the count and states, e.g. "pengguna". */
  itemLabel: string;
  className?: string;
}

export function DataTableToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Cari…",
  sort,
  onSortChange,
  sortOptions,
  filters,
  actions,
  total,
  itemLabel,
  className,
}: DataTableToolbarProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <label className="flex h-10 w-full items-center gap-2 rounded-lg border border-hairline bg-surface px-3 sm:w-72">
        <Search aria-hidden className="h-4 w-4 shrink-0 text-body" />
        <span className="sr-only">{searchPlaceholder}</span>
        <input
          type="search"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-body focus:outline-none"
        />
      </label>

      <DataTableFilterPanel
        sort={sort}
        onSortChange={onSortChange}
        sortOptions={sortOptions}
        filters={filters}
      />

      <div className="ml-auto flex items-center gap-2">
        <span className="text-sm text-body" aria-live="polite">
          {total} {itemLabel}
        </span>
        {actions}
      </div>
    </div>
  );
}
