import { Router } from "express";
import { contentController } from "../controllers/ContentController";
import {
  contentIdParamsSchema,
  contentListQuerySchema,
  contentSlugParamsSchema,
  createContentSchema,
  publicContentListQuerySchema,
  updateContentSchema,
} from "../schemas/content.schema";
import { authRequired, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";

/** Admin content management, mounted at `/api/admin/contents`. */
export const adminContentRouter = Router();

adminContentRouter.use(authRequired, requireRole("admin"));

adminContentRouter.get(
  "/",
  validate({ query: contentListQuerySchema }),
  contentController.listAdmin,
);
adminContentRouter.get(
  "/:id",
  validate({ params: contentIdParamsSchema }),
  contentController.getById,
);
adminContentRouter.post(
  "/",
  validate({ body: createContentSchema }),
  contentController.create,
);
adminContentRouter.patch(
  "/:id",
  validate({ params: contentIdParamsSchema, body: updateContentSchema }),
  contentController.update,
);
adminContentRouter.delete(
  "/:id",
  validate({ params: contentIdParamsSchema }),
  contentController.delete,
);

/** Public article reads, mounted at `/api/contents`. */
export const contentRouter = Router();

contentRouter.get(
  "/",
  validate({ query: publicContentListQuerySchema }),
  contentController.listPublic,
);
contentRouter.get(
  "/:slug",
  validate({ params: contentSlugParamsSchema }),
  contentController.getPublicBySlug,
);
