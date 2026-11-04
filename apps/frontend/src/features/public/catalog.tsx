import Link from "next/link";
import { get } from "~/lib/api/server";
import { ApiError } from "~/lib/api/types";
import type { Destination, DestinationDetail } from "~/types/domain";
import type { TravelSupport } from "~/features/operations/types";
import { rupiah } from "~/features/operations/types";
import { DestinationCard } from "~/features/landing/components/destination-card";
import { SupportCards } from "~/features/landing/components/support";
import { container, PageHead, PublicShell } from "./page-shell";
import { notFound } from "next/navigation";
import { PublicTrails } from "./trails";
import { PublicFetchError } from "./fetch-error";

export async function CatalogPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = await searchParams;
  const search = typeof raw.search === "string" ? raw.search.slice(0, 160) : "";
  const difficulty = ["ramah-pemula", "menengah", "sulit"].includes(String(raw.difficulty)) ? String(raw.difficulty) : "";
  const page = Math.max(1, Math.min(10000, Math.trunc(Number(raw.page) || 1)));
  const params = new URLSearchParams({ status: "published", page: String(page), limit: "12", sort: "name", order: "asc" });
  if (search.trim()) params.set("search", search.trim());
  if (difficulty) params.set("difficulty", difficulty);
  let result;
  let error = false;
  try { result = await get<Destination[]>(`/destinations?${params}`); } catch { error = true; }
  const total = Number(result?.meta?.total ?? 0);
  const href = (next: number) => `/destinations?${new URLSearchParams({ search, difficulty, page: String(next) })}`;
  return <PublicShell><PageHead title="Jelajahi destinasi alam" description="Temukan destinasi yang telah diterbitkan dan informasi persiapannya." />
    <div className={`${container} space-y-8 py-10`}><form action="/destinations" className="flex flex-wrap items-end gap-4"><label className="flex min-w-48 flex-1 flex-col gap-2 text-sm font-semibold text-ink">Cari destinasi<input name="search" type="search" maxLength={160} defaultValue={search} placeholder="Nama atau wilayah" className="h-12 rounded-lg border border-hairline bg-surface px-4 font-normal" /></label><label className="flex flex-col gap-2 text-sm font-semibold text-ink">Kesulitan<select name="difficulty" defaultValue={difficulty} className="h-12 rounded-lg border border-hairline bg-surface px-3 font-normal"><option value="">Semua kesulitan</option><option value="ramah-pemula">Ramah pemula</option><option value="menengah">Menengah</option><option value="sulit">Sulit</option></select></label><button className="h-12 rounded-full bg-primary px-5 font-semibold text-on-primary">Cari destinasi</button></form>
      {error ? <PublicFetchError /> : <><p role="status" className="text-sm text-body">{total} destinasi · halaman {page}</p>{result?.data.length ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{result.data.map((d) => <DestinationCard key={d.id} destination={d} />)}</div> : <p className="rounded-xl border border-dashed border-hairline p-8 text-body">Belum ada destinasi yang sesuai. Coba ubah pencarian atau kesulitan.</p>}<nav aria-label="Halaman destinasi" className="flex justify-between text-sm font-semibold text-primary">{page > 1 ? <Link href={href(page - 1)} className="underline">Sebelumnya</Link> : <span />}{page * 12 < total && <Link href={href(page + 1)} className="underline">Berikutnya</Link>}</nav></>}
    </div></PublicShell>;
}
export async function DestinationPage({ id }: { id: string }) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) notFound();
  let d: DestinationDetail;
  try { d = (await get<DestinationDetail>(`/destinations/${id}`)).data; }
  catch (error) { if (error instanceof ApiError && error.status === 404) notFound(); return <PublicShell><div className={`${container} py-16`}><PublicFetchError /></div></PublicShell>; }
  if (d.status !== "published") notFound();
  let supports: TravelSupport[] | null = null;
  try { supports = (await get<TravelSupport[]>(`/destinations/${id}/supports`)).data; } catch { /* Independent section can be retried without hiding the destination. */ }
  return <PublicShell><PageHead title={d.name} description={d.tagline ?? "Informasi destinasi dan persiapan perjalanan."} />
    <div className={`${container} space-y-10 py-10`}><Link href="/destinations" className="text-sm font-semibold text-primary underline">Semua destinasi</Link>
      {d.images.length > 0 && <div className="grid gap-3 sm:grid-cols-2">{d.images.map((url, i) => <img key={url} src={url} alt={`${d.name}, foto ${i + 1}`} loading={i ? "lazy" : "eager"} className="h-64 w-full rounded-xl object-cover" />)}</div>}
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]"><section className="space-y-6"><h2 className="font-display text-2xl font-bold text-ink">Tentang destinasi</h2><p className="whitespace-pre-wrap text-body">{d.description || "Deskripsi belum tersedia."}</p><h2 className="font-display text-2xl font-bold text-ink">Akses & lokasi</h2><p className="whitespace-pre-wrap text-body">{d.access.description || "Informasi akses belum tersedia."}</p><p className="text-sm text-body">{[d.location.district, d.location.regency, d.location.province].filter(Boolean).join(", ") || "Wilayah belum tersedia"}</p>{d.location.accessPoint && <p className="text-sm text-body">Titik akses: {d.location.accessPoint}</p>}{d.access.transport.length > 0 && <p className="text-sm text-body">Moda: {d.access.transport.join(", ")}</p>}{d.access.duration && <p className="text-sm text-body">Durasi: {d.access.duration}</p>}{d.access.distanceKm != null && <p className="text-sm text-body">Jarak: {d.access.distanceKm} km</p>}{d.location.latitude != null && d.location.longitude != null && <a href={`https://www.openstreetmap.org/?mlat=${d.location.latitude}&mlon=${d.location.longitude}#map=14/${d.location.latitude}/${d.location.longitude}`} target="_blank" rel="noreferrer" className="text-sm font-semibold text-primary underline">Lihat koordinat di OpenStreetMap (tab baru)</a>}</section>
      <aside className="h-fit space-y-3 rounded-xl border border-hairline bg-surface p-6 text-sm text-body"><h2 className="font-display text-xl font-bold text-ink">Persiapan kunjungan</h2><p>Biaya masuk: {d.entryFee == null ? "Belum tersedia" : rupiah(d.entryFee)}</p><p>Kesulitan: {d.difficulty === "ramah-pemula" ? "Ramah pemula" : d.difficulty}</p><p>Ketinggian: {d.elevationMeters == null ? "Belum tersedia" : `${d.elevationMeters} mdpl`}</p><p>Pemandu: {d.guideRequired ? "Diperlukan" : "Tidak diwajibkan"}</p>{d.bestSeason.length > 0 && <p>Musim: {d.bestSeason.join(", ")}</p>}{d.facilities.length > 0 && <p>Fasilitas umum: {d.facilities.join(", ")}</p>}<p className="text-xs">Harga dan kondisi dapat berubah. Konfirmasi ke pengelola sebelum berangkat. Rencana dan checklist pribadi tersedia di aplikasi mobile.</p></aside></div>
      <section className="space-y-4"><h2 className="font-display text-2xl font-bold text-ink">Fasilitas sekitar</h2>{supports === null ? <PublicFetchError /> : supports.length ? <SupportCards supports={supports} /> : <p className="text-sm text-body">Belum ada fasilitas yang diterbitkan untuk destinasi ini.</p>}</section>
      <PublicTrails destinationId={id} />
    </div></PublicShell>;
}
