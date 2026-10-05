import { and, asc, count, desc, eq, ilike, inArray, ne, or, sql } from "drizzle-orm";
import { getDb } from "../db/client";
import {
  destinationCategories,
  destinations,
  travelSupports,
  type DestinationRow,
  type NewDestinationRow,
} from "../db/schema";
import type { PaginationParams } from "../utils/pagination";
import type {
  AccessInfo,
  DestinationActivity,
  DestinationCondition,
  DestinationStatus,
  DestinationTerrain,
  FacilityInfo,
  ID,
  LocationInfo,
} from "@dolenae/types";

export interface DestinationFilters {
  status?: DestinationStatus;
  province?: string;
  categoryId?: string;
  terrain?: DestinationTerrain;
}

export interface CreateDestinationInput {
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  terrain?: DestinationTerrain[];
  activities?: DestinationActivity[];
  difficulty?: DestinationCondition;
  status?: DestinationStatus;
  bestSeason?: string[];
  location: LocationInfo;
  access: AccessInfo;
  facilities: FacilityInfo;
  entryFee?: string;
  images?: string[];
  tags?: string[];
  elevationMeters?: number;
  guideRequired?: boolean;
  categoryIds?: ID[];
}

export type UpdateDestinationInput = Partial<CreateDestinationInput>;

function buildWhere(params: PaginationParams, f: DestinationFilters) {
  const filters = [];
  if (f.status) filters.push(eq(destinations.status, f.status));
  if (f.province) filters.push(eq(sql`${destinations.location}->>'province'`, f.province));
  if (params.search) {
    filters.push(
      or(
        ilike(destinations.name, `%${params.search}%`),
        ilike(destinations.slug, `%${params.search}%`),
        ilike(destinations.tagline, `%${params.search}%`),
      ),
    );
  }
  if (f.categoryId) {
    filters.push(
      sql`exists (select 1 from ${destinationCategories} dc where dc.destination_id = ${destinations.id} and dc.category_id = ${f.categoryId})`,
    );
  }
  if (f.terrain) {
    filters.push(sql`${destinations.terrain} @> ${JSON.stringify([f.terrain])}::jsonb`);
  }
  return filters.length ? and(...filters) : undefined;
}

async function attachCategoryIds(rows: DestinationRow[]) {
  if (rows.length === 0) return [] as { row: DestinationRow; categoryIds: string[] }[];
  const db = getDb();
  const links = await db
    .select()
    .from(destinationCategories)
    .where(inArray(destinationCategories.destinationId, rows.map((r) => r.id)));

  const byDest = new Map<string, string[]>();
  for (const l of links) {
    const arr = byDest.get(l.destinationId) ?? [];
    arr.push(l.categoryId);
    byDest.set(l.destinationId, arr);
  }
  return rows.map((row) => ({ row, categoryIds: byDest.get(row.id) ?? [] }));
}

/** Jumlah TravelSupport per destinasi (untuk kolom "Fasilitas" di admin). */
async function attachSupportsCount(rows: DestinationRow[]) {
  const counts = new Map<string, number>();
  if (rows.length === 0) return counts;
  const db = getDb();
  const grouped = await db
    .select({ destinationId: travelSupports.destinationId, value: count() })
    .from(travelSupports)
    .where(inArray(travelSupports.destinationId, rows.map((r) => r.id)))
    .groupBy(travelSupports.destinationId);
  for (const g of grouped) counts.set(g.destinationId, Number(g.value));
  return counts;
}

async function syncCategories(destinationId: string, categoryIds?: ID[]) {
  if (!categoryIds) return;
  const db = getDb();
  await db
    .delete(destinationCategories)
    .where(eq(destinationCategories.destinationId, destinationId));
  if (categoryIds.length > 0) {
    await db
      .insert(destinationCategories)
      .values(categoryIds.map((categoryId) => ({ destinationId, categoryId })));
  }
}

