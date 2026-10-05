import { and, asc, count, desc, eq, ilike, ne, or } from "drizzle-orm";
import { getDb } from "../db/client";
import {
  categories,
  type CategoryRow,
  type NewCategoryRow,
} from "../db/schema";
import type { PaginationParams } from "../utils/pagination";
import type { CategoryType } from "@dolenae/types";

export interface CreateCategoryInput {
  name: string;
  slug: string;
  type: CategoryType;
  icon?: string;
  description?: string;
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

function buildWhere(params: PaginationParams, type?: CategoryType) {
  const filters = [];
  if (type) filters.push(eq(categories.type, type));
  if (params.search) {
    filters.push(
      or(
        ilike(categories.name, `%${params.search}%`),
        ilike(categories.slug, `%${params.search}%`),
      ),
    );
  }
  return filters.length ? and(...filters) : undefined;
}

export const categoryRepository = {
  async list(
    params: PaginationParams,
    type?: CategoryType,
  ): Promise<{ items: CategoryRow[]; total: number }> {
    const db = getDb();
    const where = buildWhere(params, type);
    const sortable = {
      name: categories.name,
      createdAt: categories.createdAt,
      type: categories.type,
    } as const;
    const sortColumn =
      params.sort && params.sort in sortable
        ? sortable[params.sort as keyof typeof sortable]
        : categories.name;

    const items = await db
      .select()
      .from(categories)
      .where(where)
      .orderBy(params.order === "desc" ? desc(sortColumn) : asc(sortColumn))
      .limit(params.limit)
      .offset((params.page - 1) * params.limit);

    const [totalRow] = await db
      .select({ value: count() })
      .from(categories)
      .where(where);

    return { items, total: Number(totalRow?.value ?? 0) };
  },

  async findAll(): Promise<CategoryRow[]> {
    const db = getDb();
    return db.select().from(categories).orderBy(asc(categories.name));
  },

  async findById(id: string): Promise<CategoryRow | null> {
    const db = getDb();
    const row = await db.query.categories.findFirst({
      where: eq(categories.id, id),
    });
    return row ?? null;
  },

  async findBySlug(slug: string): Promise<CategoryRow | null> {
    const db = getDb();
    const row = await db.query.categories.findFirst({
      where: eq(categories.slug, slug),
    });
    return row ?? null;
  },

  async create(input: CreateCategoryInput): Promise<CategoryRow> {
    const db = getDb();
    const values: NewCategoryRow = {
      name: input.name,
      slug: input.slug,
      type: input.type,
      icon: input.icon ?? "lucide:circle",
      description: input.description,
    };
    const [row] = await db.insert(categories).values(values).returning();
    if (!row) throw new Error("Gagal membuat kategori");
    return row;
  },

  async update(
    id: string,
    input: UpdateCategoryInput,
  ): Promise<CategoryRow | null> {
    const db = getDb();
    const [row] = await db
      .update(categories)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return row ?? null;
  },

  async remove(id: string): Promise<boolean> {
    const db = getDb();
    const rows = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning({ id: categories.id });
    return rows.length > 0;
  },

  async countBySlug(slug: string, excludeId?: string): Promise<number> {
    const db = getDb();
    const where = excludeId
      ? and(eq(categories.slug, slug), ne(categories.id, excludeId))
      : eq(categories.slug, slug);
    const [row] = await db.select({ value: count() }).from(categories).where(where);
    return Number(row?.value ?? 0);
  },
};
