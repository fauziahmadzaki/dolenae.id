import {
  bigint,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./User";

/**
 * Gallery photos uploaded by admins through `/api/uploads?folder=gallery`.
 * `key` is the storage object key so the file can be deleted together with the
 * row; `fileName` keeps the original name shown in the admin grid.
 */
export const galleryPhotos = pgTable(
  "gallery_photos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    key: text("key").notNull().unique(),
    url: text("url").notNull(),
    mime: varchar("mime", { length: 80 }).notNull(),
    size: bigint("size", { mode: "number" }).notNull().default(0),
    region: varchar("region", { length: 120 }),
    uploadedBy: uuid("uploaded_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    regionIdx: index("gallery_photos_region_idx").on(table.region),
    createdIdx: index("gallery_photos_created_idx").on(table.createdAt),
  }),
);

export type GalleryPhotoRow = typeof galleryPhotos.$inferSelect;
export type NewGalleryPhotoRow = typeof galleryPhotos.$inferInsert;
