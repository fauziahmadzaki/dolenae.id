import { z } from "zod";
import { paginationSchema } from "../utils/pagination";
import { SLUG_PATTERN } from "../utils/slug";

const slugSchema = z
  .string()
  .trim()
  .max(100)
  .regex(SLUG_PATTERN, "Slug hanya boleh huruf kecil, angka, dan tanda hubung");

export const categoryListQuerySchema = paginationSchema.extend({
  type: z.enum(["terrain", "activity"]).optional(),
});

const categoryFields = {
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(80),
  slug: slugSchema.optional(),
  type: z.enum(["terrain", "activity"], {
    errorMap: () => ({ message: "Tipe harus terrain atau activity" }),
  }),
  icon: z.string().trim().max(80).nullable().optional(),
  description: z.string().trim().max(1000).nullable().optional(),
};

/** Skema validasi pembuatan kategori. */
export const createCategorySchema = z.object(categoryFields);

/** Skema validasi pembaruan kategori (minimal 1 field diubah). */
export const updateCategorySchema = z
  .object({
    name: categoryFields.name.optional(),
    slug: categoryFields.slug,
    type: categoryFields.type.optional(),
    icon: categoryFields.icon,
    description: categoryFields.description,
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "Setidaknya satu field harus diisi untuk update",
  );

/** Skema validasi parameter ID kategori UUID. */
export const categoryIdParamsSchema = z.object({
  id: z.string().uuid("ID kategori harus berupa format UUID yang valid"),
});

export type CategoryListQuery = z.infer<typeof categoryListQuerySchema>;
export type CreateCategoryBody = z.infer<typeof createCategorySchema>;
export type UpdateCategoryBody = z.infer<typeof updateCategorySchema>;
