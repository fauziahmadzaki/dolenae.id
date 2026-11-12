import { get } from "~/lib/api/client";

export interface Region {
  code: string;
  name: string;
}

export interface ReverseRegion {
  province: Region;
  regency: Region;
  district: Region;
  /** Distance to the district centroid; the result is approximate. */
  distanceKm: number;
}

/** Static Indonesian region data served by the backend. */
export const regionsApi = {
  provinces: (signal?: AbortSignal) =>
    get<Region[]>("/regions/provinces", { signal }),

  regencies: (provinceCode: string, signal?: AbortSignal) =>
    get<Region[]>(
      `/regions/regencies?province=${encodeURIComponent(provinceCode)}`,
      { signal },
    ),

  districts: (regencyCode: string, signal?: AbortSignal) =>
    get<Region[]>(
      `/regions/districts?regency=${encodeURIComponent(regencyCode)}`,
      { signal },
    ),

  reverse: (lat: number, lng: number, signal?: AbortSignal) =>
    get<ReverseRegion | null>(`/regions/reverse?lat=${lat}&lng=${lng}`, {
      signal,
    }),
};
