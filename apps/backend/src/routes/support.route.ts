import { Router } from "express";
import { facilityController } from "../controllers/FacilityController";
import {
  supportIdParamsSchema,
  supportListQuerySchema,
} from "../schemas/support.schema";
import { authOptional } from "../middleware/auth";
import { validate } from "../middleware/validate";

/**
 * Legacy `travel_supports` endpoints kept for the mobile app. They now read
 * from the `facilities` table and map the response to the old shape.
 */
export const supportRouter = Router();

supportRouter.get(
  "/supports/:id",
  authOptional,
  validate({ params: supportIdParamsSchema }),
  facilityController.legacyGetById,
);

supportRouter.get(
  "/destinations/:id/supports",
  authOptional,
  validate({ params: supportIdParamsSchema, query: supportListQuerySchema }),
  facilityController.legacyList,
);
