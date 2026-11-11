import type { z } from "zod";
import type {
  categoryIdParamsSchema,
  categoryListQuerySchema,
  createCategorySchema,
  updateCategorySchema,
} from "../schemas/category.schema";

export type CategoryListQuery = z.infer<typeof categoryListQuerySchema>;
export type CreateCategoryBody = z.infer<typeof createCategorySchema>;
export type UpdateCategoryBody = z.infer<typeof updateCategorySchema>;
export type CategoryIdParams = z.infer<typeof categoryIdParamsSchema>;
