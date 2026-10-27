import { Router } from "express";
import { supportController } from "../controllers/support.controller";
import { supportIdParamsSchema, supportListQuerySchema } from "../controllers/support.schema";
import { authOptional } from "../middleware/auth";
import { validate } from "../middleware/validate";

export const supportRouter = Router();
supportRouter.get("/supports/:id", authOptional,
  validate({ params: supportIdParamsSchema }), supportController.getById);
supportRouter.get("/destinations/:id/supports", authOptional,
  validate({ params: supportIdParamsSchema, query: supportListQuerySchema }), supportController.list);
