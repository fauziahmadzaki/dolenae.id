import {
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { destinations } from "./Destination";
import { trackNodeTypeEnum } from "./enums";

export const trackNodes = pgTable(
  "track_nodes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    destinationId: uuid("destination_id")
      .notNull()
      .references(() => destinations.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    type: trackNodeTypeEnum("type").notNull().default("pos"),
    latitude: numeric("latitude", { precision: 10, scale: 7 }).notNull(),
    longitude: numeric("longitude", { precision: 10, scale: 7 }).notNull(),
    elevationMeters: integer("elevation_meters").notNull(),
    notes: text("notes"),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    destinationIdx: index("track_nodes_destination_idx").on(
      table.destinationId,
    ),
  }),
);

export type TrackNodeRow = typeof trackNodes.$inferSelect;
export type NewTrackNodeRow = typeof trackNodes.$inferInsert;
export type TrackNodeType = typeof trackNodes.$inferSelect.type;
