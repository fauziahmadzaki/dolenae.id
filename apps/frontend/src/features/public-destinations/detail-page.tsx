import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Compass,
  ExternalLink,
  Footprints,
  MapPin,
  Mountain,
  Route,
  ShieldCheck,
  Ticket,
} from "lucide-react";

import { container } from "~/features/public/page-shell";
import type { DestinationDetail, Difficulty } from "~/types/domain";

const difficultyLabel: Record<Difficulty, string> = {
  "ramah-pemula": "Ramah pemula",
  menengah: "Menengah",
  sulit: "Sulit",
};

const difficultyStyle: Record<Difficulty, string> = {
  "ramah-pemula": "bg-success/15 text-success",
  menengah: "bg-warning/15 text-warning",
  sulit: "bg-danger/15 text-danger",
};

function locationLabel(destination: DestinationDetail): string {
  return (
    [
      destination.location.district,
      destination.location.regency,
      destination.location.province,
    ]
      .filter(Boolean)
      .join(", ") || "Lokasi belum tersedia"
  );
}

function elevationLabel(destination: DestinationDetail): string {
  return destination.elevationMeters
    ? `${destination.elevationMeters.toLocaleString("id-ID")} mdpl`
    : "Belum tersedia";
}

function coordinateLabel(destination: DestinationDetail): string {
  const { latitude, longitude } = destination.location;
  if (latitude == null || longitude == null) return "Belum tersedia";
  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
}

