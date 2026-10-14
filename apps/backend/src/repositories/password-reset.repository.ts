import { and, eq, gt, isNull } from "drizzle-orm";
import { getDb } from "../db/client";
import {
  passwordResetTokens,
  type NewPasswordResetTokenRow,
  type PasswordResetTokenRow,
} from "../db/schema";

export const passwordResetRepository = {
  async create(
    data: NewPasswordResetTokenRow,
  ): Promise<PasswordResetTokenRow> {
    const [row] = await getDb()
      .insert(passwordResetTokens)
      .values(data)
      .returning();
    return row!;
  },

  /** Find a token that exists, is unused, and has not expired. */
  async findValidByHash(
    tokenHash: string,
  ): Promise<PasswordResetTokenRow | undefined> {
    const [row] = await getDb()
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          isNull(passwordResetTokens.usedAt),
          gt(passwordResetTokens.expiresAt, new Date()),
        ),
      )
      .limit(1);
    return row;
  },

  async markUsed(id: string): Promise<void> {
    await getDb()
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, id));
  },
};
