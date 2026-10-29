import { inArray } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { getDb } from "../db/client";
import { appSettings, users, type AppSettingRow } from "../db/schema";

export interface AppSettingWithUser extends AppSettingRow {
  updatedByName: string | null;
}

export const settingsRepository = {
  async findMany(keys: string[]): Promise<AppSettingRow[]> {
    if (keys.length === 0) return [];
    return getDb().select().from(appSettings).where(inArray(appSettings.key, keys));
  },

  async findWithUser(key: string): Promise<AppSettingWithUser | undefined> {
    const [row] = await getDb()
      .select({
        key: appSettings.key,
        value: appSettings.value,
        encrypted: appSettings.encrypted,
        updatedBy: appSettings.updatedBy,
        updatedAt: appSettings.updatedAt,
        updatedByName: users.name,
      })
      .from(appSettings)
      .leftJoin(users, eq(appSettings.updatedBy, users.id))
      .where(eq(appSettings.key, key))
      .limit(1);
    return row;
  },

  async upsert(input: {
    key: string;
    value: string;
    encrypted: boolean;
    updatedBy: string;
  }): Promise<void> {
    await getDb()
      .insert(appSettings)
      .values({
        key: input.key,
        value: input.value,
        encrypted: input.encrypted,
        updatedBy: input.updatedBy,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: appSettings.key,
        set: {
          value: input.value,
          encrypted: input.encrypted,
          updatedBy: input.updatedBy,
          updatedAt: new Date(),
        },
      });
  },

  async remove(key: string): Promise<void> {
    await getDb().delete(appSettings).where(eq(appSettings.key, key));
  },
};
