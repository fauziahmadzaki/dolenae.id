import {
  statusLabels,
  surfaceLabels,
  type RouteSurface,
  type TrailRouteStatus,
} from "../schema";
import { STATUS_SAMPLES, SURFACE_SAMPLES } from "../style";

function LineSample({
  color,
  dashArray,
  weight = 3,
}: {
  color: string;
  dashArray?: string;
  weight?: number;
}) {
  return (
    <svg width={28} height={10} aria-hidden className="shrink-0">
      <line
        x1={1}
        y1={5}
        x2={27}
        y2={5}
        stroke={color}
        strokeWidth={weight}
        strokeDasharray={dashArray}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Legend for trail surfaces (colour/pattern) and conditions (dash/colour). */
export function RouteLegend({ className }: { className?: string }) {
  return (
    <div
      className={
        "space-y-2 rounded-lg border border-hairline bg-surface p-3 text-xs text-body " +
        (className ?? "")
      }
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <span className="font-semibold text-ink">Jenis jalur</span>
        {SURFACE_SAMPLES.map((sample) => (
          <span key={sample.value} className="flex items-center gap-1.5">
            <LineSample color={sample.color} dashArray={sample.dashArray} />
            {sample.value === "campuran"
              ? "Campuran"
              : surfaceLabels[sample.value as RouteSurface]}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <span className="font-semibold text-ink">Status</span>
        {STATUS_SAMPLES.map((sample) => (
          <span key={sample.value} className="flex items-center gap-1.5">
            <LineSample color={sample.color} dashArray={sample.dashArray} />
            {statusLabels[sample.value as TrailRouteStatus]}
          </span>
        ))}
      </div>
    </div>
  );
}
