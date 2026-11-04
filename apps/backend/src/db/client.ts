import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { loadEnv } from "../config/env";
import * as baseSchema from "./schema";
import * as personalSchema from "./personal-schema";

const schema = { ...baseSchema, ...personalSchema };

let pool: Pool | null = null;
let db: NodePgDatabase<typeof schema> | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: loadEnv().DATABASE_URL });
  }
  return pool;
}

export function getDb(): NodePgDatabase<typeof schema> {
  if (!db) {
    db = drizzle(getPool(), { schema });
  }
  return db;
}

/** Returns true if a simple query succeeds. */
export async function pingDatabase(): Promise<boolean> {
  try {
    await getPool().query("select 1");
    return true;
  } catch {
    return false;
  }
}

export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    db = null;
  }
}
