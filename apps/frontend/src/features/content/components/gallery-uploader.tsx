"use client";

import { Loader2, Trash2, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "~/components/ui/toaster";
import { uploadsApi } from "~/features/media/api";
import { cn } from "~/lib/cn";
import { galleryApi } from "../api";
import { GALLERY_KEY } from "../hooks/use-content";

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];
const MAX_BYTES = 5 * 1024 * 1024;

export interface GalleryUploadInput {
  url: string;
  key: string;
  name: string;
  mime: string;
  size: number;
}

interface GalleryUploaderProps {
  token?: string | null;
  disabled?: boolean;
  onUploaded: (file: GalleryUploadInput) => Promise<void>;
}

/**
 * Gallery dropzone: uploads straight to `/api/uploads?folder=gallery`, then
 * hands the storage key to the page so it can register the photo.
 */
export function GalleryUploader({
  token,
  disabled = false,
  onUploaded,
}: GalleryUploaderProps) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const busy = useRef(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleFiles = async (list: FileList | null) => {
    if (!list || list.length === 0 || disabled || busy.current) return;

    const file = list[0];
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast({
        title: `"${file.name}" bukan gambar yang didukung`,
        description: "Gunakan JPEG, PNG, WebP, GIF, atau AVIF.",
        variant: "danger",
      });
      return;
    }
    if (file.size > MAX_BYTES) {
      toast({
        title: `"${file.name}" terlalu besar`,
        description: "Ukuran maksimal 5 MB per foto.",
        variant: "danger",
      });
      return;
    }

    busy.current = true;
    setUploading(true);
    try {
      const result = await uploadsApi.upload(file, token, "gallery");
      await onUploaded(result.data);
    } catch (error) {
      toast({
        title: "Unggah gagal",
        description:
          error instanceof Error ? error.message : "Periksa koneksi lalu coba lagi.",
        variant: "danger",
      });
    } finally {
      busy.current = false;
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
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
        dragging ? "border-primary bg-primary/5" : "border-hairline bg-canvas-subtle",
        (disabled || uploading) && "opacity-60",
      )}
    >
      <UploadCloud aria-hidden className="mx-auto h-8 w-8 text-primary/70" />
      <p className="mt-2 text-sm font-semibold text-ink">Seret foto ke sini</p>
      <p className="mt-1 text-xs text-body">
        JPEG, PNG, WebP, GIF, atau AVIF · maksimal 5 MB per foto
      </p>
      <button
        type="button"
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
        className="mt-3 inline-flex h-9 items-center gap-2 rounded-full border border-border-strong bg-surface px-4 text-sm font-semibold text-primary hover:bg-canvas-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50"
      >
        {uploading ? (
          <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
        ) : (
          <UploadCloud aria-hidden className="h-4 w-4" />
        )}
        {uploading ? "Mengunggah…" : "Pilih foto"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={(event) => void handleFiles(event.target.files)}
      />
    </div>
  );
}

interface CoverPickerProps {
  value: string | null;
  token?: string | null;
  onChange: (url: string | null) => void;
  onUploading: (uploading: boolean) => void;
}

/** New covers are kept in the gallery so cancelled edits do not leave hidden objects. */
export function CoverPicker({ value, token, onChange, onUploading }: CoverPickerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const pick = async (list: FileList | null) => {
    const file = list?.[0];
    if (!file || uploading) return;
    if (!ACCEPTED_TYPES.includes(file.type) || file.size > MAX_BYTES) {
      toast({
        title: "Gambar tidak valid",
        description: "JPEG/PNG/WebP/GIF/AVIF, maksimal 5 MB.",
        variant: "danger",
      });
      return;
    }
    setUploading(true);
    onUploading(true);
    let uploaded: GalleryUploadInput | undefined;
    try {
      const result = await uploadsApi.upload(file, token, "gallery");
      uploaded = result.data;
      const photo = await galleryApi.create(uploaded, token ?? undefined);
      onChange(photo.data.url);
      void queryClient.invalidateQueries({ queryKey: [GALLERY_KEY] });
    } catch (error) {
      if (uploaded) {
        try {
          await uploadsApi.remove(uploaded.url, token);
        } catch (cleanupError) {
          toast({
            title: "Berkas sampul belum bisa dibersihkan",
            description: cleanupError instanceof Error ? cleanupError.message : undefined,
            variant: "danger",
          });
        }
      }
      toast({
        title: "Unggah sampul gagal",
        description:
          error instanceof Error ? error.message : "Periksa koneksi lalu coba lagi.",
        variant: "danger",
      });
    } finally {
      onUploading(false);
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-hairline bg-canvas-subtle">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Sampul" className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex h-9 items-center gap-2 rounded-full border border-border-strong bg-surface px-4 text-sm font-semibold text-primary hover:bg-canvas-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
          ) : (
            <UploadCloud aria-hidden className="h-4 w-4" />
          )}
          {value ? "Ganti sampul" : "Pilih sampul"}
        </button>
        {value ? (
          <button
            type="button"
            onClick={() => {
              // Keep the stored file: the article may already point at it, and
              // a cancelled dialog must not delete a live cover.
              onChange(null);
            }}
            className="inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm font-semibold text-danger hover:bg-danger/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Trash2 aria-hidden className="h-4 w-4" /> Hapus
          </button>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={(event) => void pick(event.target.files)}
      />
    </div>
  );
}
