import { and, asc, count, eq, getTableColumns } from "drizzle-orm";
import { getDb } from "../db/client";
import { destinations, travelSupports, type TravelSupportRow } from "../db/schema";
import type { Pagination } from "../utils/pagination";

export type JoinedTravelSupport = TravelSupportRow & { relatedDestinationName: string };
const selection = { ...getTableColumns(travelSupports), relatedDestinationName: destinations.name };

export const supportRepository = {
  async findById(id: string): Promise<JoinedTravelSupport | undefined> {
    const [row] = await getDb().select(selection).from(travelSupports)
      .innerJoin(destinations, eq(travelSupports.destinationId, destinations.id))
      .where(and(eq(travelSupports.id, id), eq(destinations.status, "published"))).limit(1);
    return row;
  },
  async hasPublishedDestination(id: string): Promise<boolean> {
    const [row] = await getDb().select({ id: destinations.id }).from(destinations)
      .where(and(eq(destinations.id, id), eq(destinations.status, "published"))).limit(1);
    return Boolean(row);
  },

  async list(destinationId: string, { limit, offset }: Pagination): Promise<{ items: JoinedTravelSupport[]; total: number }> {
    const db = getDb();
    const where = and(eq(travelSupports.destinationId, destinationId), eq(destinations.status, "published"));
    const items = await db.select(selection).from(travelSupports)
      .innerJoin(destinations, eq(travelSupports.destinationId, destinations.id))
      .where(where)
      .orderBy(asc(travelSupports.category), asc(travelSupports.name), asc(travelSupports.id))
      .limit(limit).offset(offset);
    const [total] = await db.select({ value: count() }).from(travelSupports)
      .innerJoin(destinations, eq(travelSupports.destinationId, destinations.id)).where(where);
    return { items, total: Number(total?.value ?? 0) };
  },
};
