"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { container, PageHead } from "~/features/public/page-shell";
import { cn } from "~/lib/cn";
import { publicDestinationsApi, type PublicDestinationQuery } from "./api";
import { PublicDestinationCard } from "./components/public-destination-card";

const PAGE_SIZE = 12;

const difficultyOptions = [
  { value: "", label: "Semua kesulitan" },
  { value: "ramah-pemula", label: "Ramah pemula" },
  { value: "menengah", label: "Menengah" },
  { value: "sulit", label: "Sulit" },
] as const;

/** Katalog destinasi publik dengan pencarian, filter, dan pagination. */
export function CatalogPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [page, setPage] = useState(1);

  const query = useMemo<PublicDestinationQuery>(
    () => ({
      page,
      limit: PAGE_SIZE,
      search,
      difficulty: difficulty as PublicDestinationQuery["difficulty"],
      sort: "createdAt",
      order: "desc",
    }),
    [page, search, difficulty],
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["public-destinations", query],
    queryFn: ({ signal }) => publicDestinationsApi.list(query, signal),
  });

  const items = data?.data ?? [];
  const total = Number(data?.meta?.total ?? items.length);
  const totalPages = Math.max(1, Number(data?.meta?.totalPages ?? 1));
  const hasFilter = search.length > 0 || difficulty.length > 0;

  function applySearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function resetFilters() {
    setSearchInput("");
    setSearch("");
    setDifficulty("");
    setPage(1);
  }

  return (
    <>
      <PageHead
        title="Destinasi alam Indonesia"
        description="Jelajahi gunung, bukit, dan wisata alam pilihan. Saring berdasarkan tingkat kesulitan, lalu buka detail untuk melihat akses dan musim terbaiknya."
      >
        <form
          onSubmit={applySearch}
          className="mt-4 flex w-full max-w-2xl flex-col gap-3 sm:flex-row"
        >
          <label className="relative flex-1">
            <span className="sr-only">Cari destinasi</span>
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-body"
              aria-hidden
            />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Cari nama destinasi, mis. Bromo"
              className="h-12 w-full rounded-full border border-border-strong bg-surface pl-11 pr-4 text-sm text-ink outline-none transition-colors focus:border-primary"
            />
          </label>
          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover"
          >
            Cari
          </button>
        </form>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-2 text-sm text-body">
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
            <span className="sr-only">Filter kesulitan</span>
            <select
              value={difficulty}
              onChange={(event) => {
                setDifficulty(event.target.value);
                setPage(1);
              }}
              className="bg-transparent text-sm font-medium text-ink outline-none"
            >
              {difficultyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {hasFilter ? (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              <X className="h-4 w-4" aria-hidden />
              Hapus filter
            </button>
          ) : null}

          <span className="text-sm text-body">
            {total > 0 ? `${total} destinasi ditemukan` : "Belum ada hasil"}
          </span>
        </div>
      </PageHead>

      <section className={`${container} py-12`}>
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-[340px] animate-pulse rounded-xl border border-hairline bg-canvas-subtle"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-hairline bg-surface p-8 text-center">
            <h2 className="font-display text-xl font-bold text-ink">
              Katalog gagal dimuat
            </h2>
            <p className="mt-2 text-sm text-body">
              Periksa koneksi ke server Dolenae lalu coba lagi.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-5 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-on-primary hover:bg-primary-hover"
            >
              Coba lagi
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-hairline bg-surface p-10 text-center">
            <h2 className="font-display text-xl font-bold text-ink">
              Destinasi tidak ditemukan
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-body">
              Coba kata kunci lain atau hapus filter kesulitan untuk melihat
              semua destinasi yang tersedia.
            </p>
            {hasFilter ? (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-on-primary hover:bg-primary-hover"
              >
                Lihat semua destinasi
              </button>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {items.map((destination) => (
              <PublicDestinationCard
                key={destination.id}
                destination={destination}
              />
            ))}
          </div>
        )}

        {!isLoading && !isError && totalPages > 1 ? (
          <nav
            aria-label="Pagination destinasi"
            className="mt-10 flex items-center justify-center gap-3"
          >
            <button
              type="button"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={page <= 1}
              className={cn(
                "inline-flex h-10 items-center rounded-full border border-border-strong px-5 text-sm font-semibold text-primary",
                page <= 1
                  ? "cursor-not-allowed opacity-40"
                  : "hover:bg-canvas-subtle",
              )}
            >
              Sebelumnya
            </button>
            <span className="text-sm text-body">
              Halaman {page} dari {totalPages}
            </span>
            <button
              type="button"
              onClick={() =>
                setPage((value) => Math.min(totalPages, value + 1))
              }
              disabled={page >= totalPages}
              className={cn(
                "inline-flex h-10 items-center rounded-full border border-border-strong px-5 text-sm font-semibold text-primary",
                page >= totalPages
                  ? "cursor-not-allowed opacity-40"
                  : "hover:bg-canvas-subtle",
              )}
            >
              Berikutnya
            </button>
          </nav>
        ) : null}
      </section>
    </>
  );
}
