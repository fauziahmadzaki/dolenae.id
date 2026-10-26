import { readFileSync } from "node:fs";

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

interface Centroid {
  code: string;
  lat: number;
  lng: number;
}

function loadJson<T>(file: string): T {
  const url = new URL(`../data/regions/${file}`, import.meta.url);
  return JSON.parse(readFileSync(url, "utf8")) as T;
}

// Static datasets are read once at startup (~1 MB in total).
const provinces = loadJson<RegionSummary[]>("provinces.json");
const regencies = loadJson<RegencySummary[]>("regencies.json");
const districts = loadJson<DistrictSummary[]>("districts.json");
const centroids = loadJson<Centroid[]>("district-centroids.json");

const districtByCode = new Map(districts.map((row) => [row.code, row]));
const regencyByCode = new Map(regencies.map((row) => [row.code, row]));
const provinceByCode = new Map(provinces.map((row) => [row.code, row]));

function haversineKm(
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

const toSummary = (row: RegionSummary): RegionSummary => ({
  code: row.code,
  name: row.name,
});

export const regionService = {
  /** All provinces, sorted by name. */
  provinces(): RegionSummary[] {
    return [...provinces]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(toSummary);
  },

  /** Regencies (kabupaten/kota) of a province. */
  regencies(provinceCode: string): RegionSummary[] {
    return regencies
      .filter((row) => row.provinceCode === provinceCode)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(toSummary);
  },

  /** Districts (kecamatan) of a regency. */
  districts(regencyCode: string): RegionSummary[] {
    return districts
      .filter((row) => row.regencyCode === regencyCode)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(toSummary);
  },

  /**
   * Approximate reverse geocode: nearest district centroid. Good enough to
   * prefill the admin form; it is not an administrative boundary lookup.
   */
  reverse(lat: number, lng: number): ReverseRegion | null {
    let best: Centroid | undefined;
    let bestKm = Number.POSITIVE_INFINITY;

    for (const centroid of centroids) {
      const km = haversineKm(lat, lng, centroid.lat, centroid.lng);
      if (km < bestKm) {
        bestKm = km;
        best = centroid;
      }
    }

    if (!best) return null;

    const district = districtByCode.get(best.code);
    if (!district) return null;

    const regency = regencyByCode.get(district.regencyCode);
    const province = provinceByCode.get(district.provinceCode);
    if (!regency || !province) return null;

    return {
      province: toSummary(province),
      regency: toSummary(regency),
      district: toSummary(district),
      distanceKm: Number(bestKm.toFixed(1)),
    };
  },
};
