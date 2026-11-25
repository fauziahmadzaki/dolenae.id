"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Select } from "~/components/ui/select";
import { cn } from "~/lib/cn";
import { PAGE_SIZES, pageCount, pageRange } from "~/lib/pagination";

export interface DataTablePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  /** Plural noun used in the range text, e.g. "pengguna". */
  itemLabel: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  isFetching?: boolean;
  /** Render inside a unified table card footer with top hairline border. */
  embedded?: boolean;
}

const PAGE_SIZE_OPTIONS = PAGE_SIZES.map((size) => ({
  value: String(size),
  label: String(size),
}));

function pageWindow(current: number, totalPages: number): number[] {
  const maxVisible = 5;
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, current - half);
  const end = Math.min(totalPages, start + maxVisible - 1);
  start = Math.max(1, end - maxVisible + 1);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function DataTablePagination({
  page,
  pageSize,
  total,
  itemLabel,
  onPageChange,
  onPageSizeChange,
  isFetching = false,
  embedded = false,
}: DataTablePaginationProps) {
  const pages = pageCount(total, pageSize);
  const { from, to } = pageRange(page, pageSize, total);
  const visible = pageWindow(page, pages);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 text-sm text-body",
        embedded && "border-t border-hairline px-5 py-3.5",
      )}
    >
      <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm">
        <span>Tampilkan</span>
        <Select
          ariaLabel="Jumlah baris per halaman"
          size="sm"
          value={String(pageSize)}
          onChange={(value) => onPageSizeChange(Number(value))}
          options={PAGE_SIZE_OPTIONS}
          className="w-20"
        />
        <p aria-live="polite">
          ({from}–{to} dari {total} {itemLabel})
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Halaman sebelumnya"
          disabled={page <= 1 || isFetching}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex size-9 items-center justify-center rounded-full border border-hairline bg-surface text-ink transition-colors hover:bg-canvas-subtle disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft aria-hidden className="h-4 w-4" />
        </button>
        {visible.map((number) => (
          <button
            key={number}
            type="button"
            aria-label={`Halaman ${number}`}
            aria-current={page === number ? "page" : undefined}
            disabled={isFetching}
            onClick={() => onPageChange(number)}
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-full text-xs font-semibold transition-colors",
              page === number
                ? "bg-primary text-on-primary"
                : "border border-hairline bg-surface text-body hover:bg-canvas-subtle hover:text-ink",
            )}
          >
            {number}
          </button>
        ))}
        <button
          type="button"
          aria-label="Halaman berikutnya"
          disabled={page >= pages || isFetching}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex size-9 items-center justify-center rounded-full border border-hairline bg-surface text-ink transition-colors hover:bg-canvas-subtle disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight aria-hidden className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
