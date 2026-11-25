import { inArray } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { database } from "../db/DatabaseClient";
import { appSettings, users, type AppSettingRow } from "../db/models";
import type { AppSettingWithUser } from "../types/settings";

class SettingsRepository {
  private get db() {
    return database.getDb();
  }

  async findMany(keys: string[]): Promise<AppSettingRow[]> {
    if (keys.length === 0) return [];
    return this.db.select().from(appSettings).where(inArray(appSettings.key, keys));
  }

  async findWithUser(key: string): Promise<AppSettingWithUser | undefined> {
    const [row] = await this.db
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
  }

  async upsert(input: {
    key: string;
    value: string;
    encrypted: boolean;
    updatedBy: string;
  }): Promise<void> {
    await this.db
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
  }

  async remove(key: string): Promise<void> {
    await this.db.delete(appSettings).where(eq(appSettings.key, key));
  }
}

export const settingsRepository = new SettingsRepository();
