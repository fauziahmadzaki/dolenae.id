"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Select } from "~/components/ui/select";
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
}

const PAGE_SIZE_OPTIONS = PAGE_SIZES.map((size) => ({
  value: String(size),
  label: String(size),
}));

export function DataTablePagination({
  page,
  pageSize,
  total,
  itemLabel,
  onPageChange,
  onPageSizeChange,
  isFetching = false,
}: DataTablePaginationProps) {
  const pages = pageCount(total, pageSize);
  const { from, to } = pageRange(page, pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-body">
      <p aria-live="polite">
        Menampilkan {from}–{to} dari {total} {itemLabel}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span>Tampilkan</span>
          <Select
            ariaLabel="Jumlah baris per halaman"
            size="sm"
            value={String(pageSize)}
            onChange={(value) => onPageSizeChange(Number(value))}
            options={PAGE_SIZE_OPTIONS}
            className="w-20"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            aria-label="Halaman sebelumnya"
            disabled={page <= 1 || isFetching}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft aria-hidden className="h-4 w-4" />
          </Button>
          <span className="rounded-md bg-primary px-3 py-1.5 text-on-primary">
            {page}
          </span>
          <span>dari {pages}</span>
          <Button
            variant="secondary"
            size="sm"
            aria-label="Halaman berikutnya"
            disabled={page >= pages || isFetching}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight aria-hidden className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
