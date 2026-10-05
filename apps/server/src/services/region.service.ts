import {
  listDistricts,
  listProvinces,
  listRegencies,
  reverseGeocode,
} from "@dolenae/regions";

/**
 * Data wilayah Indonesia (provinsi/kabupaten/kecamatan) + reverse geocode
 * offline dari dataset turunan `geografis` (lihat `packages/regions`).
 */
export const regionService = {
  provinces(): string[] {
    return listProvinces();
  },

  regencies(province?: string) {
    return listRegencies(province);
  },

  districts(regency?: string, province?: string) {
    return listDistricts(regency, province);
  },

  reverse(lat: number, lng: number) {
    return reverseGeocode(lat, lng);
  },
};
