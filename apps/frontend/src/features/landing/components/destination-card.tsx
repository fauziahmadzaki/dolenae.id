import { MountainSnow } from "lucide-react";
import { cn } from "~/lib/cn";
import { difficultyStyles, type Destination } from "~/features/landing/data";

export function DestinationCard({ destination: d }: { destination: Destination }) {
  return (
    <article className="overflow-hidden rounded-xl border border-hairline bg-canvas-subtle shadow-sm">
      <div className="flex h-[200px] items-center justify-center bg-canvas">
        <MountainSnow aria-hidden className="size-10 text-primary" strokeWidth={1.5} />
      </div>
      <div className="flex flex-col gap-2 p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-xl leading-7 font-bold text-ink">{d.name}</h3>
          <span
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
              difficultyStyles[d.difficulty],
            )}
          >
            {d.difficulty}
          </span>
        </div>
        <p className="text-sm text-body">{d.meta}</p>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm font-semibold text-ink">{d.price}</span>
          <span className="text-xs text-body">
            {d.tag}
          </span>
        </div>
      </div>
    </article>
  );
}
