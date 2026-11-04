import { sql } from "drizzle-orm";
import { boolean, check, date, foreignKey, index, integer, jsonb, pgEnum, pgTable, text, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";
import { destinations, users } from "./schema";

export const tripStatusEnum = pgEnum("trip_status", ["aktif", "arsip"]);
export const notificationKindEnum = pgEnum("notification_kind", ["rekomendasi", "rencana", "checklist", "usulan", "sistem"]);

export const trips = pgTable("trips", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 160 }).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  peopleCount: integer("people_count").notNull(),
  budget: integer("budget"),
  notes: text("notes"),
  status: tripStatusEnum("status").notNull().default("aktif"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  owner: index("trips_user_idx").on(t.userId),
  ownerKey: unique("trips_id_user_unique").on(t.id, t.userId),
  dates: check("trips_dates_valid", sql`${t.endDate} >= ${t.startDate}`),
  people: check("trips_people_valid", sql`${t.peopleCount} between 1 and 100`),
  budget: check("trips_budget_valid", sql`${t.budget} is null or ${t.budget} >= 0`),
}));

export const tripItems = pgTable("trip_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tripId: uuid("trip_id").notNull(),
  destinationId: uuid("destination_id").notNull().references(() => destinations.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  order: integer("order").notNull(),
  notes: text("notes"),
  supportIds: uuid("support_ids").array().notNull().default([]),
}, (t) => ({
  ownerTrip: index("trip_items_user_trip_idx").on(t.userId, t.tripId),
  tripOwnerFk: foreignKey({ columns: [t.tripId, t.userId], foreignColumns: [trips.id, trips.userId] }).onDelete("cascade"),
  order: check("trip_items_order_valid", sql`${t.order} >= 0`),
}));

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  kind: notificationKindEnum("kind").notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  body: text("body").notNull(),
  read: boolean("read").notNull().default(false),
  href: text("href"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({ owner: index("notifications_user_created_idx").on(t.userId, t.createdAt) }));

export const checklistCategoryEnum = pgEnum("checklist_category", ["perlengkapan", "kesehatan", "konservasi", "administrasi"]);
export const checklistItems = pgTable("checklist_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  destinationId: uuid("destination_id").notNull().references(() => destinations.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 160 }).notNull(),
  category: checklistCategoryEnum("category").notNull(),
  isRequired: boolean("is_required").notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({ ownerDestination: index("checklist_items_user_destination_idx").on(t.userId, t.destinationId) }));

export const savedDestinations = pgTable("saved_destinations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  destinationId: uuid("destination_id").notNull().references(() => destinations.id, { onDelete: "cascade" }),
  savedAt: timestamp("saved_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({ ownerDestination: unique("saved_destinations_user_destination_unique").on(t.userId, t.destinationId) }));

export interface UserSettingsPayload {
  theme: "terang" | "sistem" | "gelap";
  language: "id" | "en";
  dataSaver: boolean;
  notifications: { rekomendasi: boolean; pengingatRencana: boolean; pengingatChecklist: boolean; fasilitasBaru: boolean; promo: boolean };
  privacy: { profilPublik: boolean; bagikanAktivitas: boolean; analitik: boolean };
}
export const DEFAULT_SETTINGS: UserSettingsPayload = {
  theme: "terang", language: "id", dataSaver: false,
  notifications: { rekomendasi: true, pengingatRencana: true, pengingatChecklist: true, fasilitasBaru: false, promo: false },
  privacy: { profilPublik: true, bagikanAktivitas: true, analitik: false },
};
export const settingsThemeEnum = pgEnum("settings_theme", ["terang", "sistem", "gelap"]);
export const settingsLanguageEnum = pgEnum("settings_language", ["id", "en"]);
export const userSettings = pgTable("user_settings", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  theme: settingsThemeEnum("theme").notNull().default("terang"),
  language: settingsLanguageEnum("language").notNull().default("id"),
  dataSaver: boolean("data_saver").notNull().default(false),
  notifications: jsonb("notifications").$type<UserSettingsPayload["notifications"]>().notNull().default(DEFAULT_SETTINGS.notifications),
  privacy: jsonb("privacy").$type<UserSettingsPayload["privacy"]>().notNull().default(DEFAULT_SETTINGS.privacy),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const faqCategoryEnum = pgEnum("faq_category", ["akun", "perjalanan", "fasilitas", "data"]);
export const faqs = pgTable("faqs", {
  id: uuid("id").primaryKey().defaultRandom(), category: faqCategoryEnum("category").notNull(),
  question: varchar("question", { length: 500 }).notNull(), answer: text("answer").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
export const feedbackCategoryEnum = pgEnum("feedback_category", ["bug", "saran", "konten", "lainnya"]);
export const feedback = pgTable("feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  category: feedbackCategoryEnum("category").notNull(), subject: varchar("subject", { length: 160 }).notNull(),
  message: text("message").notNull(), rating: integer("rating"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({ owner: index("feedback_user_idx").on(t.userId), rating: check("feedback_rating_valid", sql`${t.rating} is null or ${t.rating} between 0 and 5`) }));

export type FaqRow = typeof faqs.$inferSelect;
export type ChecklistItemRow = typeof checklistItems.$inferSelect;
export type TripRow = typeof trips.$inferSelect;
export type TripItemRow = typeof tripItems.$inferSelect;
export type NotificationRow = typeof notifications.$inferSelect;
