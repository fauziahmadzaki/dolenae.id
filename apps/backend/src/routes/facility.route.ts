import { Router } from "express";
import { facilityController } from "../controllers/FacilityController";
import { authOptional, authRequired, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createFacilityProductSchema,
  createFacilitySchema,
  facilityIdParamsSchema,
  facilityListQuerySchema,
  facilityProductParamsSchema,
  productListQuerySchema,
  updateFacilityProductSchema,
  updateFacilitySchema,
} from "../schemas/facility.schema";

export const facilityRouter = Router();

const merchantOrAdmin = [authRequired, requireRole("admin", "merchant")] as const;

facilityRouter.get(
  "/facilities/mine",
  ...merchantOrAdmin,
  validate({ query: facilityListQuerySchema }),
  facilityController.listMine,
);

facilityRouter.get(
  "/products/mine",
  ...merchantOrAdmin,
  validate({ query: productListQuerySchema }),
  facilityController.listMyProducts,
);

facilityRouter.get(
  "/destinations/:id/facilities",
  authOptional,
  validate({ params: facilityIdParamsSchema, query: facilityListQuerySchema }),
  facilityController.listByDestination,
);

facilityRouter.get(
  "/facilities/:id",
  authOptional,
  validate({ params: facilityIdParamsSchema }),
  facilityController.getById,
);

facilityRouter.post(
  "/facilities",
  ...merchantOrAdmin,
  validate({ body: createFacilitySchema }),
  facilityController.create,
);

facilityRouter.patch(
  "/facilities/:id",
  ...merchantOrAdmin,
  validate({ params: facilityIdParamsSchema, body: updateFacilitySchema }),
  facilityController.update,
);

facilityRouter.delete(
  "/facilities/:id",
  ...merchantOrAdmin,
  validate({ params: facilityIdParamsSchema }),
  facilityController.remove,
);

facilityRouter.post(
  "/facilities/:id/products",
  ...merchantOrAdmin,
  validate({
    params: facilityIdParamsSchema,
    body: createFacilityProductSchema,
  }),
  facilityController.createProduct,
);

facilityRouter.patch(
  "/facilities/:id/products/:productId",
  ...merchantOrAdmin,
  validate({
    params: facilityProductParamsSchema,
    body: updateFacilityProductSchema,
  }),
  facilityController.updateProduct,
);

facilityRouter.delete(
  "/facilities/:id/products/:productId",
  ...merchantOrAdmin,
  validate({ params: facilityProductParamsSchema }),
  facilityController.deleteProduct,
);
