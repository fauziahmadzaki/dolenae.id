import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { updateProfileSchema } from "../controllers/auth.schema";
import { authRequired } from "../middleware/auth";
import { validate } from "../middleware/validate";

export const profileRouter = Router();

profileRouter.get("/me", authRequired, authController.me);
profileRouter.patch("/me", authRequired, validate({ body: updateProfileSchema }), authController.updateMe);
