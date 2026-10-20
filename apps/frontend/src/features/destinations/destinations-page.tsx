"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Loader2,
  Mountain,
  Pencil,
  Plus,
  Rows3,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "~/components/ui/dialog";
import { del, get } from "~/lib/api/client";
import { ApiError } from "~/lib/api/types";
import { useAuth } from "~/features/auth/hooks/use-auth";
import { cn } from "~/lib/cn";
import type { Category, Destination } from "~/types/domain";
import { CategoryDialog } from "./category-dialog";
import { CategoryIcon } from "./category-icon";
import {
  difficultyLabels,
  difficultyOptions,
  statusLabels,
  statusOptions,
} from "./schema";

type Tab = "destinasi" | "kategori";
type View = "table" | "card";
type CategoryMode =
  | { kind: "create" }
  | { kind: "edit" | "delete"; category: Category };

const message = (error: unknown) =>
  error instanceof Error ? error.message : "Permintaan gagal. Silakan coba lagi.";

const statusClass: Record<Destination["status"], string> = {
  published: "bg-success/10 text-success",
  draft: "bg-warning/10 text-warning",
  archived: "bg-surface-2 text-body",
};

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

  const enabled = auth.hydrated && !!auth.token && auth.user?.role === "admin";

  const params = new URLSearchParams({
    page: String(page),
    limit: "8",
    sort: "createdAt",
    order: "desc",
  });
  if (search.trim()) params.set("search", search.trim());
  if (difficulty) params.set("difficulty", difficulty);
  if (status) params.set("status", status);
  if (categoryId) params.set("categoryId", categoryId);

  const categories = useQuery({
    queryKey: ["categories", "all"],
    queryFn: ({ signal }) => get<Category[]>("/categories?limit=100&sort=name", { signal }),
    enabled,
    retry: false,
  });

  const list = useQuery({
    queryKey: ["destinations", page, search, difficulty, status, categoryId],
    queryFn: ({ signal }) => get<Destination[]>(`/destinations?${params}`, { signal }),
    enabled,
    retry: false,
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
  }, [list.error, categories.error, auth.logout, cache, router]);

  const total = Number(list.data?.meta?.total ?? 0);
  const totalPages = Number(list.data?.meta?.totalPages ?? 1);
  useEffect(() => {
    if (list.data && page > totalPages) setPage(totalPages);
  }, [list.data, page, totalPages]);

  const remove = useMutation({
    mutationFn: (destination: Destination) =>
      del(`/destinations/${destination.id}`, { token: auth.token ?? undefined }),
    onSuccess: () => {
      setDeleteTarget(null);
      setNotice("Destinasi berhasil dihapus.");
      cache.invalidateQueries({ queryKey: ["destinations"] });
    },
  });

  const invalidate = (text: string) => {
    setCategoryMode(null);
    setNotice(text);
    cache.invalidateQueries({ queryKey: ["categories"] });
    cache.invalidateQueries({ queryKey: ["destinations"] });
  };

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
        <h2 className="font-display text-xl font-bold text-ink">Akses ditolak</h2>
        <p className="mt-1 text-sm text-body">Halaman ini hanya untuk admin.</p>
        <Link href="/" className="mt-3 inline-block text-sm font-semibold text-primary underline">
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

  return (
    <div className="space-y-6">
      {/* Page head + tabs */}
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
              <div className="flex gap-1 rounded-lg bg-surface-2 p-1" role="group" aria-label="Tampilan">
                {(
                  [
                    ["table", Rows3, "Tabel"],
                    ["card", LayoutGrid, "Card"],
                  ] as const
                ).map(([value, Icon, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={view === value}
                    onClick={() => setView(value)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold",
                      view === value ? "bg-surface text-ink shadow-sm" : "text-body",
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
        <div className="flex gap-6" role="tablist" aria-label="Destinasi dan kategori">
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
            <p role="status" className="text-sm text-body">Memuat kategori…</p>
          ) : categories.isError ? (
            <div role="alert" className="rounded-lg border border-hairline bg-surface p-6">
              <p className="text-sm text-danger">{message(categories.error)}</p>
              <Button variant="secondary" className="mt-3" onClick={() => categories.refetch()}>
                Coba lagi
              </Button>
            </div>
          ) : categoryList.length === 0 ? (
            <div className="rounded-lg border border-dashed border-hairline bg-surface p-10 text-center">
              <h3 className="font-display font-semibold text-ink">Belum ada kategori</h3>
              <p className="mt-1 text-sm text-body">
                Tambahkan kategori terrain atau aktivitas untuk mengklasifikasikan destinasi.
              </p>
              <Button className="mt-4" onClick={() => setCategoryMode({ kind: "create" })}>
                <Plus aria-hidden className="h-4 w-4" />
                Tambah kategori
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {categoryList.map((category) => (
                <article
                  key={category.id}
                  className="flex items-start gap-3 rounded-xl border border-hairline bg-surface p-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-canvas-subtle text-primary">
                    <CategoryIcon name={category.icon} className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-semibold text-ink">{category.name}</h3>
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
                      onClick={() => setCategoryMode({ kind: "edit", category })}
                      className="rounded-md p-2 text-body hover:bg-surface-2 hover:text-ink"
                    >
                      <Pencil aria-hidden className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Hapus ${category.name}`}
                      onClick={() => setCategoryMode({ kind: "delete", category })}
                      className="rounded-md p-2 text-body hover:bg-danger/10 hover:text-danger"
                    >
                      <Trash2 aria-hidden className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section aria-label="Daftar destinasi" className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex h-10 w-full items-center gap-2 rounded-lg border border-hairline bg-surface px-3 sm:w-72">
              <Search aria-hidden className="h-4 w-4 shrink-0 text-body" />
              <span className="sr-only">Cari destinasi</span>
              <input
                type="search"
                placeholder="Cari destinasi"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-body focus:outline-none"
              />
            </label>
            <select
              aria-label="Filter kesulitan"
              value={difficulty}
              onChange={(event) => {
                setDifficulty(event.target.value);
                setPage(1);
              }}
              className="h-10 rounded-lg border border-hairline bg-surface px-3 text-sm text-ink"
            >
              <option value="">Semua kesulitan</option>
              {difficultyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className="h-10 rounded-lg border border-hairline bg-surface px-3 text-sm text-ink"
            >
              <option value="">Semua status</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter kategori"
              value={categoryId}
              onChange={(event) => {
                setCategoryId(event.target.value);
                setPage(1);
              }}
              className="h-10 rounded-lg border border-hairline bg-surface px-3 text-sm text-ink"
            >
              <option value="">Semua kategori</option>
              {categoryList.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <span className="ml-auto text-sm text-body" aria-live="polite">
              {total} destinasi
            </span>
          </div>

          {list.isPending ? (
            <p role="status" className="text-sm text-body">Memuat destinasi…</p>
          ) : list.isError ? (
            <div role="alert" className="rounded-lg border border-hairline bg-surface p-6">
              <p className="text-sm text-danger">{message(list.error)}</p>
              <Button variant="secondary" className="mt-3" onClick={() => list.refetch()}>
                Coba lagi
              </Button>
            </div>
          ) : destinations.length === 0 ? (
            <div className="rounded-lg border border-dashed border-hairline bg-surface p-10 text-center">
              <h3 className="font-display font-semibold text-ink">Belum ada destinasi</h3>
              <p className="mt-1 text-sm text-body">
                Mulai dengan menambahkan destinasi pertama atau ubah filter pencarian.
              </p>
              <Button className="mt-4" onClick={() => router.push("/admin/destinasi/baru")}>
                <Plus aria-hidden className="h-4 w-4" />
                Tambah destinasi
              </Button>
            </div>
          ) : view === "table" ? (
            <div className="overflow-x-auto rounded-xl border border-hairline bg-surface">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead className="h-12 bg-surface-2 text-[11px] uppercase tracking-wide text-body">
                  <tr>
                    {["Destinasi", "Provinsi", "Kategori", "Kesulitan", "Status", "Aksi"].map(
                      (heading) => (
                        <th key={heading} scope="col" className="px-5 font-semibold">
                          {heading}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {destinations.map((destination) => (
                    <tr
                      key={destination.id}
                      className="h-16 border-t border-hairline align-middle"
                    >
                      <td className="px-5">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-canvas-subtle text-primary">
                            {destination.images[0] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={destination.images[0]}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Mountain aria-hidden className="h-5 w-5" />
                            )}
                          </span>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/destinasi/${destination.id}/edit`}
                              className="block truncate font-semibold text-ink hover:underline"
                            >
                              {destination.name}
                            </Link>
                            <span className="block truncate text-xs text-body">
                              /{destination.slug}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 text-body">{destination.location.province ?? "—"}</td>
                      <td className="px-5">
                        <div className="flex max-w-[220px] flex-wrap gap-1">
                          {destination.categoryIds.length === 0 ? (
                            <span className="text-xs text-body">—</span>
                          ) : (
                            destination.categoryIds.slice(0, 3).map((id) => (
                              <span
                                key={id}
                                className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-ink"
                              >
                                {categoryName(id)}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink">
                          <span
                            aria-hidden
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              destination.difficulty === "sulit"
                                ? "bg-danger"
                                : destination.difficulty === "menengah"
                                  ? "bg-warning"
                                  : "bg-success",
                            )}
                          />
                          {difficultyLabels[destination.difficulty]}
                        </span>
                      </td>
                      <td className="px-5">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                            statusClass[destination.status],
                          )}
                        >
                          {statusLabels[destination.status]}
                        </span>
                      </td>
                      <td className="px-5">
                        <div className="flex gap-1">
                          <Link
                            href={`/admin/destinasi/${destination.id}/edit`}
                            aria-label={`Edit ${destination.name}`}
                            className="rounded-md p-2 text-body hover:bg-surface-2 hover:text-ink"
                          >
                            <Pencil aria-hidden className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            aria-label={`Hapus ${destination.name}`}
                            onClick={() => setDeleteTarget(destination)}
                            className="rounded-md p-2 text-body hover:bg-danger/10 hover:text-danger"
                          >
                            <Trash2 aria-hidden className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {destinations.map((destination) => (
                <article
                  key={destination.id}
                  className="overflow-hidden rounded-xl border border-hairline bg-surface"
                >
                  <div className="relative h-36 bg-canvas-subtle">
                    {destination.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={destination.images[0]}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-primary/60">
                        <Mountain aria-hidden className="h-10 w-10" />
                      </div>
                    )}
                    <span
                      className={cn(
                        "absolute left-3 top-3 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        statusClass[destination.status],
                      )}
                    >
                      {statusLabels[destination.status]}
                    </span>
                  </div>
                  <div className="space-y-2 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display font-semibold text-ink">
                        {destination.name}
                      </h3>
                      <span className="shrink-0 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-body">
                        {difficultyLabels[destination.difficulty]}
                      </span>
                    </div>
                    <p className="text-xs text-body">
                      {destination.location.regency ?? "Lokasi belum diisi"} ·{" "}
                      {destination.elevationMeters
                        ? `${destination.elevationMeters} mdpl`
                        : "Ketinggian belum diisi"}
                    </p>
                    <p className="text-xs text-body">
                      {destination.categoryIds.length} kategori ·{" "}
                      {destination.facilities.length} fasilitas
                    </p>
                    <div className="flex justify-end gap-1 border-t border-hairline pt-2">
                      <Link
                        href={`/admin/destinasi/${destination.id}/edit`}
                        className="rounded-md p-2 text-body hover:bg-surface-2 hover:text-ink"
                        aria-label={`Edit ${destination.name}`}
                      >
                        <Pencil aria-hidden className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        aria-label={`Hapus ${destination.name}`}
                        onClick={() => setDeleteTarget(destination)}
                        className="rounded-md p-2 text-body hover:bg-danger/10 hover:text-danger"
                      >
                        <Trash2 aria-hidden className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!list.isError && (
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-body">
              <p>
                Menampilkan {total ? (page - 1) * 8 + 1 : 0}–
                {Math.min(page * 8, total)} dari {total} destinasi
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
          key={categoryMode.kind + ("category" in categoryMode ? categoryMode.category.id : "")}
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
        <Dialog open onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <DialogContent className="w-[420px]">
            <DialogTitle>Hapus destinasi</DialogTitle>
            <DialogDescription>
              Hapus {deleteTarget.name}? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
            {remove.isError && (
              <p role="alert" className="text-sm text-danger">
                {message(remove.error)}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                disabled={remove.isPending}
                onClick={() => setDeleteTarget(null)}
              >
                Batal
              </Button>
              <Button
                className="bg-danger hover:bg-danger/90"
                disabled={remove.isPending}
                onClick={() => remove.mutate(deleteTarget)}
              >
                {remove.isPending && (
                  <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
                )}
                Hapus permanen
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
