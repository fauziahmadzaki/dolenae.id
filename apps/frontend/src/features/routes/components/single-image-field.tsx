"use client";

import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "~/components/ui/button";
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
const MAX_BYTES = 5 * 1024 * 1024;

interface SingleImageFieldProps {
  value: string | null;
  onChange: (url: string | null) => void;
  token?: string | null;
  folder?: string;
  disabled?: boolean;
}

/** One optional photo: upload, preview, replace or remove. */
export function SingleImageField({
  value,
  onChange,
  token,
  folder = "nodes",
  disabled = false,
}: SingleImageFieldProps) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const upload = async (file: File | undefined) => {
    if (!file || disabled) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast({
        title: "Format gambar tidak didukung",
        description: "Gunakan JPEG, PNG, WebP, GIF, atau AVIF.",
        variant: "danger",
      });
      return;
    }
    if (file.size > MAX_BYTES) {
      toast({
        title: "Ukuran foto terlalu besar",
        description: "Maksimal 5 MB.",
        variant: "danger",
      });
      return;
    }

    setUploading(true);
    try {
      const result = await uploadsApi.upload(file, token, folder);
      if (value) void uploadsApi.remove(value, token).catch(() => undefined);
      onChange(result.data.url);
    } catch {
      toast({ title: "Foto gagal diunggah", variant: "danger" });
    } finally {
      setUploading(false);
    }
  };

  const remove = () => {
    const current = value;
    onChange(null);
    if (current) void uploadsApi.remove(current, token).catch(() => undefined);
  };

  return (
    <div className="space-y-1.5">
      <span className="text-xs font-semibold text-body">Foto titik</span>

      {value ? (
        <div className="flex items-center gap-3 rounded-lg border border-hairline bg-surface p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Foto titik"
            className="h-16 w-24 rounded-md object-cover"
          />
          <div className="flex flex-1 flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={disabled || uploading}
              onClick={() => inputRef.current?.click()}
            >
              <ImagePlus aria-hidden className="h-4 w-4" />
              Ganti
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={disabled || uploading}
              onClick={remove}
              className="text-danger hover:bg-danger/10"
            >
              <Trash2 aria-hidden className="h-4 w-4" />
              Hapus
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            if (!disabled) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            void upload(event.dataTransfer.files[0]);
          }}
          className={cn(
            "flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed p-4 text-center",
            dragging
              ? "border-primary bg-primary/5"
              : "border-hairline bg-canvas-subtle",
            disabled && "opacity-60",
          )}
        >
          {uploading ? (
            <Loader2 aria-hidden className="h-5 w-5 animate-spin text-primary" />
          ) : (
            <ImagePlus aria-hidden className="h-5 w-5 text-primary/70" />
          )}
          <p className="text-xs text-body">
            Seret foto ke sini atau
            <button
              type="button"
              disabled={disabled || uploading}
              onClick={() => inputRef.current?.click()}
              className="ml-1 font-semibold text-primary underline disabled:opacity-50"
            >
              pilih gambar
            </button>
          </p>
          <p className="text-[11px] text-body">
            JPEG/PNG/WebP · maksimal 5 MB
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={(event) => {
          void upload(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </div>
  );
}
