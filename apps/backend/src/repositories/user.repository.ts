import { and, asc, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { getDb } from "../db/client";
import { users, type NewUserRow, type UserRole, type UserRow } from "../db/schema";
import type { Pagination } from "../utils/pagination";

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
  role?: UserRole;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  passwordHash?: string;
  role?: UserRole;
}

/** Akses data PostgreSQL via Drizzle untuk entitas `users`. */
export const userRepository = {
  async findById(id: string): Promise<UserRow | null> {
    const db = getDb();
    const row = await db.query.users.findFirst({ where: eq(users.id, id) });
    return row ?? null;
  },

  async findByEmail(email: string): Promise<UserRow | null> {
    const db = getDb();
    const row = await db.query.users.findFirst({ where: eq(users.email, email) });
    return row ?? null;
  },

  async emailExists(email: string): Promise<boolean> {
    const db = getDb();
    const [row] = await db
      .select({ value: sql<number>`1` })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return Boolean(row);
  },

  async create(input: CreateUserInput): Promise<UserRow> {
    const db = getDb();
    const values: NewUserRow = {
      name: input.name,
      email: input.email,
      passwordHash: input.passwordHash,
      role: input.role ?? "wisatawan",
    };
    const [row] = await db.insert(users).values(values).returning();
    if (!row) throw new Error("Gagal membuat user");
    return row;
  },

  async list(
    params: Pagination,
  ): Promise<{ items: UserRow[]; total: number }> {
    const db = getDb();
    const { limit, offset, sort, order, search } = params;

    const where = search
      ? or(ilike(users.name, `%${search}%`), ilike(users.email, `%${search}%`))
      : undefined;

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

  async update(id: string, input: UpdateUserInput): Promise<UserRow | null> {
    const db = getDb();
    const values: Partial<NewUserRow> = {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.email !== undefined && { email: input.email }),
      ...(input.passwordHash !== undefined && { passwordHash: input.passwordHash }),
      ...(input.role !== undefined && { role: input.role }),
      updatedAt: new Date(),
    };
    const [row] = await db
      .update(users)
      .set(values)
      .where(eq(users.id, id))
      .returning();
    return row ?? null;
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
