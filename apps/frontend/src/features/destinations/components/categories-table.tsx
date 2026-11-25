"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DataTable,
  type DataTableColumn,
  type DataTableFilter,
  type SortOption,
  type SortState,
} from "~/components/ui/data-table";
import { formatRelativeId } from "~/lib/format-date";
import { DEFAULT_PAGE_SIZE } from "~/lib/pagination";
import type { Category } from "~/types/domain";
import { CategoryIcon } from "../category-icon";

const SORT_OPTIONS: SortOption[] = [
  { value: "name:asc", label: "Nama A–Z" },
  { value: "name:desc", label: "Nama Z–A" },
  { value: "updatedAt:desc", label: "Terbaru diubah" },
  { value: "count:desc", label: "Destinasi terbanyak" },
];

interface CategoriesTableProps {
  categories: Category[];
  counts: Map<string, number>;
  isLoading: boolean;
  onCreate: () => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

/** Table view for destination categories aligned with Figma #292:6171. */
export function CategoriesTable({
  categories,
  counts,
  isLoading,
  onCreate,
  onEdit,
  onDelete,
}: CategoriesTableProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sort, setSort] = useState<SortState>({ sort: "name", order: "asc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const rows = categories.filter((category) => {
      if (typeFilter && category.type !== typeFilter) return false;
      if (!query) return true;
      return (
        category.name.toLowerCase().includes(query) ||
        category.slug.toLowerCase().includes(query)
      );
    });

    return [...rows].sort((a, b) => {
      const dir = sort.order === "asc" ? 1 : -1;
      if (sort.sort === "count") {
        return ((counts.get(a.id) ?? 0) - (counts.get(b.id) ?? 0)) * dir;
      }
      if (sort.sort === "updatedAt") {
        return (Date.parse(a.updatedAt) - Date.parse(b.updatedAt)) * dir;
      }
      return a.name.localeCompare(b.name, "id") * dir;
    });
  }, [categories, counts, search, typeFilter, sort]);

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const filters: DataTableFilter[] = [
    {
      key: "type",
      label: "Tipe",
      value: typeFilter,
      allLabel: "Semua tipe",
      options: [
        { value: "terrain", label: "Terrain" },
        { value: "activity", label: "Aktivitas" },
      ],
      onChange: (value) => {
        setTypeFilter(value);
        setPage(1);
      },
    },
  ];

  const columns: DataTableColumn<Category>[] = [
    {
      id: "name",
      header: "Kategori",
      sortKey: "name",
      cell: (category) => (
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-canvas-subtle text-primary">
            <CategoryIcon name={category.icon} className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">{category.name}</p>
            <p className="truncate text-xs text-body">/{category.slug}</p>
          </div>
        </div>
      ),
    },
    {
      id: "type",
      header: "Tipe",
      cell: (category) => (
        <span className="rounded-full border border-hairline bg-canvas-subtle px-2.5 py-0.5 text-[11px] font-semibold text-ink">
          {category.type === "terrain" ? "Terrain" : "Aktivitas"}
        </span>
      ),
    },
    {
      id: "count",
      header: "Jumlah",
      sortKey: "count",
      className: "whitespace-nowrap text-body",
      cell: (category) => `${counts.get(category.id) ?? 0} destinasi`,
    },
    {
      id: "updatedAt",
      header: "Diperbarui",
      sortKey: "updatedAt",
      className: "whitespace-nowrap text-xs text-body",
      cell: (category) => formatRelativeId(category.updatedAt),
    },
    {
      id: "actions",
      header: "Aksi",
      align: "right",
      cell: (category) => (
        <div className="inline-flex gap-1">
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
      ),
    },
  ];

  return (
    <DataTable
      data={pageRows}
      columns={columns}
      getRowId={(category) => category.id}
      page={page}
      pageSize={pageSize}
      total={filtered.length}
      sort={sort}
      search={search}
      onPageChange={setPage}
      onPageSizeChange={(size) => {
        setPageSize(size);
        setPage(1);
      }}
      onSortChange={(next) => {
        setSort(next);
        setPage(1);
      }}
      onSearchChange={(value) => {
        setSearch(value);
        setPage(1);
      }}
      sortOptions={SORT_OPTIONS}
      filters={filters}
      searchPlaceholder="Cari kategori"
      itemLabel="kategori"
      isLoading={isLoading}
      minWidthClassName="min-w-[720px]"
      emptyState={
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
      }
    />
  );
}
