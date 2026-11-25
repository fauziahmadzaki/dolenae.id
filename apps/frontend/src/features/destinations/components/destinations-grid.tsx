import Link from "next/link";
import { MapPin, Mountain, Pencil } from "lucide-react";
import { cn } from "~/lib/cn";
import type { Destination } from "~/types/domain";
import { difficultyLabels } from "../schema";
import { DestinationRowActions } from "./destination-row-actions";
import { DestinationStatusBadge } from "./destination-status-badge";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

interface DestinationsGridProps {
  destinations: Destination[];
  onDelete: (destination: Destination) => void;
}

export function DestinationsGrid({
  destinations,
  onDelete,
}: DestinationsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {destinations.map((destination) => (
        <article
          key={destination.id}
          className="flex flex-col overflow-hidden rounded-2xl border border-hairline bg-surface"
        >
          <div className="relative h-44 bg-canvas-subtle">
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
            <DestinationStatusBadge
              status={destination.status}
              className="absolute left-3 top-3"
            />
            <Link
              href={`/admin/destinasi/${destination.id}/edit`}
              aria-label={`Edit ${destination.name}`}
              className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-full border border-hairline bg-surface/95 text-ink shadow-xs transition-colors hover:bg-surface"
            >
              <Pencil aria-hidden className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="flex flex-1 flex-col gap-2.5 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-full border border-hairline bg-canvas-subtle px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-body">
                {destination.categoryIds.length} kategori
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink">
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
            </div>
            <h3 className="font-display text-base font-semibold text-ink">
              <Link
                href={`/admin/destinasi/${destination.id}/edit`}
                className="hover:underline"
              >
                {destination.name}
              </Link>
            </h3>
            <p className="flex items-center gap-1.5 text-xs text-body">
              <MapPin aria-hidden className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="truncate">
                {destination.location.regency ?? "Lokasi belum diisi"} ·{" "}
                {destination.elevationMeters
                  ? `${destination.elevationMeters} mdpl`
                  : "Ketinggian belum diisi"}
              </span>
            </p>
            <div className="mt-auto flex items-center justify-between gap-2 border-t border-hairline pt-2.5">
              <span className="text-[11px] text-body">
                Diperbarui {dateFormatter.format(new Date(destination.updatedAt))}
              </span>
              <DestinationRowActions
                destination={destination}
                onDelete={onDelete}
              />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
