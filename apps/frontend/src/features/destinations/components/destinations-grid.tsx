import { Mountain } from "lucide-react";
import type { Destination } from "~/types/domain";
import { difficultyLabels } from "../schema";
import { DestinationRowActions } from "./destination-row-actions";
import { DestinationStatusBadge } from "./destination-status-badge";

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
            <DestinationStatusBadge
              status={destination.status}
              className="absolute left-3 top-3"
            />
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
            <div className="flex justify-end border-t border-hairline pt-2">
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
