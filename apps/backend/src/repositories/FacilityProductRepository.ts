import { and, asc, count, eq, getTableColumns, ilike, type SQL } from "drizzle-orm";
import { database } from "../db/DatabaseClient";
import {
  destinations,
  facilities,
  facilityProducts,
  type FacilityProductRow,
  type NewFacilityProductRow,
} from "../db/models";
import type { Pagination } from "../utils/pagination";

export type JoinedMerchantProduct = FacilityProductRow & {
  facilityName: string;
  destinationName: string;
};

const merchantSelection = {
  ...getTableColumns(facilityProducts),
  facilityName: facilities.name,
  destinationName: destinations.name,
};

export type MerchantProductListParams = Pagination & {
  ownerId?: string;
  facilityId?: string;
};

class FacilityProductRepository {
  private get db() {
    return database.getDb();
  }

  async listByFacility(facilityId: string): Promise<FacilityProductRow[]> {
    return this.db
      .select()
      .from(facilityProducts)
      .where(eq(facilityProducts.facilityId, facilityId))
      .orderBy(asc(facilityProducts.position), asc(facilityProducts.name));
  }

  /** Cross-facility listing used by the merchant "Semua produk" page. */
  async listByOwner(
    params: MerchantProductListParams,
  ): Promise<{ items: JoinedMerchantProduct[]; total: number }> {
    const db = this.db;
    const conditions: SQL[] = [];
    if (params.ownerId) {
      conditions.push(eq(facilities.ownerId, params.ownerId));
    }
    if (params.facilityId) {
      conditions.push(eq(facilityProducts.facilityId, params.facilityId));
    }
    if (params.search) {
      conditions.push(ilike(facilityProducts.name, `%${params.search}%`));
    }
    const where = conditions.length ? and(...conditions) : undefined;

    const items = await db
      .select(merchantSelection)
      .from(facilityProducts)
      .innerJoin(facilities, eq(facilityProducts.facilityId, facilities.id))
      .innerJoin(destinations, eq(facilities.destinationId, destinations.id))
      .where(where)
      .orderBy(asc(facilities.name), asc(facilityProducts.position), asc(facilityProducts.name))
      .limit(params.limit)
      .offset(params.offset);

    const [total] = await db
      .select({ value: count() })
      .from(facilityProducts)
      .innerJoin(facilities, eq(facilityProducts.facilityId, facilities.id))
      .innerJoin(destinations, eq(facilities.destinationId, destinations.id))
      .where(where);

    return { items, total: Number(total?.value ?? 0) };
  }

  async findById(id: string): Promise<FacilityProductRow | undefined> {
    const [row] = await this.db
      .select()
      .from(facilityProducts)
      .where(eq(facilityProducts.id, id))
      .limit(1);
    return row;
  }

  async create(data: NewFacilityProductRow): Promise<FacilityProductRow> {
    const [row] = await this.db
      .insert(facilityProducts)
      .values(data)
      .returning();
    if (!row) throw new Error("Gagal menyimpan produk fasilitas");
    return row;
  }

  async update(
    id: string,
    patch: Partial<NewFacilityProductRow>,
  ): Promise<FacilityProductRow | undefined> {
    const [row] = await this.db
      .update(facilityProducts)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(facilityProducts.id, id))
      .returning();
    return row;
  }

  async delete(id: string): Promise<boolean> {
    const [row] = await this.db
      .delete(facilityProducts)
      .where(eq(facilityProducts.id, id))
      .returning({ id: facilityProducts.id });
    return Boolean(row);
  }
}

export const facilityProductRepository = new FacilityProductRepository();
