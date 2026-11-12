import {
  index,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./User";

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
