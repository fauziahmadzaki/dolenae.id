import { readFileSync } from "node:fs";
import type {
  DistrictSummary,
  RegencySummary,
  RegionSummary,
  ReverseRegion,
} from "../types/region";

interface Centroid {
  code: string;
  lat: number;
  lng: number;
}

function loadJson<T>(file: string): T {
  const url = new URL(`../data/regions/${file}`, import.meta.url);
  return JSON.parse(readFileSync(url, "utf8")) as T;
}

class RegionService {
  // Static datasets are read once at startup (~1 MB in total).
  private readonly provinceRows = loadJson<RegionSummary[]>("provinces.json");
  private readonly regencyRows = loadJson<RegencySummary[]>("regencies.json");
  private readonly districtRows = loadJson<DistrictSummary[]>("districts.json");
  private readonly centroids = loadJson<Centroid[]>("district-centroids.json");

  private readonly districtByCode = new Map(
    this.districtRows.map((row) => [row.code, row]),
  );
  private readonly regencyByCode = new Map(
    this.regencyRows.map((row) => [row.code, row]),
  );
  private readonly provinceByCode = new Map(
    this.provinceRows.map((row) => [row.code, row]),
  );

  private haversineKm(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number,
  ): number {
    const rad = Math.PI / 180;
    const dLat = (toLat - fromLat) * rad;
    const dLng = (toLng - fromLng) * rad;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(fromLat * rad) *
        Math.cos(toLat * rad) *
        Math.sin(dLng / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private toSummary(row: RegionSummary): RegionSummary {
    return {
      code: row.code,
      name: row.name,
    };
  }

  /** All provinces, sorted by name. */
  provinces(): RegionSummary[] {
    return [...this.provinceRows]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((row) => this.toSummary(row));
  }

  /** Regencies (kabupaten/kota) of a province. */
  regencies(provinceCode: string): RegionSummary[] {
    return this.regencyRows
      .filter((row) => row.provinceCode === provinceCode)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((row) => this.toSummary(row));
  }

  /** Districts (kecamatan) of a regency. */
  districts(regencyCode: string): RegionSummary[] {
    return this.districtRows
      .filter((row) => row.regencyCode === regencyCode)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((row) => this.toSummary(row));
  }

  /**
   * Approximate reverse geocode: nearest district centroid. Good enough to
   * prefill the admin form; it is not an administrative boundary lookup.
   */
  reverse(lat: number, lng: number): ReverseRegion | null {
    let best: Centroid | undefined;
    let bestKm = Number.POSITIVE_INFINITY;

    for (const centroid of this.centroids) {
      const km = this.haversineKm(lat, lng, centroid.lat, centroid.lng);
      if (km < bestKm) {
        bestKm = km;
        best = centroid;
      }
    }

    if (!best) return null;

    const district = this.districtByCode.get(best.code);
    if (!district) return null;

    const regency = this.regencyByCode.get(district.regencyCode);
    const province = this.provinceByCode.get(district.provinceCode);
    if (!regency || !province) return null;

    return {
      province: this.toSummary(province),
      regency: this.toSummary(regency),
      district: this.toSummary(district),
      distanceKm: Number(bestKm.toFixed(1)),
    };
  }
}

export const regionService = new RegionService();
