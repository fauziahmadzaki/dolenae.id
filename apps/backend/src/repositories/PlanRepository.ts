import { and, count, desc, eq, sql } from "drizzle-orm";
import { database } from "../db/DatabaseClient";
import {
  tripPlanDeletions,
  tripPlans,
  type NewTripPlanRow,
  type TripPlanRow,
} from "../db/models";
import type { PlanPatch } from "../types/plan";

class PlanRepository {
  private get db() {
    return database.getDb();
  }

  async listByUser(userId: string): Promise<TripPlanRow[]> {
    return this.db
      .select()
      .from(tripPlans)
      .where(eq(tripPlans.userId, userId))
      .orderBy(desc(tripPlans.updatedAt), desc(tripPlans.createdAt));
  }

  async countByUser(userId: string): Promise<number> {
    const [row] = await this.db
      .select({ value: count() })
      .from(tripPlans)
      .where(eq(tripPlans.userId, userId));
    return Number(row?.value ?? 0);
  }

  async findByIdForUser(
    id: string,
    userId: string,
  ): Promise<TripPlanRow | undefined> {
    const [row] = await this.db
      .select()
      .from(tripPlans)
      .where(and(eq(tripPlans.id, id), eq(tripPlans.userId, userId)))
      .limit(1);
    return row;
  }

  async create(input: NewTripPlanRow): Promise<TripPlanRow> {
    const [row] = await this.db.insert(tripPlans).values(input).returning();
    return row!;
  }

  /**
   * Atomically locks the user row, checks clientId deletion tombstones and
   * idempotency, enforces the per-user plan limit, and inserts the new plan
   * inside a single transaction.
   */
  async createWithLimitForUser(
    userId: string,
    maxPlans: number,
    input: NewTripPlanRow,
  ): Promise<
    | { status: "deleted" }
    | { status: "existing"; row: TripPlanRow }
    | { status: "limit_reached" }
    | { status: "created"; row: TripPlanRow }
  > {
    return this.db.transaction(async (tx) => {
      await tx.execute(sql`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`);
      if (input.clientId) {
        const [tombstone] = await tx
          .select({ clientId: tripPlanDeletions.clientId })
          .from(tripPlanDeletions)
          .where(
            and(
              eq(tripPlanDeletions.userId, userId),
              eq(tripPlanDeletions.clientId, input.clientId),
            ),
          )
          .limit(1);
        if (tombstone) {
          return { status: "deleted" as const };
        }
        const [existing] = await tx
          .select()
          .from(tripPlans)
          .where(
            and(
              eq(tripPlans.userId, userId),
              eq(tripPlans.clientId, input.clientId),
            ),
          )
          .limit(1);
        if (existing) {
          return { status: "existing" as const, row: existing };
        }
      }
      const [row] = await tx
        .select({ value: count() })
        .from(tripPlans)
        .where(eq(tripPlans.userId, userId));
      if (Number(row?.value ?? 0) >= maxPlans) {
        return { status: "limit_reached" as const };
      }
      const [created] = await tx.insert(tripPlans).values(input).returning();
      return { status: "created" as const, row: created! };
    });
  }

  /**
   * Atomically locks the user row, records a clientId deletion tombstone, and
   * deletes any matching trip_plans row for that user and clientId.
   */
  async deleteByClientIdForUser(
    userId: string,
    clientId: string,
  ): Promise<{ deleted: true; clientId: string }> {
    return this.db.transaction(async (tx) => {
      await tx.execute(sql`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`);
      await tx
        .insert(tripPlanDeletions)
        .values({ userId, clientId })
        .onConflictDoNothing();
      await tx
        .delete(tripPlans)
        .where(
          and(
            eq(tripPlans.userId, userId),
            eq(tripPlans.clientId, clientId),
          ),
        );
      return { deleted: true, clientId };
    });
  }

  async updateForUser(
    id: string,
    userId: string,
    patch: PlanPatch,
  ): Promise<TripPlanRow | undefined> {
    const [row] = await this.db
      .update(tripPlans)
      .set(patch)
      .where(and(eq(tripPlans.id, id), eq(tripPlans.userId, userId)))
      .returning();
    return row;
  }

  /**
   * Atomically locks the owned plan row, computes the merged patch from the
   * locked state, and updates it inside a single transaction.
   */
  async updateForUserLocked(
    id: string,
    userId: string,
    buildPatch: (existing: TripPlanRow) => PlanPatch,
  ): Promise<TripPlanRow | undefined> {
    return this.db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(tripPlans)
        .where(and(eq(tripPlans.id, id), eq(tripPlans.userId, userId)))
        .for("update")
        .limit(1);
      if (!existing) return undefined;

      const patch = buildPatch(existing);
      const [updated] = await tx
        .update(tripPlans)
        .set(patch)
        .where(and(eq(tripPlans.id, id), eq(tripPlans.userId, userId)))
        .returning();
      return updated;
    });
  }

  async deleteForUser(id: string, userId: string): Promise<boolean> {
    const rows = await this.db
      .delete(tripPlans)
      .where(and(eq(tripPlans.id, id), eq(tripPlans.userId, userId)))
      .returning({ id: tripPlans.id });
    return rows.length > 0;
  }
}

export const planRepository = new PlanRepository();
