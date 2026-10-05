import { Hono } from "hono";
import { healthController } from "../controllers/health.controller";
import type { AppEnv } from "../types/auth";

export const healthRoute = new Hono<AppEnv>();
healthRoute.get("/", healthController.check);
