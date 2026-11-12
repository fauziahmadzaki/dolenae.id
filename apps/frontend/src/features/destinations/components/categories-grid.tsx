import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { Category } from "~/types/domain";
import { CategoryIcon } from "../category-icon";

interface CategoriesGridProps {
  categories: Category[];
  onCreate: () => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoriesGrid({
  categories,
  onCreate,
  onEdit,
  onDelete,
}: CategoriesGridProps) {
  if (categories.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-hairline bg-surface p-10 text-center">
        <h3 className="font-display font-semibold text-ink">
          Belum ada kategori
        </h3>
        <p className="mt-1 text-sm text-body">
          Tambahkan kategori terrain atau aktivitas untuk mengklasifikasikan
          destinasi.
        </p>
        <Button className="mt-4" onClick={onCreate}>
          <Plus aria-hidden className="h-4 w-4" />
          Tambah kategori
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {categories.map((category) => (
        <article
          key={category.id}
          className="flex items-start gap-3 rounded-xl border border-hairline bg-surface p-4"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-canvas-subtle text-primary">
            <CategoryIcon name={category.icon} className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-semibold text-ink">
                {category.name}
              </h3>
              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-body">
                {category.type === "terrain" ? "Terrain" : "Aktivitas"}
              </span>
            </div>
            <p className="truncate text-xs text-body">/{category.slug}</p>
            {category.description && (
              <p className="mt-1 line-clamp-2 text-xs text-body">
                {category.description}
              </p>
            )}
          </div>
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              aria-label={`Edit ${category.name}`}
              onClick={() => onEdit(category)}
              className="rounded-md p-2 text-body hover:bg-surface-2 hover:text-ink"
            >
              <Pencil aria-hidden className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={`Hapus ${category.name}`}
              onClick={() => onDelete(category)}
              className="rounded-md p-2 text-body hover:bg-danger/10 hover:text-danger"
            >
              <Trash2 aria-hidden className="h-4 w-4" />
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
