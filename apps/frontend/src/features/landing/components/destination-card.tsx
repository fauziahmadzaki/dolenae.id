import { MapPin } from "lucide-react";
import { cn } from "~/lib/cn";
import { difficultyStyles, type Destination } from "~/features/landing/data";

export function DestinationCard({ destination: d }: { destination: Destination }) {
  return (
    <article className="overflow-hidden rounded-xl border border-hairline bg-canvas-subtle shadow-sm">
      <div className="h-52 w-full overflow-hidden bg-canvas-subtle">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://picsum.photos/seed/${d.seed}/800/600`}
          alt={d.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="flex flex-col gap-2 p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-lg font-bold text-ink">{d.name}</h3>
          <span
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
              difficultyStyles[d.difficulty],
            )}
          >
            {d.difficulty}
          </span>
        </div>
        <p className="flex items-center gap-1.5 text-sm text-body">
          <MapPin className="h-4 w-4" />
          {d.meta}
        </p>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm font-semibold text-ink">{d.price}</span>
          <span className="rounded-full bg-canvas-subtle px-3 py-1 text-xs font-medium text-body">
            {d.tag}
          </span>
        </div>
      </div>
    </article>
  );
}
