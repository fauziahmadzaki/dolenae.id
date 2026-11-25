"use client";

import { Image as ImageIcon, Loader2, MapPin, MoreVertical, Trash2 } from "lucide-react";
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
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/cn";
import type { GalleryPhoto } from "../api";
import { formatFileSize } from "../types";

interface GalleryGridProps {
  photos: GalleryPhoto[];
  pending?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  onEditRegion: (photo: GalleryPhoto, region: string) => Promise<boolean>;
  onDelete: (photo: GalleryPhoto) => Promise<boolean>;
  savingRegion: boolean;
  deletingId?: string | null;
  emptyMessage: string;
}

/** 4-column photo grid of the Galeri tab (`292:7276`). */
export function GalleryGrid({
  photos,
  pending,
  errorMessage,
  onRetry,
  onEditRegion,
  onDelete,
  deletingId,
  savingRegion,
  emptyMessage,
}: GalleryGridProps) {
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [regionTarget, setRegionTarget] = useState<GalleryPhoto | null>(null);
  const [regionValue, setRegionValue] = useState("");
  const [confirmTarget, setConfirmTarget] = useState<GalleryPhoto | null>(null);
  const deleting = confirmTarget !== null && deletingId === confirmTarget.id;

  if (pending) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-hairline bg-surface px-4 py-6 text-sm text-body">
        <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> Memuat
        galeri…
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

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-hairline bg-surface px-4 py-10 text-center text-sm text-body">
        <ImageIcon aria-hidden className="h-6 w-6 text-body/60" />
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {photos.map((photo) => {
          const busy = deletingId === photo.id;
          return (
            <article
              key={photo.id}
              className={cn(
                "overflow-hidden rounded-2xl border border-hairline bg-surface transition-colors hover:border-border-strong",
                busy && "opacity-60",
              )}
            >
              <div className="relative h-40 bg-canvas-subtle">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.fileName}
                  className="h-full w-full object-cover"
                />
                <span className="absolute left-2.5 top-2.5 max-w-[70%] truncate rounded-full bg-surface px-2.5 py-0.5 text-[10px] font-semibold text-ink">
                  {photo.region ?? "Tanpa wilayah"}
                </span>
                <div className="absolute right-2.5 top-2.5">
                  <button
                    type="button"
                    aria-label={`Aksi untuk ${photo.fileName}`}
                    aria-expanded={menuFor === photo.id}
                    disabled={busy}
                    onClick={() =>
                      setMenuFor((current) =>
                        current === photo.id ? null : photo.id,
                      )
                    }
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-surface text-ink shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  >
                    <MoreVertical aria-hidden className="h-4 w-4" />
                  </button>
                  {menuFor === photo.id ? (
                    <div className="absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-xl border border-hairline bg-surface py-1 shadow-lg">
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-ink hover:bg-canvas-subtle"
                        onClick={() => {
                          setMenuFor(null);
                          setRegionValue(photo.region ?? "");
                          setRegionTarget(photo);
                        }}
                      >
                        <MapPin aria-hidden className="h-3.5 w-3.5" /> Atur
                        wilayah
                      </button>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-danger hover:bg-danger/5"
                        onClick={() => {
                          setMenuFor(null);
                          setConfirmTarget(photo);
                        }}
                      >
                        <Trash2 aria-hidden className="h-3.5 w-3.5" /> Hapus
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                <p className="truncate text-[11px] font-medium text-ink">
                  {photo.fileName}
                </p>
                <span className="shrink-0 text-[10px] tabular-nums text-body">
                  {formatFileSize(photo.size)}
                </span>
              </div>
            </article>
          );
        })}
      </div>

      <Dialog
        open={regionTarget !== null}
        onOpenChange={(open) => {
          if (!open && !savingRegion) setRegionTarget(null);
        }}
      >
        <DialogContent className="w-[380px]">
          <DialogHeader>
            <DialogTitle>Atur wilayah</DialogTitle>
            <DialogDescription>
              Wilayah tampil sebagai label di kartu galeri.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={regionValue}
            maxLength={120}
            placeholder="Contoh: Jawa Timur"
            onChange={(event) => setRegionValue(event.target.value)}
          />
          <DialogFooter>
            <Button variant="secondary" disabled={savingRegion} onClick={() => setRegionTarget(null)}>
              Batal
            </Button>
            <Button
              disabled={savingRegion}
              onClick={async () => {
                if (regionTarget && await onEditRegion(regionTarget, regionValue.trim())) {
                  setRegionTarget(null);
                }
              }}
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmTarget !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setConfirmTarget(null);
        }}
      >
        <DialogContent className="w-[380px]">
          <DialogHeader>
            <DialogTitle>Hapus foto?</DialogTitle>
            <DialogDescription>
              &quot;{confirmTarget?.fileName}&quot; akan dihapus dari galeri dan
              storage. Tindakan ini tidak bisa dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" disabled={deleting} onClick={() => setConfirmTarget(null)}>
              Batal
            </Button>
            <Button
              disabled={deleting}
              onClick={async () => {
                if (confirmTarget && await onDelete(confirmTarget)) setConfirmTarget(null);
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
