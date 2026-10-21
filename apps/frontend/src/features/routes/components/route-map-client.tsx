"use client";

import dynamic from "next/dynamic";

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
