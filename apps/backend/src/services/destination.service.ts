import type {
  DestinationRow,
  DestinationStatus,
  Difficulty,
} from "../db/schema";
import { categoryRepository } from "../repositories/category.repository";
import { destinationRepository } from "../repositories/destination.repository";
import { buildMeta, toPagination, type PaginationQuery } from "../utils/pagination";
import type { ApiMeta } from "../types/api";
import { BadRequestError, ConflictError, NotFoundError } from "../utils/errors";
import { slugify } from "../utils/slug";
import { toPublicCategory, type PublicCategory } from "./category.service";

export interface DestinationLocation {
  province: string | null;
  regency: string | null;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
  accessPoint: string | null;
}

export interface DestinationAccess {
  description: string | null;
  transport: string[];
  duration: string | null;
  distanceKm: number | null;
}

/** Destination shape sent to clients (web + mobile). */
export interface PublicDestination {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  difficulty: Difficulty;
  bestSeason: string[];
  tags: string[];
  terrain: string[];
  activities: string[];
  location: DestinationLocation;
  access: DestinationAccess;
  facilities: string[];
  entryFee: number | null;
  elevationMeters: number | null;
  images: string[];
  guideRequired: boolean;
  status: DestinationStatus;
  verified: boolean;
  categoryIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PublicDestinationDetail extends PublicDestination {
  categories: PublicCategory[];
}

export interface CreateDestinationDto {
  name: string;
  slug?: string;
  tagline?: string | null;
  description?: string | null;
  difficulty?: Difficulty;
  bestSeason?: string[];
  tags?: string[];
  terrain?: string[];
  activities?: string[];
  location?: Partial<DestinationLocation>;
  access?: Partial<DestinationAccess>;
  facilities?: string[];
  entryFee?: number | null;
  elevationMeters?: number | null;
  images?: string[];
  guideRequired?: boolean;
  status?: DestinationStatus;
  categoryIds?: string[];
}

export type UpdateDestinationDto = Partial<CreateDestinationDto>;

const toNumber = (value: string | null): number | null =>
  value === null ? null : Number(value);

const toNumeric = (value: number | null | undefined): string | null =>
  value === null || value === undefined ? null : String(value);

type CategoryLookup = Map<string, PublicCategory>;

function toPublicDestination(
  row: DestinationRow,
  categoryIds: string[],
): PublicDestination {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    tagline: row.tagline,
    description: row.description,
    difficulty: row.difficulty,
    bestSeason: row.bestSeason,
    tags: row.tags,
    terrain: row.terrain,
    activities: row.activities,
    location: {
      province: row.province,
      regency: row.regency,
      district: row.district,
      latitude: toNumber(row.latitude),
      longitude: toNumber(row.longitude),
      accessPoint: row.accessPoint,
    },
    access: {
      description: row.accessDescription,
      transport: row.accessTransport,
      duration: row.accessDuration,
      distanceKm: toNumber(row.accessDistanceKm),
    },
    facilities: row.facilities,
    entryFee: row.entryFee,
    elevationMeters: row.elevationMeters,
    images: row.images,
    guideRequired: row.guideRequired,
    status: row.status,
    verified: row.verified,
    categoryIds,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Validate category ids and build a lookup map for the response. */
async function resolveCategories(
  categoryIds: string[],
): Promise<CategoryLookup> {
  const unique = [...new Set(categoryIds)];
  const rows = await categoryRepository.findByIds(unique);
  const found = new Set(rows.map((row) => row.id));
  const missing = unique.filter((id) => !found.has(id));
  if (missing.length > 0) {
    throw new BadRequestError("Kategori tidak ditemukan", { categoryIds: missing });
  }
  return new Map(rows.map((row) => [row.id, toPublicCategory(row)]));
}

export const destinationService = {
  async getById(id: string): Promise<PublicDestinationDetail> {
    const row = await destinationRepository.findById(id);
    if (!row) throw new NotFoundError("Destinasi tidak ditemukan");
    const categoryIds = await destinationRepository.findCategoryIds(id);
    const lookup = await resolveCategories(categoryIds);
    const categories = categoryIds
      .map((categoryId) => lookup.get(categoryId))
      .filter((c): c is PublicCategory => Boolean(c));
    return { ...toPublicDestination(row, categoryIds), categories };
  },

  async list(
    query: PaginationQuery & {
      difficulty?: Difficulty;
      status?: DestinationStatus;
      categoryId?: string;
    },
  ): Promise<{ items: PublicDestination[]; meta: ApiMeta }> {
    const pagination = toPagination(query);
    const { items, total } = await destinationRepository.list({
      ...pagination,
      difficulty: query.difficulty,
      status: query.status,
      categoryId: query.categoryId,
    });
    // One pivot query for the whole page, grouped in memory.
    const links = await destinationRepository.findCategoryLinks(
      items.map((row) => row.id),
    );
    const linked = new Map<string, string[]>();
    for (const link of links) {
      const list = linked.get(link.destinationId) ?? [];
      list.push(link.categoryId);
      linked.set(link.destinationId, list);
    }
    return {
      items: items.map((row) =>
        toPublicDestination(row, linked.get(row.id) ?? []),
      ),
      meta: buildMeta(total, query.page, query.limit),
    };
  },

  async create(input: CreateDestinationDto): Promise<PublicDestinationDetail> {
    const slug = input.slug?.trim() || slugify(input.name);
    if (!slug) throw new BadRequestError("Slug destinasi tidak valid");
    if (await destinationRepository.slugExists(slug)) {
      throw new ConflictError("Slug destinasi sudah dipakai");
    }

    const categoryIds = [...new Set(input.categoryIds ?? [])];
    if (categoryIds.length > 0) await resolveCategories(categoryIds);

    const row = await destinationRepository.create({
      name: input.name,
      slug,
      tagline: input.tagline ?? null,
      description: input.description ?? null,
      difficulty: input.difficulty ?? "menengah",
      bestSeason: input.bestSeason ?? [],
      tags: input.tags ?? [],
      terrain: input.terrain ?? [],
      activities: input.activities ?? [],
      province: input.location?.province ?? null,
      regency: input.location?.regency ?? null,
      district: input.location?.district ?? null,
      latitude: toNumeric(input.location?.latitude),
      longitude: toNumeric(input.location?.longitude),
      accessPoint: input.location?.accessPoint ?? null,
      accessDescription: input.access?.description ?? null,
      accessTransport: input.access?.transport ?? [],
      accessDuration: input.access?.duration ?? null,
      accessDistanceKm: toNumeric(input.access?.distanceKm),
      facilities: input.facilities ?? [],
      entryFee: input.entryFee ?? null,
      elevationMeters: input.elevationMeters ?? null,
      images: input.images ?? [],
      guideRequired: input.guideRequired ?? false,
      status: input.status ?? "draft",
    });

    if (categoryIds.length > 0) {
      await destinationRepository.replaceCategories(row.id, categoryIds);
    }

    return this.getById(row.id);
  },

  async update(
    id: string,
    input: UpdateDestinationDto,
  ): Promise<PublicDestinationDetail> {
    const existing = await destinationRepository.findById(id);
    if (!existing) throw new NotFoundError("Destinasi tidak ditemukan");

    const nextSlug =
      input.slug !== undefined && input.slug.trim() !== ""
        ? input.slug.trim()
        : undefined;

    if (nextSlug && nextSlug !== existing.slug) {
      if (await destinationRepository.slugExists(nextSlug, id)) {
        throw new ConflictError("Slug destinasi sudah dipakai");
      }
    }

    let categoryIds: string[] | undefined;
    if (input.categoryIds !== undefined) {
      categoryIds = [...new Set(input.categoryIds)];
      if (categoryIds.length > 0) await resolveCategories(categoryIds);
    }

    const patch: Parameters<typeof destinationRepository.update>[1] = {};
    if (input.name !== undefined) patch.name = input.name;
    if (nextSlug) patch.slug = nextSlug;
    if (input.tagline !== undefined) patch.tagline = input.tagline;
    if (input.description !== undefined) patch.description = input.description;
    if (input.difficulty !== undefined) patch.difficulty = input.difficulty;
    if (input.bestSeason !== undefined) patch.bestSeason = input.bestSeason;
    if (input.tags !== undefined) patch.tags = input.tags;
    if (input.terrain !== undefined) patch.terrain = input.terrain;
    if (input.activities !== undefined) patch.activities = input.activities;
    if (input.location !== undefined) {
      if (input.location.province !== undefined) patch.province = input.location.province;
      if (input.location.regency !== undefined) patch.regency = input.location.regency;
      if (input.location.district !== undefined) patch.district = input.location.district;
      if (input.location.latitude !== undefined) {
        patch.latitude = toNumeric(input.location.latitude);
      }
      if (input.location.longitude !== undefined) {
        patch.longitude = toNumeric(input.location.longitude);
      }
      if (input.location.accessPoint !== undefined) {
        patch.accessPoint = input.location.accessPoint;
      }
    }
    if (input.access !== undefined) {
      if (input.access.description !== undefined) {
        patch.accessDescription = input.access.description;
      }
      if (input.access.transport !== undefined) {
        patch.accessTransport = input.access.transport;
      }
      if (input.access.duration !== undefined) patch.accessDuration = input.access.duration;
      if (input.access.distanceKm !== undefined) {
        patch.accessDistanceKm = toNumeric(input.access.distanceKm);
      }
    }
    if (input.facilities !== undefined) patch.facilities = input.facilities;
    if (input.entryFee !== undefined) patch.entryFee = input.entryFee;
    if (input.elevationMeters !== undefined) {
      patch.elevationMeters = input.elevationMeters;
    }
    if (input.images !== undefined) patch.images = input.images;
    if (input.guideRequired !== undefined) patch.guideRequired = input.guideRequired;
    if (input.status !== undefined) patch.status = input.status;

    const updated = await destinationRepository.update(id, patch);
    if (!updated) throw new NotFoundError("Destinasi tidak ditemukan");

    if (categoryIds !== undefined) {
      await destinationRepository.replaceCategories(id, categoryIds);
    }

    return this.getById(id);
  },

  async delete(id: string): Promise<{ id: string; deleted: true }> {
    const existing = await destinationRepository.findById(id);
    if (!existing) throw new NotFoundError("Destinasi tidak ditemukan");
    const deleted = await destinationRepository.delete(id);
    if (!deleted) throw new NotFoundError("Gagal menghapus destinasi");
    return { id, deleted: true };
  },
};
