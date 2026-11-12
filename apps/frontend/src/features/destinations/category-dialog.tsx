"use client";

import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { ApiError } from "~/lib/api/types";
import type { Category, CategoryType } from "~/types/domain";
import { categoriesApi } from "./api/destinations";
import { CategoryIcon } from "./category-icon";
import {
  categoryFormSchema,
  categoryIconOptions,
  categoryTypeLabels,
  type CategoryForm,
} from "./schema";

type Mode = { kind: "create" } | { kind: "edit" | "delete"; category: Category };

interface CategoryDialogProps {
  mode: Mode;
  token: string;
  onClose: () => void;
  onSaved: (message: string) => void;
  onUnauthorized: () => void;
}

const message = (error: unknown) =>
  error instanceof Error ? error.message : "Permintaan gagal. Silakan coba lagi.";

export function CategoryDialog({
  mode,
  token,
  onClose,
  onSaved,
  onUnauthorized,
}: CategoryDialogProps) {
  const category = "category" in mode ? mode.category : null;
  const form = useForm<CategoryForm>({
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      type: category?.type ?? "terrain",
      icon: category?.icon ?? "lucide:mountain",
      description: category?.description ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values?: CategoryForm) => {
      if (mode.kind === "delete")
        return categoriesApi.remove(category!.id, token);
      if (!values) return;
      const payload = {
        name: values.name,
        slug: values.slug.trim() || undefined,
        type: values.type,
        icon: values.icon,
        description: values.description.trim() || null,
      };
      return mode.kind === "create"
        ? categoriesApi.create(payload, token)
        : categoriesApi.update(category!.id, payload, token);
    },
    onSuccess: () =>
      onSaved(
        mode.kind === "create"
          ? "Kategori berhasil ditambahkan."
          : mode.kind === "edit"
            ? "Kategori berhasil diperbarui."
            : "Kategori berhasil dihapus.",
      ),
    onError: (error) => {
      if (error instanceof ApiError && error.status === 401) onUnauthorized();
    },
  });

  const submit = form.handleSubmit((values) => {
    const parsed = categoryFormSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        form.setError(issue.path[0] as keyof CategoryForm, {
          message: issue.message,
        });
      }
      return;
    }
    mutation.mutate(parsed.data);
  });

  const selectedType = form.watch("type");
  const selectedIcon = form.watch("icon");
  const titles = {
    create: "Tambah kategori",
    edit: "Edit kategori",
    delete: "Hapus kategori",
  };
  const descriptions = {
    create: "Kategori baru langsung tersedia untuk klasifikasi destinasi.",
    edit: "Perbarui nama, tipe, ikon, atau deskripsi kategori.",
    delete: `Hapus ${category?.name}? Destinasi yang memakainya akan dilepas dari kategori ini.`,
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !mutation.isPending) onClose();
      }}
    >
      <DialogContent className="w-[480px] max-h-[90dvh] overflow-y-auto">
        <DialogTitle>{titles[mode.kind]}</DialogTitle>
        <DialogDescription>{descriptions[mode.kind]}</DialogDescription>

        {mutation.isError && (
          <p role="alert" className="text-sm text-danger">
            {message(mutation.error)}
          </p>
        )}

        {mode.kind === "delete" ? (
          <div className="flex justify-end gap-2">
            <Button variant="secondary" disabled={mutation.isPending} onClick={onClose}>
              Batal
            </Button>
            <Button
              className="bg-danger hover:bg-danger/90"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate(undefined)}
            >
              {mutation.isPending ? "Menghapus…" : "Hapus permanen"}
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4" noValidate>
            <fieldset disabled={mutation.isPending} className="space-y-4">
              <div>
                <label htmlFor="category-name" className="mb-1 block text-sm font-semibold text-ink">
                  Nama
                </label>
                <Input
                  id="category-name"
                  placeholder="mis. Gunung"
                  aria-invalid={!!form.formState.errors.name}
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p role="alert" className="mt-1 text-xs text-danger">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="category-slug" className="mb-1 block text-sm font-semibold text-ink">
                  Slug
                </label>
                <Input
                  id="category-slug"
                  placeholder="otomatis-dari-nama"
                  aria-invalid={!!form.formState.errors.slug}
                  {...form.register("slug")}
                />
                {form.formState.errors.slug && (
                  <p role="alert" className="mt-1 text-xs text-danger">
                    {form.formState.errors.slug.message}
                  </p>
                )}
              </div>

              <div>
                <p className="mb-1 text-sm font-semibold text-ink">Tipe</p>
                <div className="flex gap-2" role="radiogroup" aria-label="Tipe kategori">
                  {(["terrain", "activity"] as CategoryType[]).map((value) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={selectedType === value}
                      onClick={() => form.setValue("type", value, { shouldValidate: true })}
                      className={
                        selectedType === value
                          ? "h-10 flex-1 rounded-lg bg-primary px-3 text-sm font-semibold text-on-primary"
                          : "h-10 flex-1 rounded-lg border border-hairline bg-surface px-3 text-sm text-body hover:bg-canvas-subtle"
                      }
                    >
                      {categoryTypeLabels[value]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-1 text-sm font-semibold text-ink">Ikon</p>
                <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Ikon kategori">
                  {categoryIconOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={selectedIcon === option.value}
                      aria-label={option.label}
                      title={option.label}
                      onClick={() => form.setValue("icon", option.value)}
                      className={
                        selectedIcon === option.value
                          ? "flex h-11 items-center justify-center rounded-lg border-2 border-primary bg-canvas-subtle text-primary"
                          : "flex h-11 items-center justify-center rounded-lg border border-hairline bg-surface text-body hover:bg-canvas-subtle"
                      }
                    >
                      <CategoryIcon name={option.value} className="h-5 w-5" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="category-description"
                  className="mb-1 block text-sm font-semibold text-ink"
                >
                  Deskripsi <span className="font-normal text-body">(opsional)</span>
                </label>
                <textarea
                  id="category-description"
                  rows={3}
                  className="w-full rounded-lg border border-hairline bg-canvas-subtle px-3.5 py-2.5 text-sm text-ink placeholder:text-body focus-visible:border-border-strong focus-visible:outline-none"
                  placeholder="Deskripsi singkat kategori"
                  {...form.register("description")}
                />
              </div>
            </fieldset>

            <div className="flex justify-end gap-2 border-t border-hairline pt-4">
              <Button variant="secondary" disabled={mutation.isPending} onClick={onClose}>
                Batal
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 aria-hidden className="h-4 w-4 animate-spin" />}
                {mode.kind === "create" ? "Simpan kategori" : "Simpan perubahan"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
