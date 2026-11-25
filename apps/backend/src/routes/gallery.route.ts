import { Router } from "express";
import { galleryController } from "../controllers/GalleryController";
import {
  createGalleryPhotoSchema,
  galleryIdParamsSchema,
  galleryListQuerySchema,
  updateGalleryPhotoSchema,
} from "../schemas/content.schema";
import { authRequired, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";

/** Admin gallery management, mounted at `/api/admin/gallery`. */
export const adminGalleryRouter = Router();

adminGalleryRouter.use(authRequired, requireRole("admin"));

adminGalleryRouter.get(
  "/",
  validate({ query: galleryListQuerySchema }),
  galleryController.list,
);
adminGalleryRouter.post(
  "/",
  validate({ body: createGalleryPhotoSchema }),
  galleryController.create,
);
adminGalleryRouter.patch(
  "/:id",
  validate({ params: galleryIdParamsSchema, body: updateGalleryPhotoSchema }),
  galleryController.update,
);
adminGalleryRouter.delete(
  "/:id",
  validate({ params: galleryIdParamsSchema }),
  galleryController.delete,
);
