import { and, count, desc, eq, gte } from "drizzle-orm";
import { getDb } from "../db/client";
import { aiItineraries, type AiItineraryRow } from "../db/schema";

export const aiRepository = {
  async findRecent(
    userId: string,
    requestHash: string,
    since: Date,
  ): Promise<AiItineraryRow | undefined> {
    const [row] = await getDb()
      .select()
      .from(aiItineraries)
      .where(
        and(
          eq(aiItineraries.userId, userId),
          eq(aiItineraries.requestHash, requestHash),
          gte(aiItineraries.createdAt, since),
        ),
      )
      .orderBy(desc(aiItineraries.createdAt))
      .limit(1);
    return row;
  },

  async countSince(userId: string, since: Date): Promise<number> {
    const [row] = await getDb()
      .select({ value: count() })
      .from(aiItineraries)
      .where(
        and(
          eq(aiItineraries.userId, userId),
          gte(aiItineraries.createdAt, since),
        ),
      );
    return Number(row?.value ?? 0);
  },

  async save(input: {
    userId: string;
    requestHash: string;
    request: unknown;
    result: unknown;
    model?: string | null;
    engine: string;
    latencyMs: number;
    status: string;
  }): Promise<AiItineraryRow> {
    const [row] = await getDb()
      .insert(aiItineraries)
      .values({
        userId: input.userId,
        requestHash: input.requestHash,
        requestJson: input.request,
        resultJson: input.result,
        model: input.model ?? null,
        engine: input.engine,
        latencyMs: input.latencyMs,
        status: input.status,
      })
      .returning();
    return row!;
  },
};
