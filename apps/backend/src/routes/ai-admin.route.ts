import { Router } from "express";
import { aiController } from "../controllers/AiController";
import {
  testAiSchema,
  updateAiSettingsSchema,
} from "../schemas/ai-admin.schema";
import { authRequired, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";

export const aiAdminRouter = Router();

aiAdminRouter.use(authRequired, requireRole("admin"));

aiAdminRouter.get("/settings", aiController.getSettings);
aiAdminRouter.put(
  "/settings",
  validate({ body: updateAiSettingsSchema }),
  aiController.updateSettings,
);
aiAdminRouter.get("/models", aiController.listModels);
aiAdminRouter.post(
  "/test",
  validate({ body: testAiSchema }),
  aiController.test,
);
