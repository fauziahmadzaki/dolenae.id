import { apiFetch } from "~/lib/api";

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
  distanceKm: number;
}

export function listProvinces() {
  return apiFetch<string[]>("/regions/provinces").then((r) => r.data);
}

export function listRegencies(province?: string) {
  const qs = province ? `?province=${encodeURIComponent(province)}` : "";
  return apiFetch<RegionRegency[]>(`/regions/regencies${qs}`).then((r) => r.data);
}

export function listDistricts(regency?: string, province?: string) {
  const q = new URLSearchParams();
  if (regency) q.set("regency", regency);
  if (province) q.set("province", province);
  const qs = q.toString();
  return apiFetch<RegionDistrict[]>(`/regions/districts${qs ? `?${qs}` : ""}`).then((r) => r.data);
}

export function reverseGeocode(lat: number, lng: number) {
  return apiFetch<ReverseGeocodeResult | null>(
    `/regions/reverse?lat=${lat}&lng=${lng}`,
  ).then((r) => r.data);
}
