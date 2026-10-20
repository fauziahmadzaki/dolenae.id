import { ImagePlus, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import type { DestinationForm } from "../../schema";
import { difficultyLabels, statusLabels, statusOptions } from "../../schema";
import { Field } from "../form-field";
import type { StepProps } from "./types";

interface MediaStepProps extends StepProps {
  imageDraft: string;
  onImageDraftChange: (value: string) => void;
}

export function MediaStep({
  values,
  errors,
  set,
  imageDraft,
  onImageDraftChange,
}: MediaStepProps) {
  const addImage = () => {
    if (!imageDraft.trim() || values.images.length >= 20) return;
    set("images", [...values.images, imageDraft.trim()]);
    onImageDraftChange("");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-semibold text-ink">
          Foto destinasi{" "}
          <span className="font-normal text-body">
            ({values.images.length}/20)
          </span>
        </p>
        <div className="flex gap-2">
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
            onClick={addImage}
          >
            <ImagePlus aria-hidden className="h-4 w-4" />
            Tambah
          </Button>
        </div>
        <p className="mt-1 text-xs text-body">
          Tempel URL foto. Unggah berkas tersedia setelah integrasi penyimpanan
          media.
        </p>
        {values.images.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-3">
            {values.images.map((image, index) => (
              <li key={`${image}-${index}`} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt={`Foto ${index + 1}`}
                  className="h-20 w-28 rounded-lg border border-hairline object-cover"
                />
                {index === 0 && (
                  <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-on-primary">
                    Utama
                  </span>
                )}
                <button
                  type="button"
                  aria-label={`Hapus foto ${index + 1}`}
                  onClick={() =>
                    set(
                      "images",
                      values.images.filter(
                        (_, position) => position !== index,
                      ),
                    )
                  }
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-danger text-white shadow-sm"
                >
                  <Trash2 aria-hidden className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {errors.images && (
          <p role="alert" className="mt-1 text-xs text-danger">
            {errors.images}
          </p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Status publikasi" error={errors.status}>
          <select
            aria-label="Status publikasi"
            value={values.status}
            onChange={(event) =>
              set("status", event.target.value as DestinationForm["status"])
            }
            className="h-12 w-full rounded-lg border border-hairline bg-canvas-subtle px-3 text-sm text-ink"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
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
