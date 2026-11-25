"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { cn } from "~/lib/cn";
import {
  gradeOptions,
  surfaceOptions,
  traversalOptions,
  type RouteGrade,
  type RouteSegment,
  type RouteSurface,
  type TrackNode,
} from "../schema";

interface SegmentDialogProps {
  segment: RouteSegment;
  nodes: TrackNode[];
  isPending: boolean;
  error?: unknown;
  onClose: () => void;
  onSubmit: (values: {
    surface: RouteSurface;
    grade: RouteGrade;
    bidirectional: boolean;
    estimatedDurationMinutes: number | null;
    traversableBy: string[];
    notes: string;
  }) => void;
  onDelete: () => void;
}

const message = (error: unknown) =>
  error instanceof Error ? error.message : "Permintaan gagal.";

export function SegmentDialog({
  segment,
  nodes,
  isPending,
  error,
  onClose,
  onSubmit,
  onDelete,
}: SegmentDialogProps) {
  const [surface, setSurface] = useState<RouteSurface>(segment.surface);
  const [grade, setGrade] = useState<RouteGrade>(segment.grade);
  const [bidirectional, setBidirectional] = useState(segment.bidirectional);
  const [duration, setDuration] = useState(
    segment.estimatedDurationMinutes?.toString() ?? "",
  );
  const [traversableBy, setTraversableBy] = useState<string[]>(
    segment.traversableBy,
  );
  const [notes, setNotes] = useState(segment.notes ?? "");

  const nameOf = (id: string) =>
    nodes.find((node) => node.id === id)?.name ?? "Titik";

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[460px]">
        <div>
          <DialogTitle>Ruas jalur</DialogTitle>
          <DialogDescription className="mt-1">
            {nameOf(segment.fromNodeId)} → {nameOf(segment.toNodeId)}
          </DialogDescription>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-body">Permukaan</span>
              <Select
                ariaLabel="Permukaan"
                value={surface}
                onChange={(value) => setSurface(value as RouteSurface)}
                options={surfaceOptions}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-body">Kecuraman</span>
              <Select
                ariaLabel="Kecuraman"
                value={grade}
                onChange={(value) => setGrade(value as RouteGrade)}
                options={gradeOptions}
              />
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-body">
              Estimasi waktu (menit, opsional)
            </span>
            <Input
              inputMode="numeric"
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
              placeholder="45"
            />
          </label>

          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-body">
              Bisa dilewati
            </span>
            <div className="flex flex-wrap gap-1.5">
              {traversalOptions.map((option) => {
                const active = traversableBy.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      setTraversableBy((prev) =>
                        active
                          ? prev.filter((item) => item !== option.value)
                          : [...prev, option.value],
                      )
                    }
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                      active
                        ? "border-primary bg-primary text-on-primary"
                        : "border-hairline bg-surface text-body hover:bg-canvas-subtle",
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={bidirectional}
              onChange={(event) => setBidirectional(event.target.checked)}
              className="h-4 w-4"
            />
            Bisa dilalui dua arah
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-body">
              Catatan (opsional)
            </span>
            <textarea
              rows={2}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Rawan longsor saat hujan."
              className="w-full rounded-lg border border-hairline bg-canvas-subtle px-3 py-2 text-sm text-ink outline-none focus-visible:border-border-strong"
            />
          </label>
        </div>

        {error !== undefined && error !== null && (
          <p role="alert" className="text-sm text-danger">
            {message(error)}
          </p>
        )}

        <DialogFooter className="justify-between">
          <Button
            variant="ghost"
            className="text-danger hover:bg-danger/10"
            disabled={isPending}
            onClick={onDelete}
          >
            <Trash2 aria-hidden className="h-4 w-4" />
            Hapus ruas
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose} disabled={isPending}>
              Batal
            </Button>
            <Button
              disabled={isPending}
              onClick={() =>
                onSubmit({
                  surface,
                  grade,
                  bidirectional,
                  estimatedDurationMinutes: duration.trim()
                    ? Number(duration)
                    : null,
                  traversableBy,
                  notes,
                })
              }
            >
              Simpan
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
