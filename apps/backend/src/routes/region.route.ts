import { Router } from "express";
import { regionController } from "../controllers/region.controller";
import {
  districtQuerySchema,
  regencyQuerySchema,
  reverseQuerySchema,
} from "../controllers/region.schema";
import { validate } from "../middleware/validate";

export const regionRouter = Router();

// Public reads — the admin form and the public catalog share these endpoints.
regionRouter.get("/provinces", regionController.provinces);
regionRouter.get(
  "/regencies",
  validate({ query: regencyQuerySchema }),
  regionController.regencies,
);
regionRouter.get(
  "/districts",
  validate({ query: districtQuerySchema }),
  regionController.districts,
);
regionRouter.get(
  "/reverse",
  validate({ query: reverseQuerySchema }),
  regionController.reverse,
);
