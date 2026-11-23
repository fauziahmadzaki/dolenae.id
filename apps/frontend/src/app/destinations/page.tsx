import Link from "next/link";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { difficultyLabels } from "~/features/destinations/schema";
import { CatalogMedia } from "~/features/public/catalog-media";
import { container, PublicShell } from "~/features/public/page-shell";
import { get } from "~/lib/api/server";
import { cn } from "~/lib/cn";
import { pageCount } from "~/lib/pagination";
import type { Category, Destination } from "~/types/domain";

const limit = 6;
const difficulties = ["ramah-pemula", "menengah", "sulit"] as const;
const sorts = {
  terbaru: { sort: "createdAt", order: "desc", label: "Terbaru" },
  nama: { sort: "name", order: "asc", label: "Nama A–Z" },
  tertinggi: { sort: "elevationMeters", order: "desc", label: "Ketinggian" },
} as const;

const filtersSchema = z.object({
  q: z.string().trim().max(120).catch(""),
  difficulty: z.enum(difficulties).optional().catch(undefined),
  categoryId: z.uuid().optional().catch(undefined),
  sort: z.enum(["terbaru", "nama", "tertinggi"]).catch("terbaru"),
  page: z.coerce.number().int().positive().max(10000).catch(1),
});

export default async function DestinationCatalog({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const input = await searchParams;
  const filters = filtersSchema.parse(input);
  const { q, difficulty, sort, page } = filters;
  const { category } = input;
  const getCategories = () => get<Category[]>("/categories?limit=100&sort=name&order=asc").catch(() => null);
  const categoryResult = typeof category === "string" ? await getCategories() : undefined;
  const categoryId = filters.categoryId ?? categoryResult?.data.find((item) => item.slug === category)?.id;
  const query = new URLSearchParams({
    page: String(page), limit: String(limit), sort: sorts[sort].sort, order: sorts[sort].order,
  });
  if (q) query.set("search", q);
  if (difficulty) query.set("difficulty", difficulty);
  if (categoryId) query.set("categoryId", categoryId);

  const [result, categories] = await Promise.all([
    get<Destination[]>(`/destinations?${query}`).catch(() => null),
    categoryResult === undefined ? getCategories() : categoryResult,
  ]);
  const total = typeof result?.meta?.total === "number" ? result.meta.total : result?.data.length ?? 0;
  const pages = pageCount(total, limit);
  const visiblePages = Array.from({ length: Math.min(5, pages) }, (_, index) =>
    Math.min(Math.max(page - 2, 1), Math.max(pages - 4, 1)) + index,
  );

  function href(overrides: Partial<typeof filters>) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries({ ...filters, categoryId, page: 1, ...overrides })) {
      if (value && value !== 1) params.set(key, String(value));
    }
    return params.size ? `/destinations?${params}` : "/destinations";
  }

  const filterStyle = (active: boolean) => cn(
    "inline-flex h-[34px] items-center justify-center rounded-full border border-hairline px-4 text-xs font-medium whitespace-nowrap transition-colors",
    active ? "border-primary bg-primary text-on-primary" : "bg-canvas-subtle hover:bg-surface-2",
  );
  const difficultyBadgeStyles: Record<string, string> = {
    "ramah-pemula": "border border-hairline bg-canvas text-success",
    menengah: "border border-hairline bg-canvas text-warning",
    sulit: "border border-hairline bg-canvas text-danger",
  };

  return (
    <PublicShell compactFooter>
      <section className="bg-canvas-subtle">
        <div className={`${container} flex flex-col gap-5 py-10`}>
          <div>
            <h1 className="text-[32px] leading-10 font-extrabold">Jelajahi destinasi alam</h1>
            <p className="mt-2">Temukan destinasi pegunungan dan perbukitan di seluruh Indonesia.</p>
          </div>
          <form className="grid items-start gap-3 sm:grid-cols-[1fr_auto]">
            <div className="flex h-13 items-center rounded-full border border-hairline bg-surface pr-5 focus-within:ring-2 focus-within:ring-primary/25">
              <button type="submit" aria-label="Cari destinasi" className="grid size-12 shrink-0 place-items-center rounded-full hover:bg-canvas">
                <Search aria-hidden className="size-5" />
              </button>
              <input name="q" aria-label="Nama destinasi" defaultValue={q} maxLength={120} placeholder="Cari nama destinasi..." className="min-w-0 flex-1 outline-none" />
            </div>
            <details className="relative">
              <summary className="flex h-13 w-fit cursor-pointer items-center gap-2 rounded-full border border-hairline bg-surface px-5 text-sm font-semibold text-ink">
                <SlidersHorizontal aria-hidden className="size-4" /> Filter &amp; Urutkan
              </summary>
              <div className="z-10 mt-2 grid gap-3 rounded-xl border border-hairline bg-surface p-4 shadow-md sm:absolute sm:right-0 sm:w-64">
                <label className="grid gap-1 text-sm">Kesulitan
                  <select name="difficulty" defaultValue={difficulty ?? ""} className="rounded-lg border border-hairline bg-surface p-2">
                    <option value="">Semuanya</option>
                    {difficulties.map((item) => <option key={item} value={item}>{difficultyLabels[item]}</option>)}
                  </select>
                </label>
                <label className="grid gap-1 text-sm">Kategori
                  <select name="categoryId" defaultValue={categoryId ?? ""} className="rounded-lg border border-hairline bg-surface p-2">
                    <option value="">Semuanya</option>
                    {categories?.data.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                </label>
                <label className="grid gap-1 text-sm">Urutkan
                  <select name="sort" defaultValue={sort} className="rounded-lg border border-hairline bg-surface p-2">
                    {Object.entries(sorts).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
                  </select>
                </label>
                <Button type="submit">Terapkan</Button>
              </div>
            </details>
          </form>
        </div>
      </section>
      <nav aria-label="Filter cepat" className="border-y border-hairline">
        <div className={`${container} flex gap-2 overflow-x-auto py-4`}>
          <Link href={href({ difficulty: undefined, categoryId: undefined })} className={filterStyle(!difficulty && !categoryId)}>Semuanya</Link>
          <Link href={href({ difficulty: "ramah-pemula", categoryId: undefined })} className={filterStyle(difficulty === "ramah-pemula" && !categoryId)}>Ramah Pemula</Link>
          {categories?.data.slice(0, 6).map((item) => (
            <Link key={item.id} href={href({ categoryId: item.id, difficulty: undefined })} className={filterStyle(categoryId === item.id)}>{item.name}</Link>
          ))}
        </div>
      </nav>
      <section className={`${container} space-y-6 py-5 pb-10`}>
        {result ? (
          <>
            <div className="flex flex-wrap justify-between gap-2 text-sm">
              <p>Menampilkan {result.data.length} dari {total} destinasi</p>
              <p>Urutkan: <span className="font-semibold text-ink">{sorts[sort].label}</span></p>
            </div>
            {result.data.length ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {result.data.map((destination) => (
                  <Link key={destination.id} href={`/destinations/${destination.id}`} className="group block overflow-hidden rounded-2xl border border-hairline bg-canvas-subtle hover:border-border-strong">
                    <CatalogMedia src={destination.images[0]} className="h-[180px] bg-canvas text-primary" />
                    <div className="space-y-2 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="font-sans text-lg font-bold group-hover:underline">{destination.name}</h2>
                        <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", difficultyBadgeStyles[destination.difficulty] ?? "border border-hairline bg-canvas text-primary")}>{difficultyLabels[destination.difficulty]}</span>
                      </div>
                      <p className="text-sm">{[destination.elevationMeters == null ? undefined : `${destination.elevationMeters.toLocaleString("id-ID")} mdpl`, destination.location.regency ?? destination.location.province].filter(Boolean).join(" · ")}</p>
                      {destination.tagline && <p className="text-sm font-medium text-primary">{destination.tagline}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-hairline bg-surface p-6">Belum ada destinasi yang cocok.</p>
            )}
            {pages > 1 && (
              <nav aria-label="Halaman katalog" className="flex flex-wrap justify-center gap-2">
                {page > 1 && <Link href={href({ page: Math.min(page - 1, pages) })} aria-label="Halaman sebelumnya" className="inline-flex size-10 items-center justify-center rounded-full border border-hairline bg-canvas-subtle text-sm hover:bg-surface-2"><ChevronLeft className="size-4" /></Link>}
                {visiblePages.map((number) => <Link key={number} href={href({ page: number })} aria-current={page === number ? "page" : undefined} className={cn("inline-flex size-10 items-center justify-center rounded-full border border-hairline text-sm font-medium transition-colors", page === number ? "border-primary bg-primary text-on-primary" : "bg-canvas-subtle hover:bg-surface-2")}>{number}</Link>)}
                {page < pages && <Link href={href({ page: page + 1 })} aria-label="Halaman berikutnya" className="inline-flex size-10 items-center justify-center rounded-full border border-hairline bg-canvas-subtle text-sm hover:bg-surface-2"><ChevronRight className="size-4" /></Link>}
              </nav>
            )}
          </>
        ) : (
          <div className="space-y-3 rounded-xl border border-hairline bg-surface p-6">
            <p>Destinasi belum bisa dimuat.</p>
            <a href={href({ page })} className="font-semibold text-primary underline">Coba lagi</a>
          </div>
        )}
      </section>
    </PublicShell>
  );
}