/** Halaman detail destinasi publik (server component). */
export function DestinationDetailPage({
  destination,
}: {
  destination: DestinationDetail;
}) {
  const heroImage = destination.images[0];
  const mapsUrl =
    destination.location.latitude != null &&
    destination.location.longitude != null
      ? `https://www.google.com/maps?q=${destination.location.latitude},${destination.location.longitude}`
      : null;

  return (
    <>
      <section className="bg-primary text-on-primary">
        <div
          className={`${container} grid gap-10 py-14 lg:grid-cols-[1.15fr_1fr] lg:items-center`}
        >
          <div className="flex flex-col gap-5">
            <Link
              href="/destinations"
              className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-on-primary/80 transition-colors hover:text-on-primary"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Semua destinasi
            </Link>

            <div className="flex flex-wrap items-center gap-2">
              {destination.terrain.map((terrain) => (
                <span
                  key={terrain}
                  className="rounded-full bg-on-primary/10 px-3 py-1 text-xs font-semibold text-on-primary"
                >
                  {terrain}
                </span>
              ))}
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${difficultyStyle[destination.difficulty]}`}
              >
                {difficultyLabel[destination.difficulty]}
              </span>
              {destination.verified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-on-primary/10 px-3 py-1 text-xs font-semibold text-on-primary">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                  Terverifikasi
                </span>
              ) : null}
            </div>

            <h1 className="font-display text-4xl font-extrabold leading-tight sm:text-5xl">
              {destination.name}
            </h1>
            {destination.tagline ? (
              <p className="max-w-xl text-lg text-on-primary/80">
                {destination.tagline}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-on-primary/80">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                {locationLabel(destination)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Mountain className="h-4 w-4 shrink-0" aria-hidden />
                {elevationLabel(destination)}
              </span>
              {destination.access.duration ? (
                <span className="inline-flex items-center gap-1.5">
                  <Route className="h-4 w-4 shrink-0" aria-hidden />
                  {destination.access.duration}
                </span>
              ) : null}
            </div>
          </div>

          <div className="relative h-72 overflow-hidden rounded-xl bg-primary-hover lg:h-96">
            {heroImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={heroImage}
                alt={destination.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-on-primary/40">
                <Mountain className="h-16 w-16" aria-hidden />
              </div>
            )}
          </div>
        </div>
      </section>

      <main
        id="main-content"
        className={`${container} grid gap-10 py-12 lg:grid-cols-[2fr_1fr]`}
      >
        <div className="flex flex-col gap-8">
          <section className="rounded-xl border border-hairline bg-surface p-6">
            <h2 className="font-display text-2xl font-bold text-ink">
              Tentang destinasi
            </h2>
            <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-body">
              {destination.description ?? "Deskripsi destinasi belum tersedia."}
            </p>
            {destination.bestSeason.length > 0 ? (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
                  <CalendarDays className="h-4 w-4" aria-hidden />
                  Musim terbaik
                </span>
                {destination.bestSeason.map((season) => (
                  <span
                    key={season}
                    className="rounded-full bg-canvas-subtle px-3 py-1 text-xs font-medium text-body"
                  >
                    {season}
                  </span>
                ))}
              </div>
            ) : null}
          </section>

          <section className="rounded-xl border border-hairline bg-surface p-6">
            <h2 className="font-display text-2xl font-bold text-ink">
              Lokasi & akses
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <InfoTile
                icon={<MapPin className="h-4 w-4" aria-hidden />}
                label="Wilayah"
                value={locationLabel(destination)}
              />
              <InfoTile
                icon={<Compass className="h-4 w-4" aria-hidden />}
                label="Titik akses"
                value={destination.location.accessPoint ?? "Belum tersedia"}
              />
              <InfoTile
                icon={<Route className="h-4 w-4" aria-hidden />}
                label="Jarak"
                value={
                  destination.access.distanceKm != null
                    ? `${destination.access.distanceKm.toLocaleString("id-ID")} km dari kota terdekat`
                    : "Belum tersedia"
                }
              />
              <InfoTile
                icon={<Footprints className="h-4 w-4" aria-hidden />}
                label="Waktu tempuh"
                value={destination.access.duration ?? "Belum tersedia"}
              />
            </div>

            {destination.access.description ? (
              <p className="mt-5 text-sm leading-relaxed text-body">
                {destination.access.description}
              </p>
            ) : null}

            {destination.access.transport.length > 0 ? (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Ticket className="h-4 w-4 text-body" aria-hidden />
                {destination.access.transport.map((transport) => (
                  <span
                    key={transport}
                    className="rounded-full border border-hairline px-3 py-1 text-xs font-medium text-body"
                  >
                    {transport}
                  </span>
                ))}
              </div>
            ) : null}
          </section>

          {destination.activities.length > 0 ? (
            <section className="rounded-xl border border-hairline bg-surface p-6">
              <h2 className="font-display text-2xl font-bold text-ink">
                Aktivitas yang cocok
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {destination.activities.map((activity) => (
                  <span
                    key={activity}
                    className="rounded-full bg-canvas-subtle px-3 py-1.5 text-sm font-medium text-body"
                  >
                    {activity}
                  </span>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="flex h-fit flex-col gap-4 rounded-xl border border-hairline bg-canvas-subtle p-6">
          <h2 className="font-display text-xl font-bold text-ink">Ringkasan</h2>
          <dl className="flex flex-col gap-3 text-sm">
            <SummaryRow label="Tingkat kesulitan" value={difficultyLabel[destination.difficulty]} />
            <SummaryRow label="Elevasi" value={elevationLabel(destination)} />
            <SummaryRow
              label="Guide"
              value={
                destination.guideRequired
                  ? "Disarankan guide lokal"
                  : "Bisa mandiri"
              }
            />
            <SummaryRow label="Koordinat" value={coordinateLabel(destination)} />
          </dl>

          {mapsUrl ? (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover"
            >
              <ExternalLink className="h-4 w-4" aria-hidden />
              Buka di peta
            </a>
          ) : null}

          <Link
            href="/destinations"
            className="inline-flex h-11 items-center justify-center rounded-full border border-border-strong px-5 text-sm font-semibold text-primary transition-colors hover:bg-surface"
          >
            Kembali ke katalog
          </Link>
        </aside>
      </main>
    </>
  );
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-hairline bg-canvas p-4">
      <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-body">
        {icon}
        {label}
      </span>
      <p className="mt-1.5 text-sm font-medium text-ink">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-hairline pb-2 last:border-none last:pb-0">
      <dt className="text-body">{label}</dt>
      <dd className="text-right font-semibold text-ink">{value}</dd>
    </div>
  );
}
