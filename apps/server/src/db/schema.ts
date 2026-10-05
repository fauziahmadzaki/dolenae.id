import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import type {
  DestinationActivity,
  DestinationCondition,
  DestinationStatus,
  DestinationTerrain,
  CategoryType,
  TravelSupportType,
  PriceRange,
  TransportMode,
  UserRole,
} from "@dolenae/types";

/** Enum role user (selaras `UserRole` di `@dolenae/types`). */
export const userRoleEnum = pgEnum("user_role", [
  "wisatawan",
  "merchant",
  "admin",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull().default("wisatawan"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------- Category ----------

export const categoryTypeEnum = pgEnum("category_type", ["terrain", "activity"]);

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 140 }).notNull().unique(),
  type: categoryTypeEnum("type").notNull(),
  icon: varchar("icon", { length: 80 }).notNull().default("lucide:circle"),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------- Destination ----------

export const destinationStatusEnum = pgEnum("destination_status", [
  "draft",
  "published",
]);

export const destinationDifficultyEnum = pgEnum("destination_difficulty", [
  "ramah-pemula",
  "menengah",
  "sulit",
  "butuh-lokal-guide",
]);

export const destinations = pgTable("destinations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  tagline: varchar("tagline", { length: 200 }).notNull().default(""),
  description: text("description").notNull().default(""),
  terrain: jsonb("terrain").$type<DestinationTerrain[]>().notNull().default([]),
  activities: jsonb("activities")
    .$type<DestinationActivity[]>()
    .notNull()
    .default([]),
  difficulty: destinationDifficultyEnum("difficulty")
    .notNull()
    .default("ramah-pemula"),
  status: destinationStatusEnum("status").notNull().default("draft"),
  bestSeason: jsonb("best_season").$type<string[]>().notNull().default([]),
  location: jsonb("location").$type<{
    province: string;
    regency: string;
    district?: string;
    coordinate: { latitude: number; longitude: number };
    accessPoint?: {
      name: string;
      coordinate: { latitude: number; longitude: number };
    };
  }>().notNull(),
  access: jsonb("access").$type<{
    description: string;
    transportModes: string[];
    estimatedTravelTime: string;
    distanceKm?: number;
  }>().notNull(),
  facilities: jsonb("facilities").$type<{
    toilet?: boolean;
    warung?: boolean;
    spotRequest: boolean;
    mushola?: boolean;
    parkingArea?: boolean;
    homestayNearby?: boolean;
  }>().notNull(),
  entryFee: varchar("entry_fee", { length: 200 }),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  elevationMeters: integer("elevation_meters"),
  guideRequired: boolean("guide_required").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Join many-to-many destinasi <-> kategori. */
export const destinationCategories = pgTable(
  "destination_categories",
  {
    destinationId: uuid("destination_id")
      .notNull()
      .references(() => destinations.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.destinationId, t.categoryId] })],
);

// ---------- TravelSupport ----------

export const travelSupportTypeEnum = pgEnum("travel_support_type", [
  "accommodation",
  "transport",
  "food",
]);

export const priceRangeEnum = pgEnum("price_range", [
  "ekonomis",
  "menengah",
  "premium",
]);

export const travelSupports = pgTable("travel_supports", {
  id: uuid("id").primaryKey().defaultRandom(),
  destinationId: uuid("destination_id")
    .notNull()
    .references(() => destinations.id, { onDelete: "cascade" }),
  type: travelSupportTypeEnum("type").notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  description: text("description").notNull().default(""),
  priceRange: priceRangeEnum("price_range").notNull().default("ekonomis"),
  contact: jsonb("contact").$type<{
    phone?: string;
    whatsapp?: string;
    instagram?: string;
  }>().notNull().default({}),
  image: varchar("image", { length: 300 }),
  verified: boolean("verified").notNull().default(false),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),

  // accommodation
  pricePerNight: integer("price_per_night"),
  capacity: varchar("capacity", { length: 80 }),
  facilities: jsonb("facilities").$type<string[]>(),

  // transport
  mode: varchar("mode", { length: 40 }),
  capacitySeats: integer("capacity_seats"),
  routes: jsonb("routes").$type<string[]>(),
  price: integer("price"),

  // food
  cuisine: jsonb("cuisine").$type<string[]>(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
export type CategoryRow = typeof categories.$inferSelect;
export type NewCategoryRow = typeof categories.$inferInsert;
export type DestinationRow = typeof destinations.$inferSelect;
export type NewDestinationRow = typeof destinations.$inferInsert;
export type TravelSupportRow = typeof travelSupports.$inferSelect;
export type NewTravelSupportRow = typeof travelSupports.$inferInsert;

/** Pastikan union di schema tetap sinkron dengan tipe domain. */
const _checks: [
  UserRole,
  CategoryType,
  DestinationStatus,
  DestinationCondition,
  TravelSupportType,
  PriceRange,
  TransportMode,
] = [
  userRoleEnum.enumValues[0] as UserRole,
  categoryTypeEnum.enumValues[0] as CategoryType,
  destinationStatusEnum.enumValues[0] as DestinationStatus,
  destinationDifficultyEnum.enumValues[0] as DestinationCondition,
  travelSupportTypeEnum.enumValues[0] as TravelSupportType,
  priceRangeEnum.enumValues[0] as PriceRange,
  "motor" satisfies TransportMode,
];
void _checks;
