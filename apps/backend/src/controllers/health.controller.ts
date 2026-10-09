import type { RequestHandler } from "express";
import { pingDatabase } from "../db/client";
import { ok } from "../utils/response";

export const healthController = {
  /** GET /api/health */
  get: (async (_req, res) => {
    const dbConnected = await pingDatabase();
    ok(res, {
      status: "ok",
      service: "Dolenae API",
      version: "0.1.0",
      uptimeSeconds: Math.round(process.uptime()),
      db: dbConnected ? "connected" : "down",
      timestamp: new Date().toISOString(),
    });
  }) satisfies RequestHandler,
};
