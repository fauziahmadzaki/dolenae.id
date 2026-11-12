import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { destinations } from "./Destination";
import {
  difficultyEnum,
  routeGradeEnum,
  trailRouteStatusEnum,
} from "./enums";
import { trackNodes } from "./TrackNode";

export const trailRoutes = pgTable(
  "trail_routes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    destinationId: uuid("destination_id")
      .notNull()
      .references(() => destinations.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description"),
    basecampNodeId: uuid("basecamp_node_id").references(() => trackNodes.id, {
      onDelete: "set null",
    }),
    // "campuran" for mixed surfaces; otherwise a routeSurfaceEnum value.
    surface: varchar("surface", { length: 20 }).notNull().default("campuran"),
    grade: routeGradeEnum("grade").notNull().default("sedang"),
    traversableBy: text("traversable_by").array().notNull().default([]),
    difficulty: difficultyEnum("difficulty").notNull().default("menengah"),
    recommended: boolean("recommended").notNull().default(false),
    status: trailRouteStatusEnum("status").notNull().default("terverifikasi"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    destinationIdx: index("trail_routes_destination_idx").on(
      table.destinationId,
    ),
  }),
);

export type TrailRouteRow = typeof trailRoutes.$inferSelect;
export type NewTrailRouteRow = typeof trailRoutes.$inferInsert;
export type TrailRouteStatus = typeof trailRoutes.$inferSelect.status;
