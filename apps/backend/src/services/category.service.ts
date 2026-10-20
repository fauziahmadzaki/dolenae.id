import type { CategoryRow, CategoryType } from "../db/schema";
import { categoryRepository } from "../repositories/category.repository";
import { buildMeta, toPagination, type PaginationQuery } from "../utils/pagination";
import type { ApiMeta } from "../types/api";
import { BadRequestError, ConflictError, NotFoundError } from "../utils/errors";
import { slugify } from "../utils/slug";

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

export function toPublicCategory(row: CategoryRow): PublicCategory {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    type: row.type,
    icon: row.icon,
    description: row.description,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export const categoryService = {
  async getById(id: string): Promise<PublicCategory> {
    const row = await categoryRepository.findById(id);
    if (!row) throw new NotFoundError("Kategori tidak ditemukan");
    return toPublicCategory(row);
  },

  async list(
    query: PaginationQuery & { type?: CategoryType },
  ): Promise<{ items: PublicCategory[]; meta: ApiMeta }> {
    const pagination = toPagination(query);
    const { items, total } = await categoryRepository.list({
      ...pagination,
      type: query.type,
    });
    return {
      items: items.map(toPublicCategory),
      meta: buildMeta(total, query.page, query.limit),
    };
  },

  async create(input: CreateCategoryDto): Promise<PublicCategory> {
    const slug = input.slug?.trim() || slugify(input.name);
    if (!slug) throw new BadRequestError("Slug kategori tidak valid");
    if (await categoryRepository.slugExists(slug)) {
      throw new ConflictError("Slug kategori sudah dipakai");
    }
    const row = await categoryRepository.create({
      name: input.name,
      slug,
      type: input.type,
      icon: input.icon ?? null,
      description: input.description ?? null,
    });
    return toPublicCategory(row);
  },

  async update(id: string, input: UpdateCategoryDto): Promise<PublicCategory> {
    const existing = await categoryRepository.findById(id);
    if (!existing) throw new NotFoundError("Kategori tidak ditemukan");

    const patch: Partial<CreateCategoryDto> = {};
    if (input.name !== undefined) patch.name = input.name;
    if (input.type !== undefined) patch.type = input.type;
    if (input.icon !== undefined) patch.icon = input.icon;
    if (input.description !== undefined) patch.description = input.description;

    const nextSlug =
      input.slug !== undefined && input.slug.trim() !== ""
        ? input.slug.trim()
        : input.name !== undefined
          ? slugify(input.name)
          : undefined;

    if (nextSlug && nextSlug !== existing.slug) {
      if (await categoryRepository.slugExists(nextSlug)) {
        throw new ConflictError("Slug kategori sudah dipakai");
      }
      patch.slug = nextSlug;
    }

    const updated = await categoryRepository.update(id, patch);
    if (!updated) throw new NotFoundError("Kategori tidak ditemukan");
    return toPublicCategory(updated);
  },

  /**
   * Delete a category. Destination links are removed by the pivot cascade —
   * the destination rows themselves are never touched.
   */
  async delete(id: string): Promise<{ id: string; deleted: true }> {
    const existing = await categoryRepository.findById(id);
    if (!existing) throw new NotFoundError("Kategori tidak ditemukan");

    const deleted = await categoryRepository.delete(id);
    if (!deleted) throw new NotFoundError("Gagal menghapus kategori");
    return { id, deleted: true };
  },
};
