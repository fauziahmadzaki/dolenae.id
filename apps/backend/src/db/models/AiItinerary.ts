import {
  index,
  integer,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./User";

/** Cached and audited AI itinerary generations. */
export const aiItineraries = pgTable(
  "ai_itineraries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    requestHash: varchar("request_hash", { length: 64 }).notNull(),
    requestJson: jsonb("request_json").notNull(),
    resultJson: jsonb("result_json").notNull(),
    model: varchar("model", { length: 80 }),
    engine: varchar("engine", { length: 20 }).notNull().default("deterministic"),
    latencyMs: integer("latency_ms"),
    status: varchar("status", { length: 20 }).notNull().default("ok"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdx: index("ai_itineraries_user_idx").on(
      table.userId,
      table.createdAt,
    ),
    hashIdx: index("ai_itineraries_hash_idx").on(table.requestHash),
  }),
);

export type AiItineraryRow = typeof aiItineraries.$inferSelect;
