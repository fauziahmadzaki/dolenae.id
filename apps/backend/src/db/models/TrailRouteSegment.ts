import { integer, pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { routeSegments } from "./RouteSegment";
import { trailRoutes } from "./TrailRoute";

export const trailRouteSegments = pgTable(
  "trail_route_segments",
  {
    routeId: uuid("route_id")
      .notNull()
      .references(() => trailRoutes.id, { onDelete: "cascade" }),
    segmentId: uuid("segment_id")
      .notNull()
      .references(() => routeSegments.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.routeId, table.position] }),
  }),
);
