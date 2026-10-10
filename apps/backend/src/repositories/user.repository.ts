import { and, asc, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { getDb } from "../db/client";
import { users, type NewUserRow, type UserRow } from "../db/schema";

import type { Pagination } from "../utils/pagination";
export type UpdateUserInput = UserPatch;

/** Fields a caller may update after the user exists. */
export type UserPatch = Partial<
  Pick<
    NewUserRow,
    | "email"
    | "name"
    | "passwordHash"
    | "role"
    | "provider"
    | "googleId"
    | "avatarUrl"
    | "emailVerifiedAt"
    | "lastLoginAt"
  >
>;

export const userRepository = {
  async emailExists(email: string): Promise<boolean> {
    const db = getDb();
    const [row] = await db
      .select({ value: sql<number>`1` })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return Boolean(row);
  },


  async findByEmail(email: string): Promise<UserRow | undefined> {
    const [row] = await getDb()
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return row;
  },

  async findById(id: string): Promise<UserRow | undefined> {
    const [row] = await getDb()
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return row;
  },

  async findByGoogleId(googleId: string): Promise<UserRow | undefined> {
    const [row] = await getDb()
      .select()
      .from(users)
      .where(eq(users.googleId, googleId))
      .limit(1);
    return row;
  },

  async create(data: NewUserRow): Promise<UserRow> {
    const [row] = await getDb().insert(users).values(data).returning();
    return row!;
  },

  async update(id: string, patch: UserPatch): Promise<UserRow | undefined> {
    const [row] = await getDb()
      .update(users)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return row;
  },

  async touchLastLogin(id: string): Promise<void> {
    await getDb()
      .update(users)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, id));
  },
  async list(
    params: Pagination & { role?: UserRow["role"] },
  ): Promise<{ items: UserRow[]; total: number }> {
    const db = getDb();
    const { limit, offset, sort, order, search } = params;

    const where = and(
      search ? or(ilike(users.name, `%${search}%`), ilike(users.email, `%${search}%`)) : undefined,
      params.role ? eq(users.role, params.role) : undefined,
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
  },

  async delete(id: string): Promise<boolean> {
    const db = getDb();
    const [row] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });
    return Boolean(row);
  },
};
