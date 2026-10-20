import {
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "wisatawan",
  "merchant",
  "admin",
]);

export const authProviderEnum = pgEnum("auth_provider", ["local", "google"]);

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

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // SHA-256 of the raw token sent to the user; the raw value is never stored.
    tokenHash: varchar("token_hash", { length: 64 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tokenHashIdx: index("password_reset_tokens_hash_idx").on(table.tokenHash),
    userIdx: index("password_reset_tokens_user_idx").on(table.userId),
  }),
);

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
export type PasswordResetTokenRow = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetTokenRow =
  typeof passwordResetTokens.$inferInsert;

export const emailVerificationTokens = pgTable(
  "email_verification_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // SHA-256 of the raw token sent by email; the raw value is never stored.
    tokenHash: varchar("token_hash", { length: 64 }).notNull(),
    // No `expiresAt` on purpose: the link stays valid until it is used.
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tokenHashIdx: index("email_verification_tokens_hash_idx").on(
      table.tokenHash,
    ),
    userIdx: index("email_verification_tokens_user_idx").on(table.userId),
  }),
);

export type EmailVerificationTokenRow =
  typeof emailVerificationTokens.$inferSelect;
export type NewEmailVerificationTokenRow =
  typeof emailVerificationTokens.$inferInsert;
export type UserRole = typeof users.$inferSelect.role;

// ---------------------------------------------------------------------------
// Categories & destinations (Modul 4 — Admin Destinasi & Kategori)
// ---------------------------------------------------------------------------

export const categoryTypeEnum = pgEnum("category_type", ["terrain", "activity"]);

export const difficultyEnum = pgEnum("difficulty", [
  "ramah-pemula",
  "menengah",
  "sulit",
]);

export const destinationStatusEnum = pgEnum("destination_status", [
  "draft",
  "published",
  "archived",
]);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 80 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    type: categoryTypeEnum("type").notNull(),
    // Lucide icon reference, e.g. "lucide:mountain".
    icon: varchar("icon", { length: 80 }),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    typeIdx: index("categories_type_idx").on(table.type),
  }),
);

export const destinations = pgTable(
  "destinations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 140 }).notNull().unique(),
    tagline: varchar("tagline", { length: 200 }),
    description: text("description"),
    // Classification
    difficulty: difficultyEnum("difficulty").notNull().default("menengah"),
    bestSeason: text("best_season").array().notNull().default([]),
    tags: text("tags").array().notNull().default([]),
    // Compatibility with the design/seed display (official relation = categoryIds).
    terrain: text("terrain").array().notNull().default([]),
    activities: text("activities").array().notNull().default([]),
    // Geography (reverse geocode via @dolenae/regions — ADR-0004)
    province: varchar("province", { length: 80 }),
    regency: varchar("regency", { length: 80 }),
    district: varchar("district", { length: 80 }),
    latitude: numeric("latitude", { precision: 10, scale: 7 }),
    longitude: numeric("longitude", { precision: 10, scale: 7 }),
    accessPoint: varchar("access_point", { length: 160 }),
    // Access
    accessDescription: text("access_description"),
    accessTransport: text("access_transport").array().notNull().default([]),
    accessDuration: varchar("access_duration", { length: 80 }),
    accessDistanceKm: numeric("access_distance_km", { precision: 8, scale: 2 }),
    // Facilities & economy
    facilities: text("facilities").array().notNull().default([]),
    entryFee: integer("entry_fee"),
    elevationMeters: integer("elevation_meters"),
    // Media & publishing
    images: text("images").array().notNull().default([]),
    guideRequired: boolean("guide_required").notNull().default(false),
    status: destinationStatusEnum("status").notNull().default("draft"),
    verified: boolean("verified").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    statusIdx: index("destinations_status_idx").on(table.status),
    difficultyIdx: index("destinations_difficulty_idx").on(table.difficulty),
  }),
);

export const destinationCategories = pgTable(
  "destination_categories",
  {
    destinationId: uuid("destination_id")
      .notNull()
      .references(() => destinations.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.destinationId, table.categoryId],
    }),
  }),
);

export type CategoryRow = typeof categories.$inferSelect;
export type NewCategoryRow = typeof categories.$inferInsert;
export type DestinationRow = typeof destinations.$inferSelect;
export type NewDestinationRow = typeof destinations.$inferInsert;
export type CategoryType = typeof categories.$inferSelect.type;
export type Difficulty = typeof destinations.$inferSelect.difficulty;
export type DestinationStatus = typeof destinations.$inferSelect.status;
