import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { loadEnv } from "../config/env";
import * as schema from "./schema";

/**
 * Satu pool koneksi Postgres untuk seluruh aplikasi.
 * Pool dibuat lazy (saat pertama dipakai) agar test yang tidak menyentuh DB
 * tetap bisa mengimpor modul ini tanpa koneksi.
 */
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const env = loadEnv();
    pool = new Pool({
      connectionString: env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
  }
  return pool;
}

export function getDb() {
  return drizzle(getPool(), { schema });
}

export type Db = ReturnType<typeof getDb>;

/** Cek koneksi DB (dipakai health check). */
export async function pingDatabase(): Promise<boolean> {
  try {
    await getPool().query("select 1");
    return true;
  } catch {
    return false;
  }
}

/** Tutup pool (dipakai saat shutdown / test teardown). */
export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
