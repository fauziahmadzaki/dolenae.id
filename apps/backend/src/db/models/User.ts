import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { authProviderEnum, userRoleEnum } from "./enums";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    // Null for accounts created through Google sign-in (no local password).
    passwordHash: text("password_hash"),
    role: userRoleEnum("role").notNull().default("wisatawan"),
    provider: authProviderEnum("provider").notNull().default("local"),
    googleId: varchar("google_id", { length: 255 }),
    avatarUrl: text("avatar_url"),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    googleIdIdx: index("users_google_id_idx").on(table.googleId),
  }),
);

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
export type UserRole = typeof users.$inferSelect.role;
