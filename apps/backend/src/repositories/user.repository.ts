import { eq } from "drizzle-orm";
import { getDb } from "../db/client";
import { users, type NewUserRow, type UserRow } from "../db/schema";

/** Fields a caller may update after the user exists. */
export type UserPatch = Partial<
  Pick<
    NewUserRow,
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
};
