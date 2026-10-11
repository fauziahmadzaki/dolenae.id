import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import {
  forgotPasswordSchema,
  googleSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../controllers/auth.schema";
import { authRequired } from "../middleware/auth";
import { validate } from "../middleware/validate";

export const authRouter = Router();

authRouter.post(
  "/register",
  validate({ body: registerSchema }),
  authController.register,
);
authRouter.post("/login", validate({ body: loginSchema }), authController.login);
authRouter.post(
  "/google",
  validate({ body: googleSchema }),
  authController.google,
);
authRouter.post(
  "/forgot-password",
  validate({ body: forgotPasswordSchema }),
  authController.forgotPassword,
);
authRouter.post(
  "/reset-password",
  validate({ body: resetPasswordSchema }),
  authController.resetPassword,
);
authRouter.get("/me", authRequired, authController.me);
