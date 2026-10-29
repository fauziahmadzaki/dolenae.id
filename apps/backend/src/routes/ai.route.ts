import { Router } from "express";
import { aiController } from "../controllers/ai.controller";
import { aiItinerarySchema } from "../controllers/ai.schema";
import { authRequired } from "../middleware/auth";
import { validate } from "../middleware/validate";

export const aiRouter = Router();

aiRouter.post(
  "/itineraries",
  authRequired,
  validate({ body: aiItinerarySchema }),
  aiController.generate,
);
