import type { Category, CategoryType } from "@dolenae/types";
import type { CategoryRow } from "../db/schema";
import {
  categoryRepository,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "../repositories/category.repository";
import { paginate } from "../utils/pagination";
import type { PaginationParams } from "../utils/pagination";
import type { Paginated } from "../types/api";
import { ConflictError, NotFoundError } from "../utils/errors";

export function toCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    type: row.type,
    icon: row.icon,
    description: row.description ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export const categoryService = {
  async list(
    params: PaginationParams,
    type?: CategoryType,
  ): Promise<Paginated<Category>> {
    const { items, total } = await categoryRepository.list(params, type);
    return paginate(items.map(toCategory), total, params);
  },

  async all(): Promise<Category[]> {
    const rows = await categoryRepository.findAll();
    return rows.map(toCategory);
  },

  async getById(id: string): Promise<Category> {
    const row = await categoryRepository.findById(id);
    if (!row) throw new NotFoundError("Kategori tidak ditemukan");
    return toCategory(row);
  },

  async create(input: CreateCategoryInput): Promise<Category> {
    const slug = input.slug ? slugify(input.slug) : slugify(input.name);
    if (await categoryRepository.countBySlug(slug)) {
      throw new ConflictError(`Slug kategori "${slug}" sudah dipakai`);
    }
    const row = await categoryRepository.create({ ...input, slug });
    return toCategory(row);
  },

  async update(id: string, input: UpdateCategoryInput): Promise<Category> {
    const existing = await categoryRepository.findById(id);
    if (!existing) throw new NotFoundError("Kategori tidak ditemukan");

    const patch = { ...input };
    if (input.slug || input.name) {
      const slug = slugify(input.slug ?? input.name ?? existing.slug);
      if (await categoryRepository.countBySlug(slug, id)) {
        throw new ConflictError(`Slug kategori "${slug}" sudah dipakai`);
      }
      patch.slug = slug;
    }
    const row = await categoryRepository.update(id, patch);
    if (!row) throw new NotFoundError("Kategori tidak ditemukan");
    return toCategory(row);
  },

  async remove(id: string): Promise<void> {
    const ok = await categoryRepository.remove(id);
    if (!ok) throw new NotFoundError("Kategori tidak ditemukan");
  },
};
