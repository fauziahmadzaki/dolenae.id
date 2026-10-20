"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Loader2,
  Plus,
  Rows3,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { ApiError } from "~/lib/api/types";
import { useAuth } from "~/features/auth/hooks/use-auth";
import { cn } from "~/lib/cn";
import type { Category, Destination } from "~/types/domain";
import { CategoryDialog } from "./category-dialog";
import { CategoriesGrid } from "./components/categories-grid";
import { DeleteDestinationDialog } from "./components/delete-destination-dialog";
import { DestinationsGrid } from "./components/destinations-grid";
import { DestinationsTable } from "./components/destinations-table";
import { DestinationsToolbar } from "./components/destinations-toolbar";
import {
  useCategories,
  useDeleteDestination,
  useDestinations,
} from "./hooks/use-destinations";

type Tab = "destinasi" | "kategori";
type View = "table" | "card";
type CategoryMode =
  | { kind: "create" }
  | { kind: "edit" | "delete"; category: Category };

const PAGE_SIZE = 8;

const message = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "Permintaan gagal. Silakan coba lagi.";

const VIEW_OPTIONS = [
  ["table", Rows3, "Tabel"],
  ["card", LayoutGrid, "Card"],
] as const;

export default function DestinationsPage() {
  const auth = useAuth();
  const router = useRouter();
  const cache = useQueryClient();

  const [tab, setTab] = useState<Tab>("destinasi");
  const [view, setView] = useState<View>("table");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [status, setStatus] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categoryMode, setCategoryMode] = useState<CategoryMode | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Destination | null>(null);
  const [notice, setNotice] = useState("");

  const enabled =
    auth.hydrated && !!auth.token && auth.user?.role === "admin";

  const categories = useCategories(enabled);
  const list = useDestinations(
    { page, limit: PAGE_SIZE, search, difficulty, status, categoryId },
    enabled,
  );

  const remove = useDeleteDestination({
    token: auth.token ?? undefined,
    onDeleted: () => {
      setDeleteTarget(null);
      setNotice("Destinasi berhasil dihapus.");
    },
  });

  useEffect(() => {
    if (auth.hydrated && !auth.token) router.replace("/auth/login");
  }, [auth.hydrated, auth.token, router]);

  useEffect(() => {
    const unauthorized = [list.error, categories.error].some(
      (error) => error instanceof ApiError && error.status === 401,
    );
    if (unauthorized) {
      cache.removeQueries({ queryKey: ["destinations"] });
      cache.removeQueries({ queryKey: ["categories"] });
      auth.logout();
      router.replace("/auth/login");
    }
  }, [list.error, categories.error, auth, cache, router]);

  const total = Number(list.data?.meta?.total ?? 0);
  const totalPages = Number(list.data?.meta?.totalPages ?? 1);

  useEffect(() => {
    if (list.data && page > totalPages) setPage(totalPages);
  }, [list.data, page, totalPages]);

  if (!auth.hydrated || !auth.token) {
    return (
      <p role="status" className="flex items-center gap-2 text-sm text-body">
        <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
        Memeriksa sesi…
      </p>
    );
  }

  if (auth.user?.role !== "admin") {
    return (
      <div className="rounded-xl border border-hairline bg-surface p-8">
        <h2 className="font-display text-xl font-bold text-ink">
          Akses ditolak
        </h2>
        <p className="mt-1 text-sm text-body">Halaman ini hanya untuk admin.</p>
        <Link
          href="/"
          className="mt-3 inline-block text-sm font-semibold text-primary underline"
        >
          Kembali ke beranda
        </Link>
      </div>
    );
  }

  const categoryList = categories.data?.data ?? [];
  const destinations = list.data?.data ?? [];
  const categoryName = (id: string) =>
    categoryList.find((category) => category.id === id)?.name ?? "—";

  const tabs: { value: Tab; label: string; count: number }[] = [
    { value: "destinasi", label: "Destinasi", count: total },
    { value: "kategori", label: "Kategori", count: categoryList.length },
  ];

  const invalidate = (text: string) => {
    setCategoryMode(null);
    setNotice(text);
    cache.invalidateQueries({ queryKey: ["categories"] });
    cache.invalidateQueries({ queryKey: ["destinations"] });
  };

  const resetPage = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

  const errorBox = (error: unknown, onRetry: () => void) => (
    <div
      role="alert"
      className="rounded-lg border border-hairline bg-surface p-6"
    >
      <p className="text-sm text-danger">{message(error)}</p>
      <Button variant="secondary" className="mt-3" onClick={onRetry}>
        Coba lagi
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">
            Destinasi & Kategori
          </h2>
          <p className="mt-1 text-sm text-body">
            Kelola katalog destinasi alam dan kategori klasifikasinya.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {tab === "destinasi" ? (
            <>
              <div
                className="flex gap-1 rounded-lg bg-surface-2 p-1"
                role="group"
                aria-label="Tampilan"
              >
                {VIEW_OPTIONS.map(([value, Icon, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={view === value}
                    onClick={() => setView(value)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold",
                      view === value
                        ? "bg-surface text-ink shadow-sm"
                        : "text-body",
                    )}
                  >
                    <Icon aria-hidden className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
              <Button onClick={() => router.push("/admin/destinasi/baru")}>
                <Plus aria-hidden className="h-4 w-4" />
                Tambah destinasi
              </Button>
            </>
          ) : (
            <Button onClick={() => setCategoryMode({ kind: "create" })}>
              <Plus aria-hidden className="h-4 w-4" />
              Tambah kategori
            </Button>
          )}
        </div>
      </div>

      <div className="border-b border-hairline">
        <div
          className="flex gap-6"
          role="tablist"
          aria-label="Destinasi dan kategori"
        >
          {tabs.map((item) => (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={tab === item.value}
              onClick={() => {
                setTab(item.value);
                setNotice("");
              }}
              className={cn(
                "-mb-px flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-semibold transition-colors",
                tab === item.value
                  ? "border-primary text-ink"
                  : "border-transparent text-body hover:text-ink",
              )}
            >
              {item.label}
              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-body">
                {item.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {notice && (
        <p role="status" className="text-sm font-medium text-success">
          {notice}
        </p>
      )}

      {tab === "kategori" ? (
        <section aria-label="Daftar kategori" className="space-y-4">
          {categories.isPending ? (
            <p role="status" className="text-sm text-body">
              Memuat kategori…
            </p>
          ) : categories.isError ? (
            errorBox(categories.error, () => categories.refetch())
          ) : (
            <CategoriesGrid
              categories={categoryList}
              onCreate={() => setCategoryMode({ kind: "create" })}
              onEdit={(category) => setCategoryMode({ kind: "edit", category })}
              onDelete={(category) =>
                setCategoryMode({ kind: "delete", category })
              }
            />
          )}
        </section>
      ) : (
        <section aria-label="Daftar destinasi" className="space-y-4">
          <DestinationsToolbar
            search={search}
            difficulty={difficulty}
            status={status}
            categoryId={categoryId}
            categories={categoryList}
            total={total}
            onSearchChange={resetPage(setSearch)}
            onDifficultyChange={resetPage(setDifficulty)}
            onStatusChange={resetPage(setStatus)}
            onCategoryChange={resetPage(setCategoryId)}
          />

          {list.isPending ? (
            <p role="status" className="text-sm text-body">
              Memuat destinasi…
            </p>
          ) : list.isError ? (
            errorBox(list.error, () => list.refetch())
          ) : destinations.length === 0 ? (
            <div className="rounded-lg border border-dashed border-hairline bg-surface p-10 text-center">
              <h3 className="font-display font-semibold text-ink">
                Belum ada destinasi
              </h3>
              <p className="mt-1 text-sm text-body">
                Mulai dengan menambahkan destinasi pertama atau ubah filter
                pencarian.
              </p>
              <Button
                className="mt-4"
                onClick={() => router.push("/admin/destinasi/baru")}
              >
                <Plus aria-hidden className="h-4 w-4" />
                Tambah destinasi
              </Button>
            </div>
          ) : view === "table" ? (
            <DestinationsTable
              destinations={destinations}
              categoryName={categoryName}
              onDelete={setDeleteTarget}
            />
          ) : (
            <DestinationsGrid
              destinations={destinations}
              onDelete={setDeleteTarget}
            />
          )}

          {!list.isError && (
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-body">
              <p>
                Menampilkan {total ? (page - 1) * PAGE_SIZE + 1 : 0}–
                {Math.min(page * PAGE_SIZE, total)} dari {total} destinasi
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  aria-label="Halaman sebelumnya"
                  disabled={page <= 1 || list.isFetching}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft aria-hidden className="h-4 w-4" />
                </Button>
                <span className="rounded-md bg-primary px-3 py-1.5 text-on-primary">
                  {page}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  aria-label="Halaman berikutnya"
                  disabled={page >= totalPages || list.isFetching}
                  onClick={() => setPage(page + 1)}
                >
                  <ChevronRight aria-hidden className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </section>
      )}

      {categoryMode && (
        <CategoryDialog
          key={
            categoryMode.kind +
            ("category" in categoryMode ? categoryMode.category.id : "")
          }
          mode={categoryMode}
          token={auth.token}
          onClose={() => setCategoryMode(null)}
          onSaved={invalidate}
          onUnauthorized={() => {
            auth.logout();
            router.replace("/auth/login");
          }}
        />
      )}

      {deleteTarget && (
        <DeleteDestinationDialog
          destination={deleteTarget}
          isPending={remove.isPending}
          error={remove.error}
          onClose={() => setDeleteTarget(null)}
          onConfirm={(destination) => remove.mutate(destination)}
        />
      )}
    </div>
  );
}