export const destinationRepository = {
  async list(
    params: PaginationParams,
    f: DestinationFilters = {},
  ): Promise<{
    items: (DestinationRow & { categoryIds: string[]; supportsCount: number })[];
    total: number;
  }> {
    const db = getDb();
    const where = buildWhere(params, f);
    const sortable = {
      name: destinations.name,
      createdAt: destinations.createdAt,
      updatedAt: destinations.updatedAt,
      elevationMeters: destinations.elevationMeters,
    } as const;
    const sortColumn =
      params.sort && params.sort in sortable
        ? sortable[params.sort as keyof typeof sortable]
        : destinations.updatedAt;

    const rows = await db
      .select()
      .from(destinations)
      .where(where)
      .orderBy(params.order === "asc" ? asc(sortColumn) : desc(sortColumn))
      .limit(params.limit)
      .offset((params.page - 1) * params.limit);

    const [totalRow] = await db
      .select({ value: count() })
      .from(destinations)
      .where(where);

    const withCats = await attachCategoryIds(rows);
    const counts = await attachSupportsCount(rows);
    return {
      items: withCats.map(({ row, categoryIds }) => ({
        ...row,
        categoryIds,
        supportsCount: counts.get(row.id) ?? 0,
      })),
      total: Number(totalRow?.value ?? 0),
    };
  },

  async findBySlug(
    slug: string,
  ): Promise<(DestinationRow & { categoryIds: string[] }) | null> {
    const db = getDb();
    const row = await db.query.destinations.findFirst({
      where: eq(destinations.slug, slug),
    });
    if (!row) return null;
    const [withCats] = await attachCategoryIds([row]);
    return { ...row, categoryIds: withCats?.categoryIds ?? [] };
  },

  async findById(
    id: string,
  ): Promise<(DestinationRow & { categoryIds: string[] }) | null> {
    const db = getDb();
    const row = await db.query.destinations.findFirst({
      where: eq(destinations.id, id),
    });
    if (!row) return null;
    const [withCats] = await attachCategoryIds([row]);
    return { ...row, categoryIds: withCats?.categoryIds ?? [] };
  },

  async create(input: CreateDestinationInput): Promise<DestinationRow> {
    const db = getDb();
    const values: NewDestinationRow = {
      name: input.name,
      slug: input.slug,
      tagline: input.tagline ?? "",
      description: input.description ?? "",
      terrain: input.terrain ?? [],
      activities: input.activities ?? [],
      difficulty: input.difficulty ?? "ramah-pemula",
      status: input.status ?? "draft",
      bestSeason: input.bestSeason ?? [],
      location: input.location,
      access: input.access,
      facilities: input.facilities,
      entryFee: input.entryFee,
      images: input.images ?? [],
      tags: input.tags ?? [],
      elevationMeters: input.elevationMeters,
      guideRequired: input.guideRequired ?? false,
    };
    const [row] = await db.insert(destinations).values(values).returning();
    if (!row) throw new Error("Gagal membuat destinasi");
    await syncCategories(row.id, input.categoryIds);
    return row;
  },

  async update(
    id: string,
    input: UpdateDestinationInput,
  ): Promise<DestinationRow | null> {
    const db = getDb();
    const { categoryIds, ...rest } = input;
    const [row] = await db
      .update(destinations)
      .set({ ...rest, updatedAt: new Date() })
      .where(eq(destinations.id, id))
      .returning();
    if (!row) return null;
    await syncCategories(id, categoryIds);
    return row;
  },

  async remove(id: string): Promise<boolean> {
    const db = getDb();
    const rows = await db
      .delete(destinations)
      .where(eq(destinations.id, id))
      .returning({ id: destinations.id });
    return rows.length > 0;
  },

  async countBySlug(slug: string, excludeId?: string): Promise<number> {
    const db = getDb();
    const where = excludeId
      ? and(eq(destinations.slug, slug), ne(destinations.id, excludeId))
      : eq(destinations.slug, slug);
    const [row] = await db
      .select({ value: count() })
      .from(destinations)
      .where(where);
    return Number(row?.value ?? 0);
  },

  async stats(): Promise<{ total: number; published: number; draft: number }> {
    const db = getDb();
    const rows = await db
      .select({ status: destinations.status, value: count() })
      .from(destinations)
      .groupBy(destinations.status);
    let total = 0;
    let published = 0;
    let draft = 0;
    for (const r of rows) {
      const v = Number(r.value);
      total += v;
      if (r.status === "published") published = v;
      if (r.status === "draft") draft = v;
    }
    return { total, published, draft };
  },
};
