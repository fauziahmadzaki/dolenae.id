import { and, asc, count, desc, eq, ilike, inArray } from "drizzle-orm";
import { getDb } from "../db/client";
import {
  destinationCategories,
  destinations,
  type DestinationRow,
  type DestinationStatus,
  type Difficulty,
  type NewDestinationRow,
} from "../db/schema";
import type { Pagination } from "../utils/pagination";

/** Fields a caller may update after the destination exists. */
export type DestinationPatch = Partial<Omit<NewDestinationRow, "id">>;

export type DestinationListParams = Pagination & {
  difficulty?: Difficulty;
  status?: DestinationStatus;
  categoryId?: string;
};

export const destinationRepository = {
  async findById(id: string): Promise<DestinationRow | undefined> {
    const [row] = await getDb()
      .select()
      .from(destinations)
      .where(eq(destinations.id, id))
      .limit(1);
    return row;
  },

  async findBySlug(slug: string): Promise<DestinationRow | undefined> {
    const [row] = await getDb()
      .select()
      .from(destinations)
      .where(eq(destinations.slug, slug))
      .limit(1);
    return row;
  },

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const db = getDb();
    const rows = await db
      .select({ id: destinations.id })
      .from(destinations)
      .where(eq(destinations.slug, slug))
      .limit(1);
    const row = rows[0];
    if (!row) return false;
    return excludeId ? row.id !== excludeId : true;
  },

  async create(data: NewDestinationRow): Promise<DestinationRow> {
    const [row] = await getDb().insert(destinations).values(data).returning();
    return row!;
  },

  async update(
    id: string,
    patch: DestinationPatch,
  ): Promise<DestinationRow | undefined> {
    const [row] = await getDb()
      .update(destinations)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(destinations.id, id))
      .returning();
    return row;
  },

  async delete(id: string): Promise<boolean> {
    const [row] = await getDb()
      .delete(destinations)
      .where(eq(destinations.id, id))
      .returning({ id: destinations.id });
    return Boolean(row);
  },

  /** Current category links of a destination. */
  async findCategoryIds(destinationId: string): Promise<string[]> {
    const rows = await getDb()
      .select({ categoryId: destinationCategories.categoryId })
      .from(destinationCategories)
      .where(eq(destinationCategories.destinationId, destinationId));
    return rows.map((r) => r.categoryId);
  },

  /** Batch version for list endpoints: all links for the given destinations. */
  async findCategoryLinks(
    destinationIds: string[],
  ): Promise<{ destinationId: string; categoryId: string }[]> {
    if (destinationIds.length === 0) return [];
    return getDb()
      .select({
        destinationId: destinationCategories.destinationId,
        categoryId: destinationCategories.categoryId,
      })
      .from(destinationCategories)
      .where(inArray(destinationCategories.destinationId, destinationIds));
  },

  /** Replace all category links of a destination (delete + insert diff). */
  async replaceCategories(
    destinationId: string,
    categoryIds: string[],
  ): Promise<void> {
    const db = getDb();
    await db
      .delete(destinationCategories)
      .where(eq(destinationCategories.destinationId, destinationId));
    if (categoryIds.length > 0) {
      await db.insert(destinationCategories).values(
        categoryIds.map((categoryId) => ({ destinationId, categoryId })),
      );
    }
  },

  /** Category ids used by any destination (for delete-conflict reporting). */
  async findUsedCategoryIds(categoryIds: string[]): Promise<string[]> {
    if (categoryIds.length === 0) return [];
    const rows = await getDb()
      .select({ categoryId: destinationCategories.categoryId })
      .from(destinationCategories)
      .where(inArray(destinationCategories.categoryId, categoryIds));
    return [...new Set(rows.map((r) => r.categoryId))];
  },

  async list(
    params: DestinationListParams,
  ): Promise<{ items: DestinationRow[]; total: number }> {
    const db = getDb();
    const { limit, offset, sort, order, search } = params;

    const conditions = [
      search
        ? ilike(destinations.name, `%${search}%`)
        : undefined,
      params.difficulty ? eq(destinations.difficulty, params.difficulty) : undefined,
      params.status ? eq(destinations.status, params.status) : undefined,
      params.categoryId
        ? inArray(
            destinations.id,
            db
              .select({ id: destinationCategories.destinationId })
              .from(destinationCategories)
              .where(eq(destinationCategories.categoryId, params.categoryId)),
          )
        : undefined,
    ];
    const where = and(...conditions);

    const sortable = {
      createdAt: destinations.createdAt,
      name: destinations.name,
      updatedAt: destinations.updatedAt,
      elevationMeters: destinations.elevationMeters,
    } as const;

    const sortColumn =
      sort && sort in sortable
        ? sortable[sort as keyof typeof sortable]
        : destinations.createdAt;

    const rows = await db
      .select()
      .from(destinations)
      .where(where)
      .orderBy(order === "asc" ? asc(sortColumn) : desc(sortColumn))
      .limit(limit)
      .offset(offset);

    const [totalRow] = await db
      .select({ value: count() })
      .from(destinations)
      .where(where);

    return { items: rows, total: Number(totalRow?.value ?? 0) };
  },
};
