import { Router } from "express";
import { statsController } from "../controllers/StatsController";
import { authRequired, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { statsQuerySchema } from "../schemas/stats.schema";

export const statsRouter = Router();

statsRouter.use(authRequired, requireRole("admin"));

statsRouter.get(
  "/",
  validate({ query: statsQuerySchema }),
  statsController.overview,
);
