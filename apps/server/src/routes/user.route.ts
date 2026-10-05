import { Hono } from "hono";
import { userController } from "../controllers/user.controller";
import { authRequired, requireRole } from "../middleware/auth";
import type { AppEnv } from "../types/auth";

export const userRoute = new Hono<AppEnv>();

userRoute.get("/me", authRequired(), userController.me);
userRoute.get("/", authRequired(), requireRole("admin"), userController.list);
