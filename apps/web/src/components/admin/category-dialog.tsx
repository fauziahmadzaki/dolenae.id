import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Category, CategoryType } from "@dolenae/types";
import {
  CATEGORY_ICON_OPTIONS,
  IconByName,
  IconCheck,
  IconX,
} from "~/components/icons";

const schema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(120),
  slug: z.string().max(140).optional(),
  type: z.enum(["terrain", "activity"]),
  icon: z.string().max(80).optional(),
  description: z.string().max(500).optional(),
});
type FormValues = z.infer<typeof schema>;

export function CategoryDialog({
  editing,
  onClose,
  onSave,
}: Readonly<{
  editing: Category | null;
  onClose: () => void;
  onSave: (input: {
    name: string;
    slug?: string;
    type: CategoryType;
    icon?: string;
    description?: string;
  }) => Promise<void>;
}>) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: editing?.name ?? "",
      slug: editing?.slug ?? "",
      type: editing?.type ?? "terrain",
      icon: editing?.icon ?? "lucide:mountain",
      description: editing?.description ?? "",
    },
  });

  const type = watch("type");
  const icon = watch("icon");

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await onSave(values);
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Gagal menyimpan");
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4">
      <div className="flex w-full max-w-[520px] flex-col gap-5 rounded-2xl border border-hairline bg-surface p-6 shadow-lg">
        {/* Head */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-ink">
              {editing ? "Edit kategori" : "Tambah kategori"}
            </h2>
            <p className="mt-1 text-[13px] text-body">
              {editing
                ? "Perbarui detail kategori destinasi."
                : "Buat kategori baru untuk mengelompokkan destinasi."}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-body hover:text-ink"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
          {/* Nama */}
          <div className="space-y-2">
            <label className="flex items-center gap-1 text-[13px] font-semibold text-ink" htmlFor="c-name">
              Nama kategori <span className="text-danger">*</span>
            </label>
            <input
              id="c-name"
              className="h-11 w-full rounded-[10px] border border-hairline bg-canvas px-3.5 text-sm text-ink outline-none focus:border-border-strong"
              {...register("name")}
            />
            {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-ink" htmlFor="c-slug">
              Slug
            </label>
            <input
              id="c-slug"
              placeholder="otomatis dari nama"
              className="h-11 w-full rounded-[10px] border border-hairline bg-canvas px-3.5 text-sm text-ink outline-none placeholder:text-body/60 focus:border-border-strong"
              {...register("slug")}
            />
          </div>

          {/* Tipe */}
          <div className="space-y-2">
            <span className="text-[13px] font-semibold text-ink">Tipe</span>
            <div className="flex gap-1 rounded-[10px] bg-surface-2 p-1">
              {(["terrain", "activity"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setValue("type", t)}
                  className={
                    "flex-1 rounded-lg py-2 text-[13px] font-semibold transition " +
                    (type === t ? "bg-surface text-ink shadow-sm" : "text-body hover:text-ink")
                  }
                >
                  {t === "terrain" ? "Terrain" : "Aktivitas"}
                </button>
              ))}
            </div>
          </div>

          {/* Ikon */}
          <div className="space-y-2">
            <span className="text-[13px] font-semibold text-ink">Ikon</span>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_ICON_OPTIONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setValue("icon", ic)}
                  aria-label={ic.replace("lucide:", "")}
                  className={
                    "flex h-11 w-11 items-center justify-center rounded-[10px] transition " +
                    (icon === ic
                      ? "bg-primary text-on-primary"
                      : "bg-surface-2 text-body hover:text-ink")
                  }
                >
                  <IconByName name={ic} className="h-5 w-5" />
                </button>
              ))}
            </div>
          </div>

          {/* Deskripsi */}
          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-ink" htmlFor="c-desc">
              Deskripsi singkat
            </label>
            <textarea
              id="c-desc"
              rows={3}
              className="w-full rounded-[10px] border border-hairline bg-canvas px-3.5 py-3 text-sm text-ink outline-none focus:border-border-strong"
              {...register("description")}
            />
          </div>

          {serverError && (
            <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{serverError}</p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-hairline px-4 py-2.5 text-sm font-semibold text-body hover:text-ink"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary hover:bg-primary-hover disabled:opacity-60"
            >
              <IconCheck className="h-4 w-4" />
              {isSubmitting ? "Menyimpan..." : "Simpan kategori"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
