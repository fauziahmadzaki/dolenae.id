"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
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
import { Select } from "~/components/ui/select";
import type { AdminContent, ContentKind, ContentPayload, ContentStatus } from "../api";
import { CoverPicker } from "./gallery-uploader";

const KIND_OPTIONS = [
  { value: "artikel", label: "Artikel" },
  { value: "panduan", label: "Panduan" },
  { value: "tips", label: "Tips" },
];

const STATUS_OPTIONS = [
  { value: "draft", label: "Draf" },
  { value: "pending", label: "Menunggu" },
  { value: "published", label: "Terbit" },
];

interface ContentFormDialogProps {
  open: boolean;
  /** `null` opens the dialog in create mode. */
  content: AdminContent | null;
  token?: string | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: ContentPayload) => void;
}

interface FormState {
  title: string;
  kind: ContentKind;
  status: ContentStatus;
  excerpt: string;
  body: string;
  coverUrl: string | null;
}

const EMPTY: FormState = {
  title: "",
  kind: "artikel",
  status: "draft",
  excerpt: "",
  body: "",
  coverUrl: null,
};

/** Tambah/Edit artikel dialog, mirroring the Kategori/Fasilitas modals. */
export function ContentFormDialog({
  open,
  content,
  token,
  saving,
  onClose,
  onSubmit,
}: ContentFormDialogProps) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [touched, setTouched] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const busy = saving || coverUploading;

  useEffect(() => {
    if (!open) return;
    setTouched(false);
    setForm(
      content
        ? {
            title: content.title,
            kind: content.kind,
            status: content.status,
            excerpt: content.excerpt ?? "",
            body: content.body,
            coverUrl: content.coverUrl,
          }
        : EMPTY,
    );
  }, [open, content]);

  const titleError = form.title.trim().length < 3 ? "Judul minimal 3 karakter" : null;
  const bodyError = form.body.trim().length < 10 ? "Isi konten minimal 10 karakter" : null;
  const invalid = Boolean(titleError || bodyError);

  const submit = () => {
    setTouched(true);
    if (invalid || busy) return;
    onSubmit({
      title: form.title.trim(),
      kind: form.kind,
      status: form.status,
      excerpt: form.excerpt.trim() === "" ? null : form.excerpt.trim(),
      body: form.body.trim(),
      coverUrl: form.coverUrl,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next && !busy) onClose(); }}>
      <DialogContent className="max-h-[90vh] w-[520px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{content ? "Edit konten" : "Tambah konten"}</DialogTitle>
          <DialogDescription>
            Konten berstatus Terbit langsung tampil di aplikasi.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label htmlFor="content-title" className="mb-1 block text-xs font-semibold text-ink">
              Judul
            </label>
            <Input
              id="content-title"
              value={form.title}
              maxLength={180}
              placeholder="Contoh: Panduan mendaki Gunung Bromo saat musim hujan"
              aria-invalid={touched && Boolean(titleError)}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
            />
            {touched && titleError ? (
              <p className="mt-1 text-xs text-danger">{titleError}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="content-kind" className="mb-1 block text-xs font-semibold text-ink">
                Jenis
              </label>
              <Select
                id="content-kind"
                options={KIND_OPTIONS}
                value={form.kind}
                size="sm"
                onChange={(value) => setForm({ ...form, kind: value as ContentKind })}
              />
            </div>
            <div>
              <label htmlFor="content-status" className="mb-1 block text-xs font-semibold text-ink">
                Status
              </label>
              <Select
                id="content-status"
                options={STATUS_OPTIONS}
                value={form.status}
                size="sm"
                onChange={(value) => setForm({ ...form, status: value as ContentStatus })}
              />
            </div>
          </div>

          <div>
            <label htmlFor="content-excerpt" className="mb-1 block text-xs font-semibold text-ink">
              Ringkasan <span className="font-normal text-body">(opsional)</span>
            </label>
            <Input
              id="content-excerpt"
              value={form.excerpt}
              maxLength={400}
              placeholder="Satu kalimat yang tampil di kartu konten"
              onChange={(event) => setForm({ ...form, excerpt: event.target.value })}
            />
          </div>

          <div>
            <label htmlFor="content-body" className="mb-1 block text-xs font-semibold text-ink">
              Isi
            </label>
            <textarea
              id="content-body"
              value={form.body}
              rows={8}
              placeholder="Tulis isi konten…"
              aria-invalid={touched && Boolean(bodyError)}
              onChange={(event) => setForm({ ...form, body: event.target.value })}
              className="w-full rounded-lg border border-hairline bg-canvas-subtle px-3.5 py-3 text-sm text-ink placeholder:text-body focus-visible:border-border-strong focus-visible:outline-none aria-[invalid=true]:border-2 aria-[invalid=true]:border-danger"
            />
            {touched && bodyError ? (
              <p className="mt-1 text-xs text-danger">{bodyError}</p>
            ) : null}
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold text-ink">Sampul</p>
            <CoverPicker
              value={form.coverUrl}
              token={token}
              onChange={(url) => setForm((current) => ({ ...current, coverUrl: url }))}
              onUploading={setCoverUploading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Batal
          </Button>
          <Button onClick={submit} disabled={busy}>
            {saving ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : null}
            {content ? "Simpan perubahan" : "Simpan konten"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
