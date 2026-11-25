import { z } from "zod";
import { FACILITY_CATEGORIES, FACILITY_STATUSES } from "../types/facility";
import { paginationSchema } from "../utils/pagination";

const price = z.number().int().min(0).max(1_000_000_000);

/** Optional price pair: `priceMax` only allowed when `priceMin` is set. */
function refinePriceRange(
  value: { priceMin?: number | null; priceMax?: number | null },
  ctx: z.RefinementCtx,
): void {
  if (value.priceMax == null) return;
  if (value.priceMin == null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["priceMax"],
      message: "Harga termahal hanya boleh diisi jika harga mulai diisi",
    });
    return;
  }
  if (value.priceMax < value.priceMin) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["priceMax"],
      message: "Harga termahal tidak boleh lebih kecil dari harga mulai",
    });
  }
}

export const facilityIdParamsSchema = z.object({
  id: z.string().uuid("ID fasilitas harus UUID yang valid"),
});

export const facilityProductParamsSchema = z.object({
  id: z.string().uuid("ID fasilitas harus UUID yang valid"),
  productId: z.string().uuid("ID produk harus UUID yang valid"),
});

export const productListQuerySchema = paginationSchema.extend({
  facilityId: z.string().uuid("ID fasilitas harus UUID yang valid").optional(),
});

export const facilityListQuerySchema = paginationSchema.extend({
  status: z.enum(FACILITY_STATUSES).optional(),
  category: z.enum(FACILITY_CATEGORIES).optional(),
  type: z.string().trim().min(1).max(60).optional(),
});

const facilityFields = z.object({
  destinationId: z.string().uuid("Destinasi harus UUID yang valid"),
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(120),
  category: z.enum(FACILITY_CATEGORIES),
  type: z.string().trim().min(1, "Tipe wajib diisi").max(60),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  priceMin: price.nullable().optional(),
  priceMax: price.nullable().optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  contact: z.string().trim().min(3, "Kontak wajib diisi").max(200),
  contactEmail: z.string().trim().email("Email tidak valid").max(255).nullable().optional(),
  website: z.string().trim().url("Website harus URL valid").max(500).nullable().optional(),
  bannerUrl: z.string().trim().url("Banner harus URL valid").max(1000).nullable().optional(),
  status: z.enum(FACILITY_STATUSES).optional(),
});

export const createFacilitySchema = facilityFields.superRefine(refinePriceRange);

export const updateFacilitySchema = facilityFields
  .partial()
  .superRefine((value, ctx) => {
    refinePriceRange(value, ctx);
    if (Object.keys(value).length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Setidaknya satu field harus diisi",
      });
    }
  });

const productFields = z.object({
  name: z.string().trim().min(2, "Nama produk minimal 2 karakter").max(120),
  description: z.string().trim().max(2000).nullable().optional(),
  bannerUrl: z.string().trim().url("Banner harus URL valid").max(1000).nullable().optional(),
  price: z.number().int().min(0).max(1_000_000_000),
  position: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const createFacilityProductSchema = productFields;

export const updateFacilityProductSchema = productFields
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    "Setidaknya satu field harus diisi",
  );
