import type { z } from "zod";
import type {
  DestinationStatus,
  Difficulty,
  NewDestinationRow,
} from "../db/models";
import type {
  createDestinationSchema,
  destinationIdParamsSchema,
  destinationListQuerySchema,
  updateDestinationSchema,
} from "../schemas/destination.schema";
import type { Pagination } from "../utils/pagination";
import type { PublicCategory } from "./category";

export type DestinationListQuery = z.infer<typeof destinationListQuerySchema>;
export type CreateDestinationBody = z.infer<typeof createDestinationSchema>;
export type UpdateDestinationBody = z.infer<typeof updateDestinationSchema>;
export type DestinationIdParams = z.infer<typeof destinationIdParamsSchema>;

/** Fields a caller may update after the destination exists. */
export type DestinationPatch = Partial<Omit<NewDestinationRow, "id">>;

/** Filter params accepted by the destination repository list query. */
export type DestinationListParams = Pagination & {
  difficulty?: Difficulty;
  status?: DestinationStatus;
  categoryId?: string;
};

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
