import { Hono } from "hono";
import { categoryController } from "../controllers/category.controller";
import { destinationController } from "../controllers/destination.controller";
import { supportController } from "../controllers/travel-support.controller";
import { authRequired, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  categoryCreateSchema,
  categoryUpdateSchema,
  destinationCreateSchema,
  destinationUpdateSchema,
  supportCreateSchema,
  supportUpdateSchema,
} from "../controllers/catalog.schema";
import type { AppEnv } from "../types/auth";

/** Guard admin: dipasang pada route tulis. */
const admin = [authRequired(), requireRole("admin")] as const;

// ---------- Categories ----------
export const categoryRoute = new Hono<AppEnv>();
categoryRoute.get("/", categoryController.list);
categoryRoute.get("/all", categoryController.all);
categoryRoute.get("/:id", categoryController.get);
categoryRoute.post("/", admin[0], admin[1], validate("json", categoryCreateSchema), categoryController.create);
categoryRoute.patch("/:id", admin[0], admin[1], validate("json", categoryUpdateSchema), categoryController.update);
categoryRoute.delete("/:id", admin[0], admin[1], categoryController.remove);

// ---------- Destinations ----------
export const destinationRoute = new Hono<AppEnv>();
destinationRoute.get("/", destinationController.list);
destinationRoute.get("/stats", destinationController.stats);
destinationRoute.get("/slug/:slug", destinationController.getBySlug);
destinationRoute.get("/:id", destinationController.getById);
destinationRoute.post("/", admin[0], admin[1], validate("json", destinationCreateSchema), destinationController.create);
destinationRoute.patch("/:id", admin[0], admin[1], validate("json", destinationUpdateSchema), destinationController.update);
destinationRoute.delete("/:id", admin[0], admin[1], destinationController.remove);

// ---------- Travel supports ----------
export const supportRoute = new Hono<AppEnv>();
supportRoute.get("/", supportController.list);
supportRoute.get("/:id", supportController.get);
supportRoute.post("/", admin[0], admin[1], validate("json", supportCreateSchema), supportController.create);
supportRoute.patch("/:id", admin[0], admin[1], validate("json", supportUpdateSchema), supportController.update);
supportRoute.delete("/:id", admin[0], admin[1], supportController.remove);
