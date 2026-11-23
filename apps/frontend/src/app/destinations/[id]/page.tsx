import Link from "next/link";
import { notFound } from "next/navigation";
import { Bed, Car, ExternalLink, MapPin, Utensils } from "lucide-react";
import { z } from "zod";
import { difficultyLabels } from "~/features/destinations/schema";
import { categoryLabels, type Facility } from "~/features/facilities/types";
import { CatalogMedia } from "~/features/public/catalog-media";
import { container, PublicShell } from "~/features/public/page-shell";
import { get } from "~/lib/api/server";
import { ApiError } from "~/lib/api/types";
import type { DestinationDetail } from "~/types/domain";

const facilityIcons = { accommodation: Bed, transport: Car, food: Utensils };
const numbers = new Intl.NumberFormat("id-ID");

export default async function DestinationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const [destination, facilities] = await Promise.all([
    get<DestinationDetail>(`/destinations/${id}`).then((result) => result.data).catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 404) notFound();
      return null;
    }),
    get<Facility[]>(`/destinations/${id}/facilities?limit=6`).then((result) => result.data).catch(() => null),
  ]);

  if (!destination) {
    return (
      <PublicShell compactFooter>
        <div className={`${container} space-y-4 py-12`}>
          <h1 className="text-2xl font-bold">Destinasi belum bisa dimuat</h1>
          <a href={`/destinations/${id}`} className="font-semibold text-primary underline">Coba lagi</a>
        </div>
      </PublicShell>
    );
  }

  const { name, location, access, bestSeason, elevationMeters, guideRequired } = destination;
  const place = [location.regency, location.province].filter(Boolean).join(", ");
  const elevation = elevationMeters == null ? null : `${numbers.format(elevationMeters)} mdpl`;
  const { latitude: lat, longitude: lon } = location;
  const hasLocation = lat != null && lon != null;
  const mapUrl = hasLocation ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=14/${lat}/${lon}` : null;
  const mapEmbed = hasLocation
    ? `https://www.openstreetmap.org/export/embed.html?${new URLSearchParams({ bbox: [lon - 0.025, lat - 0.012, lon + 0.025, lat + 0.012].join(","), layer: "mapnik", marker: `${lat},${lon}` })}`
    : null;

  return (
    <PublicShell compactFooter>
      <CatalogMedia src={destination.images[0]} className="h-[220px] bg-primary text-canvas sm:h-[360px] [&>div:nth-child(2)]:bg-primary-hover" />
      <section className="bg-canvas-subtle">
        <div className={`${container} space-y-3 py-8`}>
          <nav aria-label="Breadcrumb" className="text-[13px]">
            <Link href="/destinations" className="hover:underline">Destinasi</Link>
            <span aria-hidden className="mx-2">›</span>
            <span aria-current="page" className="font-semibold text-ink">{name}</span>
          </nav>
          <h1 className="text-[32px] leading-10 font-extrabold">{name}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <p>{[elevation, place].filter(Boolean).join(" · ")}</p>
            <span className="rounded-full bg-canvas px-3 py-1 text-xs font-medium text-primary">{difficultyLabels[destination.difficulty]}</span>
          </div>
        </div>
      </section>
      <div className={`${container} grid gap-10 py-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]`}>
        <div className="space-y-8">
          {(destination.description || destination.tagline) && (
            <section className="space-y-3">
              <h2 className="text-xl font-bold">Tentang</h2>
              <p className="leading-6 whitespace-pre-line">{destination.description || destination.tagline}</p>
            </section>
          )}
          <section className="space-y-3">
            <h2 className="text-xl font-bold">Akses</h2>
            <p>{access.description || "Informasi akses belum tersedia."}</p>
            {access.transport.length > 0 && (
              <ul aria-label="Pilihan transportasi" className="flex flex-wrap gap-2">
                {access.transport.map((item) => <li key={item} className="rounded-full border border-hairline bg-canvas-subtle px-3.5 py-1.5 text-sm">{item}</li>)}
              </ul>
            )}
            <p className="text-sm">{[access.duration, access.distanceKm == null ? null : `${numbers.format(access.distanceKm)} km`].filter(Boolean).join(" · ")}</p>
          </section>
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-bold">Lokasi</h2>
              {mapUrl && <a href={mapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">Buka di peta <ExternalLink aria-hidden className="size-4" /></a>}
            </div>
            {mapEmbed && <iframe title={`Peta lokasi ${name}`} src={mapEmbed} loading="lazy" className="h-72 w-full rounded-xl border border-hairline bg-canvas-subtle" />}
            <p className="flex items-center gap-2 text-sm"><MapPin aria-hidden className="size-4 shrink-0" />{location.accessPoint ? `Titik akses: ${location.accessPoint}` : place || "Lokasi belum tersedia."}</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-xl font-bold">Fasilitas sekitar</h2>
            {!facilities ? <p>Fasilitas belum bisa dimuat.</p> : !facilities.length ? <p>Belum ada fasilitas terdaftar.</p> : (
              <ul className="space-y-2">
                {facilities.map((facility) => {
                  const Icon = facilityIcons[facility.category];
                  return (
                    <li key={facility.id} className="flex items-center gap-3 rounded-xl border border-hairline bg-canvas-subtle p-4">
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-canvas text-primary"><Icon aria-hidden className="size-5" /></span>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-sans font-semibold">{facility.name}</h3>
                        <p className="text-sm">{categoryLabels[facility.category]}{facility.priceMin != null ? ` · Rp ${numbers.format(facility.priceMin)}` : ""}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
        <aside className="space-y-4">
          <section className="space-y-3 rounded-xl border border-hairline bg-canvas-subtle p-5">
            <h2 className="text-xl font-bold">Info kunjungan</h2>
            <dl className="space-y-3 border-t border-hairline pt-4 text-sm">
              {elevation && <div className="flex justify-between gap-4"><dt>Ketinggian</dt><dd className="text-right font-semibold text-ink">{elevation}</dd></div>}
              {bestSeason.length > 0 && <div className="flex justify-between gap-4"><dt>Musim terbaik</dt><dd className="text-right font-semibold text-ink">{bestSeason.join(", ")}</dd></div>}
              <div className="flex justify-between gap-4"><dt>Pemandu</dt><dd className="font-semibold text-ink">{guideRequired ? "Wajib" : "Tidak wajib"}</dd></div>
            </dl>
          </section>
          <section className="space-y-2 rounded-xl border border-hairline bg-canvas-subtle p-5">
            <h2 className="font-sans font-semibold">Butuh bantuan akses?</h2>
            <p className="text-sm">Temukan panduan persiapan perjalanan Dolenae.</p>
            <Link href="/bantuan" className="inline-block text-sm font-semibold text-primary hover:underline">Buka panduan</Link>
          </section>
        </aside>
      </div>
    </PublicShell>
  );
}
