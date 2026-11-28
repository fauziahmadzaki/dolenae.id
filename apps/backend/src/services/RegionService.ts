import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import type {
  DistrictSummary,
  RegencySummary,
  RegionSummary,
  ReverseRegion,
} from "../types/region";
import { haversineKm } from "../utils/geo";

interface Centroid {
  code: string;
  lat: number;
  lng: number;
}

type VillageTuple = [string, number, number];

const ADM4_RE = /^\d{2}\.\d{2}\.\d{2}\.\d{4}$/;

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
  private villagesByDistrict: Record<string, VillageTuple[]> | null = null;

  private loadVillages(): Record<string, VillageTuple[]> {
    if (this.villagesByDistrict) return this.villagesByDistrict;
    const url = new URL("../data/regions/villages.json.gz", import.meta.url);
    const json = gunzipSync(readFileSync(url)).toString("utf8");
    this.villagesByDistrict = JSON.parse(json) as Record<string, VillageTuple[]>;
    return this.villagesByDistrict;
  }

  private distanceKm(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number,
  ): number {
    return haversineKm(
      { latitude: fromLat, longitude: fromLng },
      { latitude: toLat, longitude: toLng },
    );
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
      const km = this.distanceKm(lat, lng, centroid.lat, centroid.lng);
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

  /**
   * Resolve up to `limit` nearest Kemendagri `adm4` village codes from `(lat, lng)`
   * by scanning the 2 nearest district centroids' village buckets.
   */
  resolveAdm4Candidates(lat: number, lng: number, limit = 3): string[] {
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || limit <= 0) {
      return [];
    }

    let first: { code: string; km: number } | undefined;
    let second: { code: string; km: number } | undefined;

    for (const centroid of this.centroids) {
      const km = this.distanceKm(lat, lng, centroid.lat, centroid.lng);
      if (!first || km < first.km) {
        second = first;
        first = { code: centroid.code, km };
      } else if (!second || km < second.km) {
        second = { code: centroid.code, km };
      }
    }

    const districtCodes = [
      ...(first ? [first.code] : []),
      ...(second ? [second.code] : []),
    ];
    if (districtCodes.length === 0) return [];

    const villagesMap = this.loadVillages();
    const candidates: { adm4: string; km: number }[] = [];

    for (const adm3 of districtCodes) {
      const bucket = villagesMap[adm3];
      if (!bucket) continue;
      for (const [suffix, vLat, vLng] of bucket) {
        const adm4 = `${adm3}.${suffix}`;
        if (!ADM4_RE.test(adm4)) continue;
        candidates.push({
          adm4,
          km: this.distanceKm(lat, lng, vLat, vLng),
        });
      }
    }

    candidates.sort((a, b) => a.km - b.km);

    const unique: string[] = [];
    const seen = new Set<string>();
    for (const item of candidates) {
      if (seen.has(item.adm4)) continue;
      seen.add(item.adm4);
      unique.push(item.adm4);
      if (unique.length >= limit) break;
    }
    return unique;
  }
}

export const regionService = new RegionService();
