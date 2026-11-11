import { and, eq, gt, isNull } from "drizzle-orm";
import { getDb } from "../db/client";
import {
  passwordResetTokens,
  type NewPasswordResetTokenRow,
  type PasswordResetTokenRow,
} from "../db/schema";

class PasswordResetRepository {
  private get db() {
    return getDb();
  }

  async create(
    data: NewPasswordResetTokenRow,
  ): Promise<PasswordResetTokenRow> {
    const [row] = await this.db
      .insert(passwordResetTokens)
      .values(data)
      .returning();
    return row!;
  }

  /** Find a token that exists, is unused, and has not expired. */
  async findValidByHash(
    tokenHash: string,
  ): Promise<PasswordResetTokenRow | undefined> {
    const [row] = await this.db
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
  }

  async markUsed(id: string): Promise<void> {
    await this.db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, id));
  }
}

export const passwordResetRepository = new PasswordResetRepository();
