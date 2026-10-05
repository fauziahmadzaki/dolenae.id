import { and, asc, count, desc, eq } from "drizzle-orm";
import { getDb } from "../db/client";
import {
  travelSupports,
  type NewTravelSupportRow,
  type TravelSupportRow,
} from "../db/schema";
import type { PaginationParams } from "../utils/pagination";
import type { PriceRange, TravelSupportType, TransportMode } from "@dolenae/types";

export interface CreateTravelSupportInput {
  destinationId: string;
  type: TravelSupportType;
  name: string;
  description?: string;
  priceRange?: PriceRange;
  contact?: { phone?: string; whatsapp?: string; instagram?: string };
  image?: string;
  verified?: boolean;
  tags?: string[];
  pricePerNight?: number;
  capacity?: string;
  facilities?: string[];
  mode?: TransportMode;
  capacitySeats?: number;
  routes?: string[];
  price?: number;
  cuisine?: string[];
}

export type UpdateTravelSupportInput = Partial<
  Omit<CreateTravelSupportInput, "destinationId">
>;

export const travelSupportRepository = {
  async listByDestination(destinationId: string): Promise<TravelSupportRow[]> {
    const db = getDb();
    return db
      .select()
      .from(travelSupports)
      .where(eq(travelSupports.destinationId, destinationId))
      .orderBy(asc(travelSupports.type), asc(travelSupports.name));
  },

  async list(
    params: PaginationParams,
    destinationId?: string,
    type?: TravelSupportType,
  ): Promise<{ items: TravelSupportRow[]; total: number }> {
    const db = getDb();
    const filters = [];
    if (destinationId) filters.push(eq(travelSupports.destinationId, destinationId));
    if (type) filters.push(eq(travelSupports.type, type));
    const where = filters.length ? and(...filters) : undefined;

    const items = await db
      .select()
      .from(travelSupports)
      .where(where)
      .orderBy(desc(travelSupports.createdAt))
      .limit(params.limit)
      .offset((params.page - 1) * params.limit);
    const [totalRow] = await db
      .select({ value: count() })
      .from(travelSupports)
      .where(where);
    return { items, total: Number(totalRow?.value ?? 0) };
  },

  async findById(id: string): Promise<TravelSupportRow | null> {
    const db = getDb();
    const row = await db.query.travelSupports.findFirst({
      where: eq(travelSupports.id, id),
    });
    return row ?? null;
  },

  async create(input: CreateTravelSupportInput): Promise<TravelSupportRow> {
    const db = getDb();
    const values: NewTravelSupportRow = {
      destinationId: input.destinationId,
      type: input.type,
      name: input.name,
      description: input.description ?? "",
      priceRange: input.priceRange ?? "ekonomis",
      contact: input.contact ?? {},
      image: input.image,
      verified: input.verified ?? false,
      tags: input.tags ?? [],
      pricePerNight: input.pricePerNight,
      capacity: input.capacity,
      facilities: input.facilities,
      mode: input.mode,
      capacitySeats: input.capacitySeats,
      routes: input.routes,
      price: input.price,
      cuisine: input.cuisine,
    };
    const [row] = await db.insert(travelSupports).values(values).returning();
    if (!row) throw new Error("Gagal membuat fasilitas");
    return row;
  },

  async update(
    id: string,
    input: UpdateTravelSupportInput,
  ): Promise<TravelSupportRow | null> {
    const db = getDb();
    const [row] = await db
      .update(travelSupports)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(travelSupports.id, id))
      .returning();
    return row ?? null;
  },

  async remove(id: string): Promise<boolean> {
    const db = getDb();
    const rows = await db
      .delete(travelSupports)
      .where(eq(travelSupports.id, id))
      .returning({ id: travelSupports.id });
    return rows.length > 0;
  },
};
