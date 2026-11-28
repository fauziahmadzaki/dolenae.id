import { and, count, desc, eq } from "drizzle-orm";
import { database } from "../db/DatabaseClient";
import {
  destinations,
  savedDestinations,
  users,
  type DestinationRow,
  type SavedDestinationRow,
} from "../db/models";

export interface SavedDestinationWithTarget {
  saved: SavedDestinationRow;
  destination: DestinationRow;
}

interface PgErrorShape {
  code?: string;
  constraint?: string;
  cause?: PgErrorShape;
}

function extractPgError(error: unknown): {
  code?: string;
  constraint?: string;
} {
  if (!error || typeof error !== "object") return {};
  const err = error as PgErrorShape;
  const code = err.code ?? err.cause?.code;
  const constraint = err.constraint ?? err.cause?.constraint;
  return { code, constraint };
}

class SavedDestinationRepository {
  private get db() {
    return database.getDb();
  }

  /** List saved published destinations for a user, newest first. */
  async listByUser(userId: string): Promise<SavedDestinationWithTarget[]> {
    return this.db
      .select({
        saved: savedDestinations,
        destination: destinations,
      })
      .from(savedDestinations)
      .innerJoin(
        destinations,
        eq(savedDestinations.destinationId, destinations.id),
      )
      .where(
        and(
          eq(savedDestinations.userId, userId),
          eq(destinations.status, "published"),
        ),
      )
      .orderBy(
        desc(savedDestinations.createdAt),
        desc(savedDestinations.destinationId),
      );
  }

  /**
   * Atomically lock the user row, lock and verify the destination is published,
   * handle idempotent re-saves, enforce the published-only per-user cap, and insert.
   */
  async saveForUser(
    userId: string,
    destinationId: string,
    maxSaved: number,
  ): Promise<
    | { status: "user_not_found" }
    | { status: "not_found" }
    | { status: "limit_reached" }
    | { status: "existing"; row: SavedDestinationRow; destination: DestinationRow }
    | { status: "created"; row: SavedDestinationRow; destination: DestinationRow }
  > {
    return this.db.transaction(async (tx) => {
      const [lockedUser] = await tx
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, userId))
        .for("update");
      if (!lockedUser) {
        return { status: "user_not_found" as const };
      }

      const [destination] = await tx
        .select()
        .from(destinations)
        .where(
          and(
            eq(destinations.id, destinationId),
            eq(destinations.status, "published"),
          ),
        )
        .for("share")
        .limit(1);
      if (!destination) {
        return { status: "not_found" as const };
      }

      const [existing] = await tx
        .select()
        .from(savedDestinations)
        .where(
          and(
            eq(savedDestinations.userId, userId),
            eq(savedDestinations.destinationId, destinationId),
          ),
        )
        .limit(1);
      if (existing) {
        return { status: "existing" as const, row: existing, destination };
      }

      const [countRow] = await tx
        .select({ value: count() })
        .from(savedDestinations)
        .innerJoin(
          destinations,
          eq(savedDestinations.destinationId, destinations.id),
        )
        .where(
          and(
            eq(savedDestinations.userId, userId),
            eq(destinations.status, "published"),
          ),
        );
      if (Number(countRow?.value ?? 0) >= maxSaved) {
        return { status: "limit_reached" as const };
      }

      try {
        const [created] = await tx
          .insert(savedDestinations)
          .values({ userId, destinationId })
          .returning();
        return { status: "created" as const, row: created!, destination };
      } catch (error) {
        const pgError = extractPgError(error);
        if (pgError.code === "23503") {
          if (pgError.constraint?.includes("user_id")) {
            return { status: "user_not_found" as const };
          }
          if (pgError.constraint?.includes("destination_id")) {
            return { status: "not_found" as const };
          }
        }
        throw error;
      }
    });
  }

  /** Idempotently delete a saved destination scoped to the owning user. */
  async removeForUser(
    userId: string,
    destinationId: string,
  ): Promise<{ deleted: true; destinationId: string }> {
    await this.db
      .delete(savedDestinations)
      .where(
        and(
          eq(savedDestinations.userId, userId),
          eq(savedDestinations.destinationId, destinationId),
        ),
      );
    return { deleted: true, destinationId };
  }
}

export const savedDestinationRepository = new SavedDestinationRepository();
