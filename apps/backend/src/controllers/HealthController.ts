import type { RequestHandler } from "express";
import { database } from "../db/DatabaseClient";
import { ok } from "../utils/response";

class HealthController {
  /** GET /api/health */
  get: RequestHandler = async (_req, res) => {
    const dbConnected = await database.ping();
    ok(res, {
      status: "ok",
      service: "Dolenae API",
      version: "0.1.0",
      uptimeSeconds: Math.round(process.uptime()),
      db: dbConnected ? "connected" : "down",
      timestamp: new Date().toISOString(),
    });
  };
}

export const healthController = new HealthController();
