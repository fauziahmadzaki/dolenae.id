"use client";

import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { cn } from "~/lib/cn";
import type { AdminContent } from "../api";
import {
  contentKindLabels,
  contentStatusLabels,
  formatPublishedDate,
  formatViews,
  initialsOf,
  readingMinutes,
} from "../types";

const STATUS_STYLES: Record<AdminContent["status"], string> = {
  published: "border border-hairline bg-success/10 text-success",
  draft: "border border-hairline bg-canvas-subtle text-body",
  pending: "border border-hairline bg-warning/10 text-warning",
};

export function ContentStatusBadge({
  status,
}: {
  status: AdminContent["status"];
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
        STATUS_STYLES[status],
      )}
    >
      {contentStatusLabels[status]}
    </span>
  );
}

interface ContentTableProps {
  items: AdminContent[];
  pending?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  onEdit: (item: AdminContent) => void;
  onDelete: (item: AdminContent) => void;
  deletingId?: string | null;
  emptyMessage: string;
}

/** Artikel table of the Konten page (`292:5016`). */
export function ContentTable({
  items,
  pending,
  errorMessage,
  onRetry,
  onEdit,
  onDelete,
  deletingId,
  emptyMessage,
}: ContentTableProps) {
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<AdminContent | null>(null);

  if (pending) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-hairline bg-surface px-4 py-6 text-sm text-body">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        Memuat konten…
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-danger/40 bg-danger/5 px-4 py-4 text-sm text-danger">
        <span>{errorMessage}</span>
        {onRetry ? (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Coba lagi
          </Button>
        ) : null}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-hairline bg-surface px-4 py-8 text-center text-sm text-body">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-hairline bg-surface">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b border-hairline bg-canvas-subtle/50 text-[11px] uppercase tracking-wide text-body">
            <tr>
              <th className="px-4 py-3 font-semibold">Konten</th>
              <th className="px-4 py-3 font-semibold">Penulis</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Dipublikasi</th>
              <th className="px-4 py-3 font-semibold">Dilihat</th>
              <th className="px-4 py-3 text-right font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {items.map((item) => {
              const busy = deletingId === item.id;
              return (
                <tr
                  key={item.id}
                  className={cn(
                    "align-middle hover:bg-canvas/40",
                    busy && "opacity-60",
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-canvas-subtle">
                        {item.coverUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.coverUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">
                          {item.title}
                        </p>
                        <p className="text-xs text-body">
                          {contentKindLabels[item.kind]} ·{" "}
                          {readingMinutes(item.body)} menit baca
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-canvas-subtle text-[10px] font-semibold text-body">
                        {item.author ? initialsOf(item.author.name) : "—"}
                      </span>
                      <span className="text-body">
                        {item.author?.name ?? "Tanpa penulis"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <ContentStatusBadge status={item.status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-body">
                    {formatPublishedDate(item.publishedAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums text-body">
                    {formatViews(item.views)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="relative inline-block text-left">
                      <button
                        type="button"
                        aria-label={`Aksi untuk ${item.title}`}
                        aria-expanded={menuFor === item.id}
                        disabled={busy}
                        onClick={() =>
                          setMenuFor((current) =>
                            current === item.id ? null : item.id,
                          )
                        }
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-body hover:bg-canvas-subtle hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                      >
                        <MoreVertical aria-hidden className="h-4 w-4" />
                      </button>
                      {menuFor === item.id ? (
                        <div className="absolute right-0 top-9 z-20 w-40 overflow-hidden rounded-xl border border-hairline bg-surface py-1 shadow-lg">
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-ink hover:bg-canvas-subtle"
                            onClick={() => {
                              setMenuFor(null);
                              onEdit(item);
                            }}
                          >
                            <Pencil aria-hidden className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-danger hover:bg-danger/5"
                            onClick={() => {
                              setMenuFor(null);
                              setConfirmTarget(item);
                            }}
                          >
                            <Trash2 aria-hidden className="h-3.5 w-3.5" /> Hapus
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog
        open={confirmTarget !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmTarget(null);
        }}
      >
        <DialogContent className="w-[380px]">
          <DialogHeader>
            <DialogTitle>Hapus konten?</DialogTitle>
            <DialogDescription>
              &quot;{confirmTarget?.title}&quot; akan dihapus permanen dan tidak
              bisa dikembalikan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirmTarget(null)}>
              Batal
            </Button>
            <Button
              onClick={() => {
                if (confirmTarget) onDelete(confirmTarget);
                setConfirmTarget(null);
              }}
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
