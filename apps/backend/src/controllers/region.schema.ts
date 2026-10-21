import { z } from "zod";

/** Query for regencies of a province. */
export const regencyQuerySchema = z.object({
  province: z.string().trim().min(1, "province wajib diisi").max(10),
});

/** Query for districts of a regency. */
export const districtQuerySchema = z.object({
  regency: z.string().trim().min(1, "regency wajib diisi").max(10),
});

/** Query for reverse geocoding a coordinate. */
export const reverseQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

export type RegencyQuery = z.infer<typeof regencyQuerySchema>;
export type DistrictQuery = z.infer<typeof districtQuerySchema>;
export type ReverseQuery = z.infer<typeof reverseQuerySchema>;
