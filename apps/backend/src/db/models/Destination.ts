import {
  boolean,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { destinationStatusEnum, difficultyEnum } from "./enums";

export const destinations = pgTable(
  "destinations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 140 }).notNull().unique(),
    tagline: varchar("tagline", { length: 200 }),
    description: text("description"),
    // Classification
    difficulty: difficultyEnum("difficulty").notNull().default("menengah"),
    bestSeason: text("best_season").array().notNull().default([]),
    tags: text("tags").array().notNull().default([]),
    // Geography (reverse geocode via @dolenae/regions — ADR-0004)
    province: varchar("province", { length: 80 }),
    regency: varchar("regency", { length: 80 }),
    district: varchar("district", { length: 80 }),
    latitude: numeric("latitude", { precision: 10, scale: 7 }),
    longitude: numeric("longitude", { precision: 10, scale: 7 }),
    accessPoint: varchar("access_point", { length: 160 }),
    // Access
    accessDescription: text("access_description"),
    accessTransport: text("access_transport").array().notNull().default([]),
    accessDuration: varchar("access_duration", { length: 80 }),
    accessDistanceKm: numeric("access_distance_km", { precision: 8, scale: 2 }),
    // Facilities & economy
    facilities: text("facilities").array().notNull().default([]),
    entryFee: integer("entry_fee"),
    elevationMeters: integer("elevation_meters"),
    // Media & publishing
    images: text("images").array().notNull().default([]),
    guideRequired: boolean("guide_required").notNull().default(false),
    status: destinationStatusEnum("status").notNull().default("draft"),
    verified: boolean("verified").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    statusIdx: index("destinations_status_idx").on(table.status),
    difficultyIdx: index("destinations_difficulty_idx").on(table.difficulty),
  }),
);

export type DestinationRow = typeof destinations.$inferSelect;
export type NewDestinationRow = typeof destinations.$inferInsert;
export type Difficulty = typeof destinations.$inferSelect.difficulty;
export type DestinationStatus = typeof destinations.$inferSelect.status;
