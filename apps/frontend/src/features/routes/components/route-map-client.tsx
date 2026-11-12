"use client";

import dynamic from "next/dynamic";

export type {
  RouteMapContextPayload,
  RouteMapContextTarget,
} from "./route-map";

/** Leaflet needs `window`, so the route map is client-only. */
export const RouteMap = dynamic(
  () => import("./route-map").then((module) => module.RouteMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[420px] w-full animate-pulse rounded-xl bg-canvas-subtle" />
    ),
  },
);
