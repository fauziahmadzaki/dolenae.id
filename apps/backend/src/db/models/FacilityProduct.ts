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
import { facilities } from "./Facility";

export const facilityProducts = pgTable(
  "facility_products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    facilityId: uuid("facility_id")
      .notNull()
      .references(() => facilities.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description"),
    bannerUrl: text("banner_url"),
    /** Price per unit in rupiah. */
    price: integer("price").notNull(),
    position: integer("position").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    facilityIdx: index("facility_products_facility_idx").on(table.facilityId),
  }),
);

export type FacilityProductRow = typeof facilityProducts.$inferSelect;
export type NewFacilityProductRow = typeof facilityProducts.$inferInsert;
