import { Router } from "express";
import { aiAdminController } from "../controllers/ai-admin.controller";
import {
  testAiSchema,
  updateAiSettingsSchema,
} from "../controllers/ai-admin.schema";
import { authRequired, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";

export const aiAdminRouter = Router();

aiAdminRouter.use(authRequired, requireRole("admin"));

aiAdminRouter.get("/settings", aiAdminController.getSettings);
aiAdminRouter.put(
  "/settings",
  validate({ body: updateAiSettingsSchema }),
  aiAdminController.updateSettings,
);
aiAdminRouter.get("/models", aiAdminController.listModels);
aiAdminRouter.post(
  "/test",
  validate({ body: testAiSchema }),
  aiAdminController.test,
);
