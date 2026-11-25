import {
  boolean,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { destinations } from "./Destination";
import { routeGradeEnum, routeStatusEnum, routeSurfaceEnum } from "./enums";
import { trackNodes } from "./TrackNode";

export const routeSegments = pgTable(
  "route_segments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    destinationId: uuid("destination_id")
      .notNull()
      .references(() => destinations.id, { onDelete: "cascade" }),
    fromNodeId: uuid("from_node_id")
      .notNull()
      .references(() => trackNodes.id, { onDelete: "cascade" }),
    toNodeId: uuid("to_node_id")
      .notNull()
      .references(() => trackNodes.id, { onDelete: "cascade" }),
    surface: routeSurfaceEnum("surface").notNull().default("setapak"),
    grade: routeGradeEnum("grade").notNull().default("sedang"),
    traversableBy: text("traversable_by").array().notNull().default([]),
    bidirectional: boolean("bidirectional").notNull().default(true),
    distanceKm: numeric("distance_km", { precision: 8, scale: 2 }),
    estimatedDurationMinutes: integer("estimated_duration_minutes"),
    seasonal: boolean("seasonal").notNull().default(false),
    notes: text("notes"),
    status: routeStatusEnum("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    destinationIdx: index("route_segments_destination_idx").on(
      table.destinationId,
    ),
  }),
);

export type RouteSegmentRow = typeof routeSegments.$inferSelect;
export type NewRouteSegmentRow = typeof routeSegments.$inferInsert;
export type RouteSurface = typeof routeSegments.$inferSelect.surface;
export type RouteGrade = typeof routeSegments.$inferSelect.grade;
export type RouteStatus = typeof routeSegments.$inferSelect.status;
