import type { Destination, TravelSupport } from "@dolenae/types";
import type { DestinationRow, TravelSupportRow } from "../db/schema";
import {
  destinationRepository,
  type CreateDestinationInput,
  type DestinationFilters,
  type UpdateDestinationInput,
} from "../repositories/destination.repository";
import { travelSupportRepository } from "../repositories/travel-support.repository";
import { toTravelSupport } from "./travel-support.service";
import { slugify } from "./category.service";
import { paginate, type PaginationParams } from "../utils/pagination";
import type { Paginated } from "../types/api";
import { ConflictError, NotFoundError } from "../utils/errors";

export type DestinationWithCategories = Destination;

export function toDestination(
  row: DestinationRow & { categoryIds?: string[]; supportsCount?: number },
): DestinationWithCategories {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    tagline: row.tagline,
    description: row.description,
    terrain: row.terrain,
    activities: row.activities,
    difficulty: row.difficulty,
    status: row.status,
    bestSeason: row.bestSeason,
    location: row.location,
    access: row.access,
    facilities: row.facilities,
    entryFee: row.entryFee ?? undefined,
    images: row.images,
    tags: row.tags,
    elevationMeters: row.elevationMeters ?? undefined,
    guideRequired: row.guideRequired,
    categoryIds: row.categoryIds ?? [],
    supportsCount: row.supportsCount ?? 0,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export const destinationService = {
  async list(
    params: PaginationParams,
    filters: DestinationFilters = {},
  ): Promise<Paginated<Destination>> {
    const { items, total } = await destinationRepository.list(params, filters);
    return paginate(items.map(toDestination), total, params);
  },

  async getById(id: string): Promise<Destination> {
    const row = await destinationRepository.findById(id);
    if (!row) throw new NotFoundError("Destinasi tidak ditemukan");
    return toDestination(row);
  },

  async getDetailBySlug(
    slug: string,
  ): Promise<Destination & { supports: TravelSupport[] }> {
    const row = await destinationRepository.findBySlug(slug);
    if (!row) throw new NotFoundError("Destinasi tidak ditemukan");
    const supports = await travelSupportRepository.listByDestination(row.id);
    return { ...toDestination(row), supports: supports.map(toTravelSupport) };
  },

  async create(input: CreateDestinationInput): Promise<Destination> {
    const slug = input.slug ? slugify(input.slug) : slugify(input.name);
    if (await destinationRepository.countBySlug(slug)) {
      throw new ConflictError(`Slug destinasi "${slug}" sudah dipakai`);
    }
    const row = await destinationRepository.create({ ...input, slug });
    return toDestination({ ...row, categoryIds: input.categoryIds ?? [] });
  },

  async update(
    id: string,
    input: UpdateDestinationInput,
  ): Promise<Destination> {
    const existing = await destinationRepository.findById(id);
    if (!existing) throw new NotFoundError("Destinasi tidak ditemukan");

    const patch: UpdateDestinationInput = { ...input };
    if (input.slug || input.name) {
      const slug = slugify(input.slug ?? input.name ?? existing.slug);
      if (await destinationRepository.countBySlug(slug, id)) {
        throw new ConflictError(`Slug destinasi "${slug}" sudah dipakai`);
      }
      patch.slug = slug;
    }

    const row = await destinationRepository.update(id, patch);
    if (!row) throw new NotFoundError("Destinasi tidak ditemukan");

    const refreshed = await destinationRepository.findById(id);
    return toDestination(refreshed ?? { ...row, categoryIds: existing.categoryIds });
  },

  async remove(id: string): Promise<void> {
    const ok = await destinationRepository.remove(id);
    if (!ok) throw new NotFoundError("Destinasi tidak ditemukan");
  },

  async stats() {
    return destinationRepository.stats();
  },
};

export type { TravelSupportRow };
