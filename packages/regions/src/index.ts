import raw from "./data.json";

export interface RegionProvince {
  name: string;
}

export interface RegionRegency {
  name: string;
  province: string;
}

export interface RegionDistrict {
  name: string;
  regency: string;
  province: string;
  lat: number;
  lng: number;
  elevation?: number;
}

export interface ReverseGeocodeResult {
  province: string;
  regency: string;
  district: string;
  elevation?: number;
  /** Jarak ke centroid kecamatan terdekat (km). */
  distanceKm: number;
}

const provinces = raw.provinces as RegionProvince[];
const regencies = raw.regencies as RegionRegency[];
const districts = raw.districts as RegionDistrict[];

export function listProvinces(): string[] {
  return provinces.map((p) => p.name);
}

export function listRegencies(province?: string): RegionRegency[] {
  return province ? regencies.filter((r) => r.province === province) : regencies;
}

export function listDistricts(regency?: string, province?: string): RegionDistrict[] {
  return districts.filter(
    (d) => (!regency || d.regency === regency) && (!province || d.province === province),
  );
}

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/**
 * Cari kecamatan terdekat dari sebuah koordinat (nearest-centroid).
 * Bukan uji poligon — di dekat perbatasan bisa meleset satu tingkat.
 */
export function reverseGeocode(lat: number, lng: number): ReverseGeocodeResult | null {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  let best: RegionDistrict | null = null;
  let bestKm = Infinity;
  for (const d of districts) {
    const km = haversineKm(lat, lng, d.lat, d.lng);
    if (km < bestKm) {
      bestKm = km;
      best = d;
    }
  }
  if (!best) return null;

  return {
    province: best.province,
    regency: best.regency,
    district: best.name,
    elevation: best.elevation,
    distanceKm: Number(bestKm.toFixed(2)),
  };
}
