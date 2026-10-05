import type { TravelSupport, TransportMode } from "@dolenae/types";
import type { TravelSupportRow } from "../db/schema";
import {
  travelSupportRepository,
  type CreateTravelSupportInput,
  type UpdateTravelSupportInput,
} from "../repositories/travel-support.repository";
import { paginate, type PaginationParams } from "../utils/pagination";
import type { Paginated } from "../types/api";
import { NotFoundError } from "../utils/errors";

/** Baris DB (flat) -> objek domain berdiskriminator (bersih per tipe). */
export function toTravelSupport(row: TravelSupportRow): TravelSupport {
  const base = {
    id: row.id,
    name: row.name,
    destinationId: row.destinationId,
    description: row.description,
    priceRange: row.priceRange,
    contact: row.contact,
    image: row.image ?? undefined,
    verified: row.verified,
    tags: row.tags,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };

  switch (row.type) {
    case "accommodation":
      return {
        ...base,
        type: "accommodation",
        pricePerNight: row.pricePerNight ?? 0,
        capacity: row.capacity ?? "",
        facilities: row.facilities ?? [],
      };
    case "transport":
      return {
        ...base,
        type: "transport",
        mode: (row.mode ?? "mobil") as TransportMode,
        capacitySeats: row.capacitySeats ?? undefined,
        routes: row.routes ?? [],
        price: row.price ?? 0,
      };
    case "food":
      return {
        ...base,
        type: "food",
        cuisine: row.cuisine ?? [],
      };
  }
}

export const travelSupportService = {
  async listByDestination(destinationId: string): Promise<TravelSupport[]> {
    const rows = await travelSupportRepository.listByDestination(destinationId);
    return rows.map(toTravelSupport);
  },

  async list(
    params: PaginationParams,
    destinationId?: string,
    type?: TravelSupport["type"],
  ): Promise<Paginated<TravelSupport>> {
    const { items, total } = await travelSupportRepository.list(
      params,
      destinationId,
      type,
    );
    return paginate(items.map(toTravelSupport), total, params);
  },

  async getById(id: string): Promise<TravelSupport> {
    const row = await travelSupportRepository.findById(id);
    if (!row) throw new NotFoundError("Fasilitas tidak ditemukan");
    return toTravelSupport(row);
  },

  async create(input: CreateTravelSupportInput): Promise<TravelSupport> {
    const row = await travelSupportRepository.create(input);
    return toTravelSupport(row);
  },

  async update(
    id: string,
    input: UpdateTravelSupportInput,
  ): Promise<TravelSupport> {
    const row = await travelSupportRepository.update(id, input);
    if (!row) throw new NotFoundError("Fasilitas tidak ditemukan");
    return toTravelSupport(row);
  },

  async remove(id: string): Promise<void> {
    const ok = await travelSupportRepository.remove(id);
    if (!ok) throw new NotFoundError("Fasilitas tidak ditemukan");
  },
};
