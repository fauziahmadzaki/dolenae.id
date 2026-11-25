import { Router } from "express";
import { healthController } from "../controllers/HealthController";

export const healthRouter = Router();

healthRouter.get("/", healthController.get);
