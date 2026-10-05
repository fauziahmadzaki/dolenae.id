import type { Context } from "hono";
import { pingDatabase } from "../db/client";
import { ok } from "../utils/response";
import type { AppEnv } from "../types/auth";

export const healthController = {
  /** GET /api/health — status server + koneksi DB. */
  async check(c: Context<AppEnv>) {
    const dbOk = await pingDatabase();
    return ok(
      c,
      {
        status: dbOk ? "ok" : "degraded",
        database: dbOk ? "up" : "down",
        uptimeSeconds: Math.round(process.uptime()),
      },
      undefined,
      dbOk ? 200 : 503,
    );
  },
};
