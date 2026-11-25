import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "wisatawan",
  "merchant",
  "admin",
]);

export const authProviderEnum = pgEnum("auth_provider", ["local", "google"]);

export const categoryTypeEnum = pgEnum("category_type", ["terrain", "activity"]);

export const difficultyEnum = pgEnum("difficulty", [
  "ramah-pemula",
  "menengah",
  "sulit",
]);

export const destinationStatusEnum = pgEnum("destination_status", [
  "draft",
  "published",
  "archived",
]);

export const facilityCategoryEnum = pgEnum("facility_category", [
  "transport",
  "accommodation",
  "food",
]);

export const facilityStatusEnum = pgEnum("facility_status", [
  "draft",
  "pending",
  "published",
  "rejected",
  "archived",
]);

export const trackNodeTypeEnum = pgEnum("track_node_type", [
  "basecamp",
  "gerbang",
  "parkir",
  "pos",
  "sumber-air",
  "viewpoint",
  "puncak",
  "persimpangan",
  "area-camp",
]);

export const routeSurfaceEnum = pgEnum("route_surface", [
  "setapak",
  "aspal",
  "tanah",
  "tanah-liat",
  "batu",
  "pasir",
]);

export const routeGradeEnum = pgEnum("route_grade", [
  "datar",
  "landai",
  "sedang",
  "terjal",
  "sangat-terjal",
]);

export const routeStatusEnum = pgEnum("route_status", [
  "draft",
  "diterbitkan",
  "terverifikasi",
]);

/** Editorial content type for the admin Konten page and the public blog. */
export const contentKindEnum = pgEnum("content_kind", [
  "artikel",
  "panduan",
  "tips",
]);

/** Publishing state of an editorial content entry. */
export const contentStatusEnum = pgEnum("content_status", [
  "draft",
  "pending",
  "published",
]);

/** Condition shown for a whole trail (segments keep `routeStatusEnum`). */
export const trailRouteStatusEnum = pgEnum("trail_route_status", [
  "terverifikasi",
  "alternatif",
  "dalam-perbaikan",
  "rusak",
  "terlarang",
]);
