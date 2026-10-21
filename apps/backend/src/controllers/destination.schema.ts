import { z } from "zod";
import { paginationSchema } from "../utils/pagination";
import { SLUG_PATTERN } from "../utils/slug";

const textList = z
  .array(z.string().trim().min(1).max(120))
  .max(40, "Maksimal 40 item")
  .optional();

const slugSchema = z
  .string()
  .trim()
  .max(140)
  .regex(SLUG_PATTERN, "Slug hanya boleh huruf kecil, angka, dan tanda hubung");

const locationSchema = z.object({
  province: z.string().trim().max(80).nullable().optional(),
  regency: z.string().trim().max(80).nullable().optional(),
  district: z.string().trim().max(80).nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  accessPoint: z.string().trim().max(160).nullable().optional(),
});

const accessSchema = z.object({
  description: z.string().trim().max(4000).nullable().optional(),
  transport: textList,
  duration: z.string().trim().max(80).nullable().optional(),
  distanceKm: z.number().min(0).max(100000).nullable().optional(),
});

export const destinationListQuerySchema = paginationSchema.extend({
  difficulty: z.enum(["ramah-pemula", "menengah", "sulit"]).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  categoryId: z.string().uuid("categoryId harus UUID").optional(),
});

const destinationFields = {
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(120),
  slug: slugSchema.optional(),
  tagline: z.string().trim().max(200).nullable().optional(),
  description: z.string().trim().max(50000).nullable().optional(),
  difficulty: z.enum(["ramah-pemula", "menengah", "sulit"]).optional(),
  bestSeason: textList,
  tags: textList,
  location: locationSchema.optional(),
  access: accessSchema.optional(),
  facilities: textList,
  entryFee: z.number().int().min(0).max(100_000_000).nullable().optional(),
  elevationMeters: z.number().int().min(-500).max(9000).nullable().optional(),
  images: z.array(z.string().trim().min(1).max(2000)).max(20).optional(),
  guideRequired: z.boolean().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  categoryIds: z.array(z.string().uuid("categoryIds harus UUID")).max(40).optional(),
};

/** Skema validasi pembuatan destinasi. */
export const createDestinationSchema = z.object(destinationFields);

/** Skema validasi pembaruan destinasi (minimal 1 field diubah). */
export const updateDestinationSchema = z
  .object({
    ...destinationFields,
    name: destinationFields.name.optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "Setidaknya satu field harus diisi untuk update",
  );

/** Skema validasi parameter ID destinasi UUID. */
export const destinationIdParamsSchema = z.object({
  id: z.string().uuid("ID destinasi harus berupa format UUID yang valid"),
});

export type DestinationListQuery = z.infer<typeof destinationListQuerySchema>;
export type CreateDestinationBody = z.infer<typeof createDestinationSchema>;
export type UpdateDestinationBody = z.infer<typeof updateDestinationSchema>;
