import {
  index,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { destinations } from "./Destination";
import { users } from "./User";

/** Per-account saved/bookmarked published destinations. */
export const savedDestinations = pgTable(
  "saved_destinations",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    destinationId: uuid("destination_id")
      .notNull()
      .references(() => destinations.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    pk: primaryKey({
      name: "saved_destinations_user_id_destination_id_pk",
      columns: [table.userId, table.destinationId],
    }),
    userCreatedIdx: index("saved_destinations_user_created_idx").on(
      table.userId,
      table.createdAt,
    ),
  }),
);

export type SavedDestinationRow = typeof savedDestinations.$inferSelect;
export type NewSavedDestinationRow = typeof savedDestinations.$inferInsert;
