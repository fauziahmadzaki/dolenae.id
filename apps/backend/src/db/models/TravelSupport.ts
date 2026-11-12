import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { destinations } from "./Destination";
import { supportCategoryEnum } from "./enums";

export const travelSupports = pgTable(
  "travel_supports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    destinationId: uuid("destination_id").notNull()
      .references(() => destinations.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    category: supportCategoryEnum("category").notNull(),
    description: text("description"),
    locationLabel: text("location_label"),
    capacity: text("capacity"),
    distanceLabel: text("distance_label"),
    priceLabel: text("price_label"),
    priceUnit: text("price_unit"),
    priceMin: integer("price_min"),
    priceMax: integer("price_max"),
    contactPhone: text("contact_phone"),
    contactWhatsapp: text("contact_whatsapp"),
    contactInstagram: text("contact_instagram"),
    imageUrl: text("image_url"),
    facilities: text("facilities").array().notNull().default([]),
    routes: text("routes").array().notNull().default([]),
    cuisine: text("cuisine").array().notNull().default([]),
    includesDriver: boolean("includes_driver").notNull().default(false),
    verified: boolean("verified").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({ destinationIdx: index("travel_supports_destination_idx").on(table.destinationId) }),
);

export type TravelSupportRow = typeof travelSupports.$inferSelect;
export type NewTravelSupportRow = typeof travelSupports.$inferInsert;
export type SupportCategory = typeof travelSupports.$inferSelect.category;
