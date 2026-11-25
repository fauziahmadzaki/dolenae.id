import {
  integer,
  numeric,
  pgTable,
  primaryKey,
  uuid,
} from "drizzle-orm/pg-core";
import { trackNodes } from "./TrackNode";
import { trailRoutes } from "./TrailRoute";

/**
 * Ordered geometry of a trail. A point can be a free bend (no node) or an
 * anchor snapped to a named track node.
 */
export const trailRoutePoints = pgTable(
  "trail_route_points",
  {
    routeId: uuid("route_id")
      .notNull()
      .references(() => trailRoutes.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    latitude: numeric("latitude", { precision: 10, scale: 7 }).notNull(),
    longitude: numeric("longitude", { precision: 10, scale: 7 }).notNull(),
    elevationMeters: integer("elevation_meters"),
    nodeId: uuid("node_id").references(() => trackNodes.id, {
      onDelete: "set null",
    }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.routeId, table.position] }),
  }),
);

export type TrailRoutePointRow = typeof trailRoutePoints.$inferSelect;
