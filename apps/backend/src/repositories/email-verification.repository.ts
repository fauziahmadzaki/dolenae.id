import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "../db/client";
import {
  emailVerificationTokens,
  type EmailVerificationTokenRow,
  type NewEmailVerificationTokenRow,
} from "../db/schema";

export const emailVerificationRepository = {
  async create(
    data: NewEmailVerificationTokenRow,
  ): Promise<EmailVerificationTokenRow> {
    const [row] = await getDb()
      .insert(emailVerificationTokens)
      .values(data)
      .returning();
    return row!;
  },

  /**
   * Look a token up by hash ignoring `usedAt` — verification is idempotent, so
   * clicking the same link twice still resolves to the same account.
   */
  async findByHash(
    tokenHash: string,
  ): Promise<EmailVerificationTokenRow | undefined> {
    const [row] = await getDb()
      .select()
      .from(emailVerificationTokens)
      .where(eq(emailVerificationTokens.tokenHash, tokenHash))
      .limit(1);
    return row;
  },

  /** Latest token for a user (used to throttle resend requests). */
  async findLatestByUser(
    userId: string,
  ): Promise<EmailVerificationTokenRow | undefined> {
    const [row] = await getDb()
      .select()
      .from(emailVerificationTokens)
      .where(eq(emailVerificationTokens.userId, userId))
      .orderBy(desc(emailVerificationTokens.createdAt))
      .limit(1);
    return row;
  },

  /** Invalidate every still-unused token of a user (a new link supersedes old ones). */
  async invalidateForUser(userId: string): Promise<void> {
    await getDb()
      .update(emailVerificationTokens)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(emailVerificationTokens.userId, userId),
          isNull(emailVerificationTokens.usedAt),
        ),
      );
  },
};
