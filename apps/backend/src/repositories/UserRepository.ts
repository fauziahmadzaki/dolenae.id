import { and, asc, count, desc, eq, gt, ilike, isNotNull, isNull, lt, or, sql } from "drizzle-orm";
import { database } from "../db/DatabaseClient";
import { users, type NewUserRow, type UserRow } from "../db/models";
import type { UserStatusFilter } from "../types/auth";
import type { UpdateUserInput, UserPatch } from "../types/user";
import type { Pagination } from "../utils/pagination";

class UserRepository {
  /** A verified account with no login for this long counts as inactive. */
  private static readonly INACTIVE_AFTER_DAYS = 90;

  private get db() {
    return database.getDb();
  }

  /** SQL condition for the derived account status shown in the admin table. */
  private statusCondition(status: UserStatusFilter) {
    const cutoff = new Date(
      Date.now() - UserRepository.INACTIVE_AFTER_DAYS * 24 * 60 * 60 * 1000,
    );

    switch (status) {
      case "unverified":
        return isNull(users.emailVerifiedAt);
      case "inactive":
        return and(
          isNotNull(users.emailVerifiedAt),
          or(isNull(users.lastLoginAt), lt(users.lastLoginAt, cutoff)),
        );
      case "active":
        return and(
          isNotNull(users.emailVerifiedAt),
          isNotNull(users.lastLoginAt),
          gt(users.lastLoginAt, cutoff),
        );
    }
  }

  async emailExists(email: string): Promise<boolean> {
    const db = this.db;
    const [row] = await db
      .select({ value: sql<number>`1` })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return Boolean(row);
  }

  async findByEmail(email: string): Promise<UserRow | undefined> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return row;
  }

  async findById(id: string): Promise<UserRow | undefined> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return row;
  }

  async findByGoogleId(googleId: string): Promise<UserRow | undefined> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(eq(users.googleId, googleId))
      .limit(1);
    return row;
  }

  async create(data: NewUserRow): Promise<UserRow> {
    const [row] = await this.db.insert(users).values(data).returning();
    return row!;
  }

  async update(id: string, patch: UserPatch): Promise<UserRow | undefined> {
    const [row] = await this.db
      .update(users)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return row;
  }

  async touchLastLogin(id: string): Promise<void> {
    await this.db
      .update(users)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async list(
    params: Pagination & { role?: UserRow["role"]; status?: UserStatusFilter },
  ): Promise<{ items: UserRow[]; total: number }> {
    const db = this.db;
    const { limit, offset, sort, order, search } = params;

    const where = and(
      search
        ? or(ilike(users.name, `%${search}%`), ilike(users.email, `%${search}%`))
        : undefined,
      params.role ? eq(users.role, params.role) : undefined,
      params.status ? this.statusCondition(params.status) : undefined,
    );

    const sortable = {
      createdAt: users.createdAt,
      name: users.name,
      email: users.email,
    } as const;

    const sortColumn =
      sort && sort in sortable
        ? sortable[sort as keyof typeof sortable]
        : users.createdAt;

    const rows = await db
      .select()
      .from(users)
      .where(where ? and(where) : undefined)
      .orderBy(order === "asc" ? asc(sortColumn) : desc(sortColumn))
      .limit(limit)
      .offset(offset);

    const [totalRow] = await db
      .select({ value: count() })
      .from(users)
      .where(where ? and(where) : undefined);

    return { items: rows, total: Number(totalRow?.value ?? 0) };
  }

  async delete(id: string): Promise<boolean> {
    const db = this.db;
    const [row] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });
    return Boolean(row);
  }
}

export const userRepository = new UserRepository();
