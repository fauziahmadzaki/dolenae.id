import { Hono } from "hono";
import { authController } from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { loginSchema, registerSchema } from "../controllers/auth.schema";
import type { AppEnv } from "../types/auth";

export const authRoute = new Hono<AppEnv>();

authRoute.post("/register", validate("json", registerSchema), authController.register);
authRoute.post("/login", validate("json", loginSchema), authController.login);
