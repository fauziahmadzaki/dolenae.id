import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  ilike,
  inArray,
  or,
  type SQL,
} from "drizzle-orm";
import { database } from "../db/DatabaseClient";
import {
  destinations,
  facilities,
  type FacilityCategory,
  type FacilityStatus,
  type NewFacilityRow,
} from "../db/models";
import type { Pagination } from "../utils/pagination";

export type JoinedFacility = FacilityRowWithDestination;
type FacilityRowWithDestination = typeof facilities.$inferSelect & {
  destinationName: string;
};

const selection = {
  ...getTableColumns(facilities),
  destinationName: destinations.name,
};

export type FacilityListParams = Pagination & {
  destinationId?: string;
  ownerId?: string;
  statuses?: FacilityStatus[];
  category?: FacilityCategory;
  type?: string;
  /** Only facilities attached to a published destination (public listing). */
  publishedDestinationOnly?: boolean;
};

class FacilityRepository {
  private get db() {
    return database.getDb();
  }

  async findById(id: string): Promise<JoinedFacility | undefined> {
    const [row] = await this.db
      .select(selection)
      .from(facilities)
      .innerJoin(destinations, eq(facilities.destinationId, destinations.id))
      .where(eq(facilities.id, id))
      .limit(1);
    return row;
  }

  /**
   * Published facilities of one destination, grouped by `type`.
   * Used to build the destination detail amenity summary.
   */
  async countPublishedTypes(
    destinationId: string,
  ): Promise<{ type: string; total: number }[]> {
    const rows = await this.db
      .select({ type: facilities.type, value: count() })
      .from(facilities)
      .where(
        and(
          eq(facilities.destinationId, destinationId),
          eq(facilities.status, "published"),
        ),
      )
      .groupBy(facilities.type);
    return rows.map((row) => ({ type: row.type, total: Number(row.value) }));
  }

  async list(
    params: FacilityListParams,
  ): Promise<{ items: JoinedFacility[]; total: number }> {
    const db = this.db;
    const conditions: SQL[] = [];
    if (params.destinationId) {
      conditions.push(eq(facilities.destinationId, params.destinationId));
    }
    if (params.ownerId) {
      conditions.push(eq(facilities.ownerId, params.ownerId));
    }
    if (params.statuses?.length) {
      conditions.push(inArray(facilities.status, params.statuses));
    }
    if (params.category) {
      conditions.push(eq(facilities.category, params.category));
    }
    if (params.type) {
      conditions.push(ilike(facilities.type, `%${params.type}%`));
    }
    if (params.search) {
      const pattern = `%${params.search}%`;
      const search = or(ilike(facilities.name, pattern), ilike(destinations.name, pattern));
      if (search) conditions.push(search);
    }
    if (params.publishedDestinationOnly) {
      conditions.push(eq(destinations.status, "published"));
    }
    const where = conditions.length ? and(...conditions) : undefined;
    const byDate = params.sort === "createdAt";
    const order = byDate || params.sort === "name" ? params.order : "asc";
    const direction = order === "desc" ? desc : asc;

    const items = await db
      .select(selection)
      .from(facilities)
      .innerJoin(destinations, eq(facilities.destinationId, destinations.id))
      .where(where)
      .orderBy(direction(byDate ? facilities.createdAt : facilities.name), asc(facilities.id))
      .limit(params.limit)
      .offset(params.offset);

    const [total] = await db
      .select({ value: count() })
      .from(facilities)
      .innerJoin(destinations, eq(facilities.destinationId, destinations.id))
      .where(where);

    return { items, total: Number(total?.value ?? 0) };
  }

  async create(data: NewFacilityRow): Promise<JoinedFacility> {
    const [row] = await this.db
      .insert(facilities)
      .values(data)
      .returning({ id: facilities.id });
    const created = row ? await this.findById(row.id) : undefined;
    if (!created) throw new Error("Gagal menyimpan fasilitas");
    return created;
  }

  async update(
    id: string,
    patch: Partial<NewFacilityRow>,
  ): Promise<JoinedFacility | undefined> {
    const [row] = await this.db
      .update(facilities)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(facilities.id, id))
      .returning({ id: facilities.id });
    if (!row) return undefined;
    return this.findById(row.id);
  }

  async delete(id: string): Promise<boolean> {
    const [row] = await this.db
      .delete(facilities)
      .where(eq(facilities.id, id))
      .returning({ id: facilities.id });
    return Boolean(row);
  }
}

export const facilityRepository = new FacilityRepository();
