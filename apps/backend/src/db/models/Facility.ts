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
import { facilityCategoryEnum, facilityStatusEnum } from "./enums";
import { users } from "./User";

export const facilities = pgTable(
  "facilities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    destinationId: uuid("destination_id")
      .notNull()
      .references(() => destinations.id, { onDelete: "cascade" }),
    ownerId: uuid("owner_id").references(() => users.id, {
      onDelete: "set null",
    }),
    name: varchar("name", { length: 120 }).notNull(),
    category: facilityCategoryEnum("category").notNull(),
    type: varchar("type", { length: 60 }).notNull().default("lainnya"),
    latitude: numeric("latitude", { precision: 10, scale: 7 }).notNull(),
    longitude: numeric("longitude", { precision: 10, scale: 7 }).notNull(),
    priceMin: integer("price_min"),
    priceMax: integer("price_max"),
    description: text("description"),
    contact: text("contact").notNull(),
    contactEmail: varchar("contact_email", { length: 255 }),
    website: text("website"),
    bannerUrl: text("banner_url"),
    status: facilityStatusEnum("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    destinationIdx: index("facilities_destination_idx").on(table.destinationId),
    ownerIdx: index("facilities_owner_idx").on(table.ownerId),
    categoryIdx: index("facilities_category_idx").on(
      table.destinationId,
      table.category,
    ),
  }),
);

export type FacilityRow = typeof facilities.$inferSelect;
export type NewFacilityRow = typeof facilities.$inferInsert;
export type FacilityCategory = typeof facilities.$inferSelect.category;
export type FacilityStatus = typeof facilities.$inferSelect.status;
