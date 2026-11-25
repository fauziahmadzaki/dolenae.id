import type { z } from "zod";
import type { FacilityCategory, FacilityStatus } from "../db/models";
import type {
  createFacilityProductSchema,
  createFacilitySchema,
  facilityIdParamsSchema,
  facilityListQuerySchema,
  facilityProductParamsSchema,
  productListQuerySchema,
  updateFacilityProductSchema,
  updateFacilitySchema,
} from "../schemas/facility.schema";

export const FACILITY_CATEGORIES = [
  "transport",
  "accommodation",
  "food",
] as const;

export const FACILITY_STATUSES = [
  "draft",
  "pending",
  "published",
  "rejected",
  "archived",
] as const;

export type CreateFacilityBody = z.infer<typeof createFacilitySchema>;
export type UpdateFacilityBody = z.infer<typeof updateFacilitySchema>;
export type FacilityIdParams = z.infer<typeof facilityIdParamsSchema>;
export type FacilityListQuery = z.infer<typeof facilityListQuerySchema>;
export type FacilityProductParams = z.infer<typeof facilityProductParamsSchema>;
export type ProductListQuery = z.infer<typeof productListQuerySchema>;
export type CreateFacilityProductBody = z.infer<
  typeof createFacilityProductSchema
>;
export type UpdateFacilityProductBody = z.infer<
  typeof updateFacilityProductSchema
>;

/** Facility shape sent to clients (web + mobile). */
export interface PublicFacility {
  id: string;
  destinationId: string;
  destinationName: string;
  ownerId: string | null;
  name: string;
  category: FacilityCategory;
  type: string;
  location: { latitude: number; longitude: number };
  priceMin: number | null;
  priceMax: number | null;
  description: string | null;
  contact: string;
  contactEmail: string | null;
  website: string | null;
  bannerUrl: string | null;
  status: FacilityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PublicFacilityProduct {
  id: string;
  facilityId: string;
  name: string;
  description: string | null;
  bannerUrl: string | null;
  price: number;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicFacilityDetail extends PublicFacility {
  products: PublicFacilityProduct[];
}

/** Product row joined with its facility/destination for merchant listings. */
export interface PublicMerchantProduct extends PublicFacilityProduct {
  facilityName: string;
  destinationName: string;
}

/**
 * Legacy `travel_supports` response shape kept for the `/api/supports`
 * compatibility endpoints consumed by the mobile app.
 */
export interface LegacyTravelSupport {
  id: string;
  destinationId: string;
  name: string;
  category: FacilityCategory;
  description: string | null;
  locationLabel: null;
  capacity: null;
  distanceLabel: null;
  priceLabel: string | null;
  priceUnit: null;
  priceMin: number | null;
  priceMax: number | null;
  contactPhone: string | null;
  contactWhatsapp: null;
  contactInstagram: null;
  imageUrl: string | null;
  facilities: string[];
  routes: string[];
  cuisine: string[];
  includesDriver: false;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  relatedDestinationName: string;
}
