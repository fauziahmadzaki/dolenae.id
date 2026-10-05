import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { uploadController } from "../controllers/upload.controller";
import { authRequired, requireRole } from "../middleware/auth";
import { storageConfig } from "../config/env";
import type { AppEnv } from "../types/auth";

/** Upload global (admin). Batas body sedikit di atas batas file untuk overhead multipart. */
export const uploadRoute = new Hono<AppEnv>();

const maxBytes = storageConfig().maxUploadBytes + 256 * 1024;

uploadRoute.post(
  "/",
  bodyLimit({ maxSize: maxBytes }),
  authRequired(),
  requireRole("admin"),
  uploadController.image,
);

uploadRoute.delete(
  "/",
  authRequired(),
  requireRole("admin"),
  uploadController.remove,
);
