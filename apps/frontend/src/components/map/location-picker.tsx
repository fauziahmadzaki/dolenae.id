"use client";

import dynamic from "next/dynamic";

/**
 * Client-only wrapper: Leaflet touches `window`, so the map is never rendered
 * during SSR.
 */
export const LocationPicker = dynamic(
  () => import("./map-picker").then((module) => module.MapPicker),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden
        className="h-[320px] w-full animate-pulse rounded-lg bg-canvas-subtle"
      />
    ),
  },
);
