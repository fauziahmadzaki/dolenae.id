"use client";

import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { ActiveSearchChip } from "~/components/ui/active-search-chip";
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
  /** Hide inline search input when search is bound to the Topbar. */
  hideSearch?: boolean;
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
  /** Optional range description rendered inside unified table cards. */
  rangeText?: string;
  /** Render flat without outer card chrome when placed inside a DataTable card. */
  embedded?: boolean;
  className?: string;
}

export function DataTableToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Cari…",
  hideSearch = false,
  sort,
  onSortChange,
  sortOptions,
  filters,
  actions,
  total,
  itemLabel,
  rangeText,
  embedded = false,
  className,
}: DataTableToolbarProps) {
  if (hideSearch) {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3",
          embedded
            ? "border-b border-hairline px-5 py-3.5"
            : "rounded-2xl border border-hairline bg-surface px-5 py-3.5",
          className,
        )}
      >
        <div className="flex min-w-0 flex-wrap items-center gap-2.5">
          <span className="text-xs font-medium text-body" aria-live="polite">
            {rangeText ?? `${total} ${itemLabel}`}
          </span>
          <ActiveSearchChip
            query={search}
            onClear={() => onSearchChange("")}
          />
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2.5">
          <DataTableFilterPanel
            sort={sort}
            onSortChange={onSortChange}
            sortOptions={sortOptions}
            filters={filters}
          />
          {actions}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3",
        embedded
          ? "border-b border-hairline px-5 py-4"
          : "rounded-2xl border border-hairline bg-surface px-5 py-3.5",
        className,
      )}
    >
      <label className="flex h-10 w-full items-center gap-2 rounded-full border border-hairline bg-canvas-subtle px-3.5 sm:w-80">
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

      <div className="ml-auto flex flex-wrap items-center gap-2.5">
        <span className="text-xs text-body" aria-live="polite">
          {rangeText ?? `${total} ${itemLabel}`}
        </span>
        <DataTableFilterPanel
          sort={sort}
          onSortChange={onSortChange}
          sortOptions={sortOptions}
          filters={filters}
        />
        {actions}
      </div>
    </div>
  );
}
