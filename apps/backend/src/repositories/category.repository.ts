import { and, asc, count, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import { getDb } from "../db/client";
import {
  categories,
  type CategoryRow,
  type CategoryType,
  type NewCategoryRow,
} from "../db/schema";
import type { Pagination } from "../utils/pagination";

/** Fields a caller may update after the category exists. */
export type CategoryPatch = Partial<
  Pick<NewCategoryRow, "name" | "slug" | "type" | "icon" | "description">
>;

export type CategoryListParams = Pagination & { type?: CategoryType };

export const categoryRepository = {
  async findById(id: string): Promise<CategoryRow | undefined> {
    const [row] = await getDb()
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);
    return row;
  },

  async findBySlug(slug: string): Promise<CategoryRow | undefined> {
    const [row] = await getDb()
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);
    return row;
  },

  async slugExists(slug: string): Promise<boolean> {
    const [row] = await getDb()
      .select({ value: sql<number>`1` })
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);
    return Boolean(row);
  },

  async create(data: NewCategoryRow): Promise<CategoryRow> {
    const [row] = await getDb().insert(categories).values(data).returning();
    return row!;
  },

  async update(id: string, patch: CategoryPatch): Promise<CategoryRow | undefined> {
    const [row] = await getDb()
      .update(categories)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return row;
  },

  async delete(id: string): Promise<boolean> {
    const [row] = await getDb()
      .delete(categories)
      .where(eq(categories.id, id))
      .returning({ id: categories.id });
    return Boolean(row);
  },

  async list(
    params: CategoryListParams,
  ): Promise<{ items: CategoryRow[]; total: number }> {
    const db = getDb();
    const { limit, offset, sort, order, search } = params;

    const where = and(
      search ? ilike(categories.name, `%${search}%`) : undefined,
      params.type ? eq(categories.type, params.type) : undefined,
    );

    const sortable = {
      createdAt: categories.createdAt,
      name: categories.name,
      slug: categories.slug,
    } as const;

    const sortColumn =
      sort && sort in sortable
        ? sortable[sort as keyof typeof sortable]
        : categories.createdAt;

    const rows = await db
      .select()
      .from(categories)
      .where(where ? and(where) : undefined)
      .orderBy(order === "asc" ? asc(sortColumn) : desc(sortColumn))
      .limit(limit)
      .offset(offset);

    const [totalRow] = await db
      .select({ value: count() })
      .from(categories)
      .where(where ? and(where) : undefined);

    return { items: rows, total: Number(totalRow?.value ?? 0) };
  },

  /** Batch check: returns the subset of ids that exist in `categories`. */
  async findExistingIds(ids: string[]): Promise<string[]> {
    if (ids.length === 0) return [];
    const rows = await getDb()
      .select({ id: categories.id })
      .from(categories)
      .where(inArray(categories.id, ids));
    return rows.map((r) => r.id);
  },

  async findByIds(ids: string[]): Promise<CategoryRow[]> {
    if (ids.length === 0) return [];
    return getDb()
      .select()
      .from(categories)
      .where(inArray(categories.id, ids));
  },
};
