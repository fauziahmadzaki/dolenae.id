"use client";

import { X } from "lucide-react";

interface ActiveSearchChipProps {
  query: string;
  onClear: () => void;
}

/**
 * Removable chip showing the active Topbar search filter inside rebalanced
 * table and page toolbars.
 */
export function ActiveSearchChip({ query, onClear }: ActiveSearchChipProps) {
  const trimmed = query.trim();
  if (!trimmed) return null;

  return (
    <span className="inline-flex min-h-9 max-w-full items-center gap-1.5 rounded-full border border-hairline bg-canvas-subtle py-1 pl-3 pr-1.5 text-xs text-ink transition-colors hover:border-border-strong sm:max-w-[260px]">
      <span className="shrink-0 text-body">Pencarian:</span>
      <span className="truncate font-semibold text-ink">“{trimmed}”</span>
      <button
        type="button"
        onClick={onClear}
        aria-label="Hapus filter pencarian"
        className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-body transition-colors hover:bg-surface-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98]"
      >
        <X aria-hidden className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}
