import type { ReactNode } from "react";
import type { SelectOption } from "~/components/ui/select";

export type SortOrder = "asc" | "desc";

/** Sorting state shared by the table header and the toolbar select. */
export interface SortState {
  sort: string;
  order: SortOrder;
}

export interface SortOption {
  /** Encoded as `${sort}:${order}`. */
  value: string;
  label: string;
}

export interface DataTableFilter {
  key: string;
  label: string;
  /** Currently applied value (`""` means "all"). */
  value: string;
  options: SelectOption[];
  /** Label for the empty option, e.g. "Semua role". */
  allLabel: string;
  onChange: (value: string) => void;
}

export interface DataTableColumn<T> {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** Backend field name; when set, the header becomes clickable for sorting. */
  sortKey?: string;
  className?: string;
  headerClassName?: string;
  align?: "left" | "center" | "right";
}

export function encodeSort(state: SortState): string {
  return `${state.sort}:${state.order}`;
}

export function decodeSort(value: string): SortState {
  const [sort, order] = value.split(":");
  return { sort, order: order === "asc" ? "asc" : "desc" };
}

/** Fallback options derived from the sortable columns. */
export function sortOptionsFromColumns<T>(
  columns: DataTableColumn<T>[],
): SortOption[] {
  return columns.flatMap((column) => {
    const sortKey = column.sortKey;
    if (!sortKey) return [];

    return [
      {
        value: encodeSort({ sort: sortKey, order: "asc" }),
        label: `${column.header} ↑`,
      },
      {
        value: encodeSort({ sort: sortKey, order: "desc" }),
        label: `${column.header} ↓`,
      },
    ];
  });
}
