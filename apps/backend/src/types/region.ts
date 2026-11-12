import type { z } from "zod";
import type {
  districtQuerySchema,
  regencyQuerySchema,
  reverseQuerySchema,
} from "../schemas/region.schema";

export type RegencyQuery = z.infer<typeof regencyQuerySchema>;
export type DistrictQuery = z.infer<typeof districtQuerySchema>;
export type ReverseQuery = z.infer<typeof reverseQuerySchema>;

export interface RegionSummary {
  code: string;
  name: string;
}

export interface RegencySummary extends RegionSummary {
  provinceCode: string;
}

export interface DistrictSummary extends RegionSummary {
  regencyCode: string;
  provinceCode: string;
}

export interface ReverseRegion {
  province: RegionSummary;
  regency: RegionSummary;
  district: RegionSummary;
  /** Distance from the requested point to the district centroid. */
  distanceKm: number;
}
