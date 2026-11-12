import type { RouteSurface, TrailRouteStatus } from "./schema";

export interface RouteLineStyle {
  color: string;
  weight: number;
  dashArray?: string;
  opacity: number;
}

const SURFACE_STYLES: Record<
  RouteSurface | "campuran",
  { color: string; weight: number; dashArray?: string }
> = {
  aspal: { color: "#1f2937", weight: 5 },
  setapak: { color: "#4b5563", weight: 3, dashArray: "6 5" },
  tanah: { color: "#8b5e34", weight: 4 },
  "tanah-liat": { color: "#a16207", weight: 4, dashArray: "8 3 2 3" },
  batu: { color: "#6b7280", weight: 4, dashArray: "2 4" },
  pasir: { color: "#c2a25a", weight: 4, dashArray: "1 6" },
  campuran: { color: "#1e3b2e", weight: 4 },
};

const STATUS_STYLES: Record<
  TrailRouteStatus,
  { color?: string; dashArray?: string; opacity: number }
> = {
  terverifikasi: { opacity: 1 },
  alternatif: { dashArray: "8 6", opacity: 0.9 },
  "dalam-perbaikan": { color: "#b45309", dashArray: "6 6", opacity: 1 },
  rusak: { color: "#b91c1c", dashArray: "2 6", opacity: 1 },
  terlarang: { color: "#7f1d1d", dashArray: "12 6", opacity: 0.95 },
};

/** Combine the surface (colour/weight) with the condition (dash/override). */
export function routeLineStyle(
  surface: string,
  status: TrailRouteStatus,
  selected: boolean,
): RouteLineStyle {
  const base =
    SURFACE_STYLES[surface as RouteSurface] ?? SURFACE_STYLES.campuran;
  const state = STATUS_STYLES[status] ?? STATUS_STYLES.terverifikasi;

  return {
    color: state.color ?? base.color,
    dashArray: state.dashArray ?? base.dashArray,
    weight: base.weight + (selected ? 2 : 0),
    opacity: selected ? state.opacity : 0.5,
  };
}

export const SURFACE_SAMPLES = Object.entries(SURFACE_STYLES).map(
  ([value, style]) => ({ value, ...style }),
);

export const STATUS_SAMPLES = Object.entries(STATUS_STYLES).map(
  ([value, style]) => ({
    value,
    color: style.color ?? "#1e3b2e",
    dashArray: style.dashArray,
  }),
);
