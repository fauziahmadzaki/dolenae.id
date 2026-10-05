import { and, asc, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { getDb } from "../db/client";
import { users, type NewUserRow, type UserRow } from "../db/schema";
import type { PaginationParams } from "../utils/pagination";
import type { UserRole } from "@dolenae/types";

/**
 * Lapisan akses data untuk `users`. Hanya file ini yang menyentuh query DB.
 */
export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
  role?: UserRole;
}

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

  /** Daftar user + total (untuk pagination). */
  async list(
    params: PaginationParams,
  ): Promise<{ items: UserRow[]; total: number }> {
    const db = getDb();
    const { page, limit, sort, order, search } = params;
    const offset = (page - 1) * limit;

    const where = search
      ? or(ilike(users.name, `%${search}%`), ilike(users.email, `%${search}%`))
      : undefined;

    // Whitelist kolom yang boleh dipakai untuk sorting.
    const sortable = { createdAt: users.createdAt, name: users.name, email: users.email } as const;
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

  async emailExists(email: string): Promise<boolean> {
    const db = getDb();
    const [row] = await db
      .select({ value: sql<number>`1` })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return Boolean(row);
  },
};
