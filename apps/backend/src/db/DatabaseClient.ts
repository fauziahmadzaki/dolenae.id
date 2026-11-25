import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { AppConfig } from "../config/AppConfig";
import * as schema from "./models";

/**
 * Lazy singleton for the PostgreSQL pool and the Drizzle client.
 *
 * Both are created on first use so importing this module never opens a
 * connection (tests can import it safely).
 */
class DatabaseClient {
  private pool: Pool | null = null;
  private db: NodePgDatabase<typeof schema> | null = null;

  getPool(): Pool {
    if (!this.pool) {
      this.pool = new Pool({ connectionString: AppConfig.load().databaseUrl });
    }
    return this.pool;
  }

  getDb(): NodePgDatabase<typeof schema> {
    if (!this.db) {
      this.db = drizzle(this.getPool(), { schema });
    }
    return this.db;
  }

  /** Returns true if a simple query succeeds. */
  async ping(): Promise<boolean> {
    try {
      await this.getPool().query("select 1");
      return true;
    } catch {
      return false;
    }
  }

  /** Closes the pool and clears the cached client. */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.db = null;
    }
  }
}

export const database = new DatabaseClient();
