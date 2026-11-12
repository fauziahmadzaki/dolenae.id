// Manual domain types (kept in sync with the backend by hand).
export type UserRole = "wisatawan" | "merchant" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export type CategoryType = "terrain" | "activity";

export interface Category {
  id: string;
  name: string;
  slug: string;
  type: CategoryType;
  icon: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export type Difficulty = "ramah-pemula" | "menengah" | "sulit";

export type DestinationStatus = "draft" | "published" | "archived";

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

export interface Destination {
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

export interface DestinationDetail extends Destination {
  categories: Category[];
}
