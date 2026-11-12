import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./User";

/** Admin-managed application settings (encrypted secrets supported). */
export const appSettings = pgTable("app_settings", {
  key: varchar("key", { length: 80 }).primaryKey(),
  value: text("value").notNull(),
  encrypted: boolean("encrypted").notNull().default(false),
  updatedBy: uuid("updated_by").references(() => users.id, {
    onDelete: "set null",
  }),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type AppSettingRow = typeof appSettings.$inferSelect;
