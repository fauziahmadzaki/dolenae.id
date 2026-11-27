import { Router } from "express";
import { planController } from "../controllers/PlanController";
import { authRequired } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createPlanSchema,
  planClientIdParamsSchema,
  planIdParamsSchema,
  updatePlanSchema,
} from "../schemas/plan.schema";

export const planRouter = Router();

planRouter.get("/", authRequired, planController.list);
planRouter.get(
  "/:id",
  authRequired,
  validate({ params: planIdParamsSchema }),
  planController.detail,
);
planRouter.post(
  "/",
  authRequired,
  validate({ body: createPlanSchema }),
  planController.create,
);
planRouter.patch(
  "/:id",
  authRequired,
  validate({ params: planIdParamsSchema, body: updatePlanSchema }),
  planController.update,
);
planRouter.delete(
  "/client/:clientId",
  authRequired,
  validate({ params: planClientIdParamsSchema }),
  planController.removeByClientId,
);
planRouter.delete(
  "/:id",
  authRequired,
  validate({ params: planIdParamsSchema }),
  planController.remove,
);
