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
import { SingleImageField } from "./single-image-field";
import {
  nodeTypeOptions,
  type TrackNode,
  type TrackNodeType,
} from "../schema";

interface NodeDialogProps {
  mode: "create" | "edit";
  latitude: number;
  longitude: number;
  node?: TrackNode;
  token?: string | null;
  isPending: boolean;
  error?: unknown;
  onClose: () => void;
  onSubmit: (values: {
    name: string;
    type: TrackNodeType;
    elevationMeters: number;
    notes: string;
    imageUrl: string | null;
  }) => void;
  onDelete?: () => void;
}

const message = (error: unknown) =>
  error instanceof Error ? error.message : "Permintaan gagal.";

export function NodeDialog({
  mode,
  latitude,
  longitude,
  node,
  token,
  isPending,
  error,
  onClose,
  onSubmit,
  onDelete,
}: NodeDialogProps) {
  const [name, setName] = useState(node?.name ?? "");
  const [type, setType] = useState<TrackNodeType>(node?.type ?? "pos");
  const [elevation, setElevation] = useState(
    node ? String(node.elevationMeters) : "",
  );
  const [notes, setNotes] = useState(node?.notes ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(
    node?.imageUrl ?? null,
  );

  const valid = name.trim().length >= 2 && Number.isFinite(Number(elevation));

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[440px]">
        <div>
          <DialogTitle>
            {mode === "create" ? "Tambah titik" : "Edit titik"}
          </DialogTitle>
          <DialogDescription className="mt-1">
            {latitude.toFixed(5)}, {longitude.toFixed(5)}
          </DialogDescription>
        </div>

        <div className="space-y-3">
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-body">Nama titik</span>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Cemoro Lawang"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-body">Tipe</span>
              <Select
                ariaLabel="Tipe titik"
                value={type}
                onChange={(value) => setType(value as TrackNodeType)}
                options={nodeTypeOptions}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-body">
                Elevasi (mdpl)
              </span>
              <Input
                inputMode="numeric"
                value={elevation}
                onChange={(event) => setElevation(event.target.value)}
                placeholder="2200"
              />
            </label>
          </div>
          <SingleImageField
            value={imageUrl}
            onChange={setImageUrl}
            token={token}
            folder="nodes"
            disabled={isPending}
          />

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-body">
              Catatan (opsional)
            </span>
            <textarea
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Basecamp utama, banyak homestay."
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
          {mode === "edit" && onDelete ? (
            <Button
              variant="ghost"
              onClick={onDelete}
              disabled={isPending}
              className="text-danger hover:bg-danger/10"
            >
              <Trash2 aria-hidden className="h-4 w-4" />
              Hapus
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose} disabled={isPending}>
              Batal
            </Button>
            <Button
              disabled={!valid || isPending}
              onClick={() =>
                onSubmit({
                  name: name.trim(),
                  type,
                  elevationMeters: Number(elevation),
                  notes,
                  imageUrl,
                })
              }
            >
              {mode === "create" ? "Tambah titik" : "Simpan"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
