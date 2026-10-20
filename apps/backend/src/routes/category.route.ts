import { Router } from "express";
import { categoryController } from "../controllers/category.controller";
import {
  categoryIdParamsSchema,
  categoryListQuerySchema,
  createCategorySchema,
  updateCategorySchema,
} from "../controllers/category.schema";
import { authRequired, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";

export const categoryRouter = Router();

// Public reads — used by the catalog and admin table alike.
categoryRouter.get(
  "/",
  validate({ query: categoryListQuerySchema }),
  categoryController.list,
);
categoryRouter.get(
  "/:id",
  validate({ params: categoryIdParamsSchema }),
  categoryController.getById,
);

// Admin mutations.
categoryRouter.post(
  "/",
  authRequired,
  requireRole("admin"),
  validate({ body: createCategorySchema }),
  categoryController.create,
);
categoryRouter.patch(
  "/:id",
  authRequired,
  requireRole("admin"),
  validate({ params: categoryIdParamsSchema, body: updateCategorySchema }),
  categoryController.update,
);
categoryRouter.delete(
  "/:id",
  authRequired,
  requireRole("admin"),
  validate({ params: categoryIdParamsSchema }),
  categoryController.delete,
);
