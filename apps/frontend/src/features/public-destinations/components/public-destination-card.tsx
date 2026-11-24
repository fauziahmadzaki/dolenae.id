import Link from "next/link";
import { MapPin, Mountain, ShieldCheck } from "lucide-react";

import { cn } from "~/lib/cn";
import type { Destination, Difficulty } from "~/types/domain";

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

/** Kartu destinasi untuk katalog web publik. */
export function PublicDestinationCard({
  destination,
}: {
  destination: Destination;
}) {
  const image = destination.images[0];
  const location = [destination.location.regency, destination.location.province]
    .filter(Boolean)
    .join(", ");

  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className="group block overflow-hidden rounded-xl border border-hairline bg-surface shadow-sm transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <div className="relative h-52 w-full overflow-hidden bg-canvas-subtle">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={destination.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-border-strong">
            <Mountain className="h-12 w-12" aria-hidden />
          </div>
        )}
        <span
          className={cn(
            "absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold",
            difficultyStyle[destination.difficulty],
          )}
        >
          {difficultyLabel[destination.difficulty]}
        </span>
      </div>

      <div className="flex flex-col gap-2 p-5">
        <h3 className="font-display text-lg font-bold text-ink group-hover:underline">
          {destination.name}
        </h3>
        {destination.tagline ? (
          <p className="line-clamp-2 text-sm text-body">{destination.tagline}</p>
        ) : null}
        <p className="flex items-center gap-1.5 text-sm text-body">
          <MapPin className="h-4 w-4 shrink-0" aria-hidden />
          {location || "Lokasi belum tersedia"}
        </p>
        <div className="mt-1 flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-ink">
            {destination.elevationMeters
              ? `${destination.elevationMeters.toLocaleString("id-ID")} mdpl`
              : "Elevasi belum tersedia"}
          </span>
          {destination.verified ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              Terverifikasi
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
