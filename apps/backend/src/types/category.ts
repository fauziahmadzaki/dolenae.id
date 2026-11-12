import type { z } from "zod";
import type { CategoryType, NewCategoryRow } from "../db/models";
import type {
  categoryIdParamsSchema,
  categoryListQuerySchema,
  createCategorySchema,
  updateCategorySchema,
} from "../schemas/category.schema";
import type { Pagination } from "../utils/pagination";

export type CategoryListQuery = z.infer<typeof categoryListQuerySchema>;
export type CreateCategoryBody = z.infer<typeof createCategorySchema>;
export type UpdateCategoryBody = z.infer<typeof updateCategorySchema>;
export type CategoryIdParams = z.infer<typeof categoryIdParamsSchema>;

/** Fields a caller may update after the category exists. */
export type CategoryPatch = Partial<
  Pick<NewCategoryRow, "name" | "slug" | "type" | "icon" | "description">
>;

/** Filter params accepted by the category repository list query. */
export type CategoryListParams = Pagination & { type?: CategoryType };

/** Category shape sent to clients (web + mobile). */
export interface PublicCategory {
  id: string;
  name: string;
  slug: string;
  type: CategoryType;
  icon: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  slug?: string;
  type: CategoryType;
  icon?: string | null;
  description?: string | null;
}

export type UpdateCategoryDto = Partial<CreateCategoryDto>;
