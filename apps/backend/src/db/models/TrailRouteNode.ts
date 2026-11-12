import { integer, pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { trackNodes } from "./TrackNode";
import { trailRoutes } from "./TrailRoute";

export const trailRouteNodes = pgTable(
  "trail_route_nodes",
  {
    routeId: uuid("route_id")
      .notNull()
      .references(() => trailRoutes.id, { onDelete: "cascade" }),
    nodeId: uuid("node_id")
      .notNull()
      .references(() => trackNodes.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.routeId, table.position] }),
  }),
);
