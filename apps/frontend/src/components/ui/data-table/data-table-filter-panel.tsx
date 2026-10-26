"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Select } from "~/components/ui/select";
import { cn } from "~/lib/cn";
import {
  decodeSort,
  encodeSort,
  type DataTableFilter,
  type SortOption,
  type SortState,
} from "./data-table-types";

interface DataTableFilterPanelProps {
  sort: SortState;
  onSortChange: (sort: SortState) => void;
  sortOptions: SortOption[];
  filters?: DataTableFilter[];
  className?: string;
}

/**
 * Single entry point for table filters and sorting. Edits stay in a draft until
 * "Terapkan" is pressed, so the page only refetches once per applied change.
 */
export function DataTableFilterPanel({
  sort,
  onSortChange,
  sortOptions,
  filters = [],
  className,
}: DataTableFilterPanelProps) {
  const [open, setOpen] = useState(false);
  const [draftSort, setDraftSort] = useState<SortState>(sort);
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});

  const activeCount = filters.filter((filter) => filter.value !== "").length;
  const hasContent = filters.length > 0 || sortOptions.length > 0;

  if (!hasContent) return null;

  const syncDraft = () => {
    setDraftSort(sort);
    setDraftValues(
      Object.fromEntries(filters.map((filter) => [filter.key, filter.value])),
    );
  };

  const handleOpenChange = (next: boolean) => {
    if (next) syncDraft();
    setOpen(next);
  };

  const apply = () => {
    if (draftSort.sort !== sort.sort || draftSort.order !== sort.order) {
      onSortChange(draftSort);
    }
    for (const filter of filters) {
      const next = draftValues[filter.key] ?? "";
      if (next !== filter.value) filter.onChange(next);
    }
    setOpen(false);
  };

  const reset = () => {
    setDraftSort(sort);
    setDraftValues(
      Object.fromEntries(filters.map((filter) => [filter.key, ""])),
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={activeCount > 0 ? `Filter, ${activeCount} aktif` : "Filter"}
          className={cn(
            "flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition-colors",
            activeCount > 0
              ? "border-primary bg-primary/5 text-primary"
              : "border-hairline bg-surface text-body hover:bg-canvas-subtle hover:text-ink",
            className,
          )}
        >
          <SlidersHorizontal aria-hidden className="h-4 w-4" />
          Filter
          {activeCount > 0 && (
            <span className="rounded-full bg-primary px-1.5 text-[11px] font-bold text-on-primary">
              {activeCount}
            </span>
          )}
        </button>
      </DialogTrigger>

      <DialogContent className="w-[420px]">
        <div>
          <DialogTitle>Filter & urutan</DialogTitle>
          <DialogDescription className="mt-1">
            Pilih filter, lalu tekan Terapkan untuk memperbarui tabel.
          </DialogDescription>
        </div>

        <div className="max-h-[55vh] space-y-3 overflow-auto pr-1">
          {sortOptions.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-body">Urutkan</span>
              <Select
                ariaLabel="Urutkan"
                value={encodeSort(draftSort)}
                onChange={(value) => setDraftSort(decodeSort(value))}
                options={sortOptions}
              />
            </div>
          )}

          {filters.map((filter) => (
            <div key={filter.key} className="space-y-1.5">
              <span className="text-xs font-semibold text-body">
                {filter.label}
              </span>
              <Select
                ariaLabel={filter.label}
                value={draftValues[filter.key] ?? ""}
                onChange={(value) =>
                  setDraftValues((prev) => ({ ...prev, [filter.key]: value }))
                }
                options={[
                  { value: "", label: filter.allLabel },
                  ...filter.options,
                ]}
              />
            </div>
          ))}
        </div>

        <DialogFooter className="justify-between">
          <Button variant="ghost" onClick={reset}>
            Atur ulang
          </Button>
          <Button onClick={apply}>Terapkan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
