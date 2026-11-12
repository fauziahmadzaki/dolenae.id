"use client";

import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Star,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useRef, useState } from "react";
import { useToast } from "~/components/ui/toaster";
import { uploadsApi } from "~/features/media/api";
import { cn } from "~/lib/cn";

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];
const ACCEPT_ATTR = ACCEPTED_TYPES.join(",");
const MAX_BYTES = 5 * 1024 * 1024;

interface PendingUpload {
  id: string;
  name: string;
}

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  token?: string | null;
  max?: number;
  folder?: string;
  disabled?: boolean;
}

/**
 * Drag-and-drop image uploader: validates type/size on the client, uploads to
 * the API and lets the admin pick the primary photo or reorder the gallery.
 */
export function ImageUploader({
  images,
  onChange,
  token,
  max = 20,
  folder = "destinations",
  disabled = false,
}: ImageUploaderProps) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<PendingUpload[]>([]);
  const [dragging, setDragging] = useState(false);

  const full = images.length + uploading.length >= max;

  const handleFiles = async (list: FileList | null) => {
    if (!list || list.length === 0 || disabled) return;

    const slots = max - images.length - uploading.length;
    if (slots <= 0) {
      toast({ title: `Maksimal ${max} foto`, variant: "danger" });
      return;
    }

    const accepted: File[] = [];
    for (const file of Array.from(list).slice(0, slots)) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast({
          title: `"${file.name}" bukan gambar yang didukung`,
          description: "Gunakan JPEG, PNG, WebP, GIF, atau AVIF.",
          variant: "danger",
        });
        continue;
      }
      if (file.size > MAX_BYTES) {
        toast({
          title: `"${file.name}" terlalu besar`,
          description: "Ukuran maksimal 5 MB per foto.",
          variant: "danger",
        });
        continue;
      }
      accepted.push(file);
    }

    if (accepted.length === 0) return;

    const pending = accepted.map((file) => ({
      id: `${Date.now()}-${file.name}-${Math.random()}`,
      name: file.name,
    }));
    setUploading((prev) => [...prev, ...pending]);

    const results = await Promise.allSettled(
      accepted.map((file) => uploadsApi.upload(file, token, folder)),
    );

    const urls = results.flatMap((result) =>
      result.status === "fulfilled" ? [result.value.data.url] : [],
    );
    const failed = results.length - urls.length;

    if (urls.length > 0) onChange([...images, ...urls]);

    if (failed > 0) {
      toast({
        title: `${failed} foto gagal diunggah`,
        description: "Periksa koneksi atau format file lalu coba lagi.",
        variant: "danger",
      });
    } else {
      toast({
        title: `${urls.length} foto diunggah`,
        variant: "success",
      });
    }

    setUploading((prev) =>
      prev.filter((item) => !pending.some((entry) => entry.id === item.id)),
    );
  };

  const removeImage = (index: number) => {
    const url = images[index];
    onChange(images.filter((_, position) => position !== index));
    // Best effort: untracked/failed deletions do not block the form.
    if (url) void uploadsApi.remove(url, token).catch(() => undefined);
  };

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= images.length) return;

    const next = [...images];
    const [item] = next.splice(index, 1);
    if (!item) return;
    next.splice(target, 0, item);
    onChange(next);
  };

  const setPrimary = (index: number) => {
    if (index === 0) return;
    const next = [...images];
    const [item] = next.splice(index, 1);
    if (!item) return;
    next.unshift(item);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "rounded-xl border-2 border-dashed p-6 text-center transition-colors",
          dragging
            ? "border-primary bg-primary/5"
            : "border-hairline bg-canvas-subtle",
          disabled && "opacity-60",
        )}
      >
        <UploadCloud
          aria-hidden
          className="mx-auto h-8 w-8 text-primary/70"
        />
        <p className="mt-2 text-sm font-semibold text-ink">
          Seret foto ke sini
        </p>
        <p className="mt-1 text-xs text-body">
          JPEG, PNG, WebP, GIF, atau AVIF · maksimal 5 MB per foto
        </p>
        <button
          type="button"
          disabled={disabled || full}
          onClick={() => inputRef.current?.click()}
          className="mt-3 rounded-full border border-border-strong bg-surface px-4 py-1.5 text-sm font-semibold text-primary hover:bg-canvas-subtle disabled:cursor-not-allowed disabled:opacity-50"
        >
          Pilih gambar
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTR}
          multiple
          className="hidden"
          onChange={(event) => {
            void handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <p className="mt-2 text-xs text-body" aria-live="polite">
          {images.length}/{max} foto
          {full ? " · batas tercapai" : ""}
        </p>
      </div>

      {uploading.length > 0 && (
        <ul className="space-y-1 text-xs text-body">
          {uploading.map((item) => (
            <li key={item.id} className="flex items-center gap-2">
              <Loader2 aria-hidden className="h-3.5 w-3.5 animate-spin" />
              Mengunggah {item.name}…
            </li>
          ))}
        </ul>
      )}

      {images.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => (
            <li
              key={`${image}-${index}`}
              className="overflow-hidden rounded-lg border border-hairline bg-surface"
            >
              <div className="relative h-28 bg-canvas-subtle">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt={`Foto ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                {index === 0 && (
                  <span className="absolute left-2 top-2 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-on-primary">
                    Utama
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-1 p-1.5">
                <div className="flex gap-0.5">
                  <IconButton
                    label={`Geser foto ${index + 1} ke kiri`}
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowLeft aria-hidden className="h-3.5 w-3.5" />
                  </IconButton>
                  <IconButton
                    label={`Geser foto ${index + 1} ke kanan`}
                    disabled={index === images.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowRight aria-hidden className="h-3.5 w-3.5" />
                  </IconButton>
                  <IconButton
                    label={`Jadikan foto ${index + 1} utama`}
                    disabled={index === 0}
                    onClick={() => setPrimary(index)}
                  >
                    <Star aria-hidden className="h-3.5 w-3.5" />
                  </IconButton>
                </div>
                <IconButton
                  label={`Hapus foto ${index + 1}`}
                  onClick={() => removeImage(index)}
                  danger
                >
                  <Trash2 aria-hidden className="h-3.5 w-3.5" />
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled = false,
  danger = false,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-md p-1.5 text-body hover:bg-surface-2 hover:text-ink",
        danger && "hover:bg-danger/10 hover:text-danger",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-body",
      )}
    >
      {children}
    </button>
  );
}
