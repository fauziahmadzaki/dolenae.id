import { Router } from "express";
import { destinationController } from "../controllers/destination.controller";
import {
  createDestinationSchema,
  destinationIdParamsSchema,
  destinationListQuerySchema,
  updateDestinationSchema,
} from "../controllers/destination.schema";
import { authRequired, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";

export const destinationRouter = Router();

// Public reads — catalog & detail pages.
destinationRouter.get(
  "/",
  validate({ query: destinationListQuerySchema }),
  destinationController.list,
);
destinationRouter.get(
  "/:id",
  validate({ params: destinationIdParamsSchema }),
  destinationController.getById,
);

// Admin mutations.
destinationRouter.post(
  "/",
  authRequired,
  requireRole("admin"),
  validate({ body: createDestinationSchema }),
  destinationController.create,
);
destinationRouter.patch(
  "/:id",
  authRequired,
  requireRole("admin"),
  validate({ params: destinationIdParamsSchema, body: updateDestinationSchema }),
  destinationController.update,
);
destinationRouter.delete(
  "/:id",
  authRequired,
  requireRole("admin"),
  validate({ params: destinationIdParamsSchema }),
  destinationController.delete,
);
