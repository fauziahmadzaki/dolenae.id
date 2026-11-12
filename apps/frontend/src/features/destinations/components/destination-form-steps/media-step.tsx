import { ImagePlus } from "lucide-react";
import { ImageUploader } from "~/components/media/image-uploader";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import type { DestinationForm } from "../../schema";
import { difficultyLabels, statusLabels, statusOptions } from "../../schema";
import { Field } from "../form-field";
import type { StepProps } from "./types";

interface MediaStepProps extends StepProps {
  imageDraft: string;
  onImageDraftChange: (value: string) => void;
  token?: string | null;
}

export function MediaStep({
  values,
  errors,
  set,
  imageDraft,
  onImageDraftChange,
  token,
}: MediaStepProps) {
  const addImageByUrl = () => {
    if (!imageDraft.trim() || values.images.length >= 20) return;
    set("images", [...values.images, imageDraft.trim()]);
    onImageDraftChange("");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-semibold text-ink">Foto destinasi</p>

        <ImageUploader
          images={values.images}
          onChange={(images) => set("images", images)}
          token={token}
          max={20}
        />

        {errors.images && (
          <p role="alert" className="mt-1 text-xs text-danger">
            {errors.images}
          </p>
        )}

        <details className="mt-3 rounded-lg border border-hairline bg-surface p-3">
          <summary className="cursor-pointer text-xs font-semibold text-primary">
            Tempel URL foto (opsional)
          </summary>
          <div className="mt-2 flex gap-2">
            <Input
              aria-label="URL foto"
              placeholder="https://cdn.dolenae.id/bromo.jpg"
              value={imageDraft}
              onChange={(event) => onImageDraftChange(event.target.value)}
            />
            <Button
              type="button"
              variant="secondary"
              disabled={!imageDraft.trim() || values.images.length >= 20}
              onClick={addImageByUrl}
            >
              <ImagePlus aria-hidden className="h-4 w-4" />
              Tambah
            </Button>
          </div>
          <p className="mt-1 text-xs text-body">
            Berguna untuk foto yang sudah di-host di CDN lain.
          </p>
        </details>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Status publikasi" error={errors.status}>
          <Select
            ariaLabel="Status publikasi"
            value={values.status}
            onChange={(value) =>
              set("status", value as DestinationForm["status"])
            }
            options={statusOptions}
          />
        </Field>
        <div className="rounded-lg bg-canvas-subtle p-3 text-xs text-body">
          <p className="font-semibold text-ink">Ringkasan</p>
          <p className="mt-1">
            {values.name || "Destinasi tanpa nama"} ·{" "}
            {difficultyLabels[values.difficulty]} ·{" "}
            {statusLabels[values.status]}
          </p>
          <p>
            {values.province || "Provinsi belum diisi"}
            {values.regency ? `, ${values.regency}` : ""}
          </p>
          <p>
            {values.categoryIds.length} kategori · {values.images.length} foto
          </p>
        </div>
      </div>
    </div>
  );
}
