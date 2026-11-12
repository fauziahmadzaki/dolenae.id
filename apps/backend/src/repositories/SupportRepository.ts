import { and, asc, count, eq, getTableColumns } from "drizzle-orm";
import { database } from "../db/DatabaseClient";
import { destinations, travelSupports } from "../db/models";
import type { JoinedTravelSupport } from "../types/support";
import type { Pagination } from "../utils/pagination";

const selection = { ...getTableColumns(travelSupports), relatedDestinationName: destinations.name };

class SupportRepository {
  private get db() {
    return database.getDb();
  }

  async findById(id: string): Promise<JoinedTravelSupport | undefined> {
    const [row] = await this.db.select(selection).from(travelSupports)
      .innerJoin(destinations, eq(travelSupports.destinationId, destinations.id))
      .where(and(eq(travelSupports.id, id), eq(destinations.status, "published"))).limit(1);
    return row;
  }

  async hasPublishedDestination(id: string): Promise<boolean> {
    const [row] = await this.db.select({ id: destinations.id }).from(destinations)
      .where(and(eq(destinations.id, id), eq(destinations.status, "published"))).limit(1);
    return Boolean(row);
  }

  async list(destinationId: string, { limit, offset }: Pagination): Promise<{ items: JoinedTravelSupport[]; total: number }> {
    const db = this.db;
    const where = and(eq(travelSupports.destinationId, destinationId), eq(destinations.status, "published"));
    const items = await db.select(selection).from(travelSupports)
      .innerJoin(destinations, eq(travelSupports.destinationId, destinations.id))
      .where(where)
      .orderBy(asc(travelSupports.category), asc(travelSupports.name), asc(travelSupports.id))
      .limit(limit).offset(offset);
    const [total] = await db.select({ value: count() }).from(travelSupports)
      .innerJoin(destinations, eq(travelSupports.destinationId, destinations.id)).where(where);
    return { items, total: Number(total?.value ?? 0) };
  }
}

export const supportRepository = new SupportRepository();
