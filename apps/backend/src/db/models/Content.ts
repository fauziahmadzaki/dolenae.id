import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { contentKindEnum, contentStatusEnum } from "./enums";
import { users } from "./User";

/**
 * Admin-managed editorial content (Artikel / Panduan / Tips) shown in the
 * mobile app and the public web. `authorId` keeps the writer for the admin
 * table; deleting a user keeps their articles and clears the author.
 */
export const contents = pgTable(
  "contents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 180 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull().unique(),
    kind: contentKindEnum("kind").notNull().default("artikel"),
    excerpt: text("excerpt"),
    body: text("body").notNull(),
    coverUrl: text("cover_url"),
    status: contentStatusEnum("status").notNull().default("draft"),
    authorId: uuid("author_id").references(() => users.id, {
      onDelete: "set null",
    }),
    views: integer("views").notNull().default(0),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    statusIdx: index("contents_status_idx").on(table.status),
    kindIdx: index("contents_kind_idx").on(table.kind),
    publishedIdx: index("contents_published_idx").on(table.publishedAt),
  }),
);

export type ContentRow = typeof contents.$inferSelect;
export type NewContentRow = typeof contents.$inferInsert;
export type ContentKind = typeof contents.$inferSelect.kind;
export type ContentStatus = typeof contents.$inferSelect.status;
