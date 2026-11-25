"use client";

import { useState } from "react";
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
import {
  statusOptions,
  trailSurfaceOptions,
  type RouteDifficulty,
  type TrailRouteStatus,
  type TrailRoute,
} from "../schema";

interface RouteDialogProps {
  mode: "create" | "edit";
  route?: TrailRoute;
  /** Compact summary, e.g. "Jalur bebas · 3 titik". */
  pointSummary: string;
  isPending: boolean;
  error?: unknown;
  onClose: () => void;
  onSubmit: (values: {
    name: string;
    description: string;
    surface: string;
    status: TrailRouteStatus;
    recommended: boolean;
    difficulty?: RouteDifficulty;
  }) => void;
}

const message = (error: unknown) =>
  error instanceof Error ? error.message : "Permintaan gagal.";

export function RouteDialog({
  mode,
  route,
  pointSummary,
  isPending,
  error,
  onClose,
  onSubmit,
}: RouteDialogProps) {
  const [name, setName] = useState(route?.name ?? "");
  const [description, setDescription] = useState(route?.description ?? "");
  const [surface, setSurface] = useState(route?.surface ?? "campuran");
  const [status, setStatus] = useState<TrailRouteStatus>(
    route?.status ?? "terverifikasi",
  );
  const [recommended, setRecommended] = useState(route?.recommended ?? false);
  const [difficulty, setDifficulty] = useState<RouteDifficulty>(
    route?.difficulty ?? "menengah",
  );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[460px]">
        <div>
          <DialogTitle>
            {mode === "create" ? "Simpan jalur" : "Edit jalur"}
          </DialogTitle>
          <DialogDescription className="mt-1">
            {mode === "create"
              ? pointSummary
              : `${route?.points.length ?? 0} titik`}
          </DialogDescription>
        </div>

        {mode === "create" && (
          <p className="rounded-lg bg-canvas-subtle p-2.5 text-xs text-body">
            {pointSummary}
          </p>
        )}

        <div className="space-y-3">
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-body">Nama jalur</span>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Trek Kawah"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-body">
              Catatan (opsional)
            </span>
            <textarea
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Rute pendakian melewati pasir berbisik."
              className="w-full rounded-lg border border-hairline bg-canvas-subtle px-3 py-2 text-sm text-ink outline-none focus-visible:border-border-strong"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-body">
                Jenis jalur
              </span>
              <Select
                ariaLabel="Jenis jalur"
                value={surface}
                onChange={setSurface}
                options={trailSurfaceOptions}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-body">Status</span>
              <Select
                ariaLabel="Status jalur"
                value={status}
                onChange={(value) => setStatus(value as TrailRouteStatus)}
                options={statusOptions}
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-body">
                Kesulitan
              </span>
              <Select
                ariaLabel="Kesulitan jalur"
                value={difficulty}
                onChange={(value) =>
                  setDifficulty(value as RouteDifficulty)
                }
                options={[
                  { value: "ramah-pemula", label: "Ramah pemula" },
                  { value: "menengah", label: "Menengah" },
                  { value: "sulit", label: "Sulit" },
                ]}
              />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={recommended}
              onChange={(event) => setRecommended(event.target.checked)}
              className="h-4 w-4"
            />
            Tandai sebagai jalur rekomendasi
          </label>
        </div>

        {error !== undefined && error !== null && (
          <p role="alert" className="text-sm text-danger">
            {message(error)}
          </p>
        )}

        <DialogFooter>
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            Batal
          </Button>
          <Button
            disabled={name.trim().length < 2 || isPending}
            onClick={() =>
              onSubmit({
                name: name.trim(),
                description,
                surface,
                status,
                recommended,
                difficulty,
              })
            }
          >
            {mode === "create" ? "Simpan jalur" : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
