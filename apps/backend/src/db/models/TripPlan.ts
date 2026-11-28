import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import type {
  TripPlanBriefing,
  TripPlanChecklistItem,
  TripPlanDay,
  TripPlanSource,
} from "../../types/plan";
import { users } from "./User";

/** Per-account saved trip plans with grounded AI itinerary and checklist state. */
export const tripPlans = pgTable(
  "trip_plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    clientId: varchar("client_id", { length: 120 }),
    title: varchar("title", { length: 160 }).notNull(),
    startDate: date("start_date", { mode: "string" }).notNull(),
    endDate: date("end_date", { mode: "string" }).notNull(),
    peopleCount: integer("people_count").notNull().default(1),
    totalBudget: integer("total_budget").notNull().default(0),
    originProvince: varchar("origin_province", { length: 100 })
      .notNull()
      .default(""),
    note: text("note").notNull().default(""),
    summary: text("summary").notNull().default(""),
    engine: varchar("engine", { length: 30 }).notNull().default("draft"),
    notice: text("notice"),
    aiWarning: text("ai_warning"),
    destinationIds: text("destination_ids").array().notNull().default([]),
    briefingJson: jsonb("briefing_json")
      .$type<TripPlanBriefing>()
      .notNull()
      .default({ grounded: [], general: [], warnings: [] }),
    daysJson: jsonb("days_json")
      .$type<TripPlanDay[]>()
      .notNull()
      .default([]),
    sourcesJson: jsonb("sources_json")
      .$type<TripPlanSource[]>()
      .notNull()
      .default([]),
    checklistJson: jsonb("checklist_json")
      .$type<TripPlanChecklistItem[]>()
      .notNull()
      .default([]),
    checklistReady: boolean("checklist_ready").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdx: index("trip_plans_user_idx").on(table.userId, table.startDate),
    userClientUidx: uniqueIndex("trip_plans_user_client_uidx").on(
      table.userId,
      table.clientId,
    ),
    dateRangeCheck: check(
      "trip_plans_date_range_check",
      sql`${table.startDate} IS NULL OR ${table.endDate} IS NULL OR ${table.endDate} >= ${table.startDate}`,
    ),
  }),
);

export type TripPlanRow = typeof tripPlans.$inferSelect;
export type NewTripPlanRow = typeof tripPlans.$inferInsert;

/** Tombstone for pending client-ID deletes serialized with trip plan creation. */
export const tripPlanDeletions = pgTable(
  "trip_plan_deletions",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    clientId: varchar("client_id", { length: 120 }).notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    pk: primaryKey({
      name: "trip_plan_deletions_user_id_client_id_pk",
      columns: [table.userId, table.clientId],
    }),
  }),
);

export type TripPlanDeletionRow = typeof tripPlanDeletions.$inferSelect;
