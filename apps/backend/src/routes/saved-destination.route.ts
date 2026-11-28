import { Router } from "express";
import { savedDestinationController } from "../controllers/SavedDestinationController";
import { authRequired } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { savedDestinationParamsSchema } from "../schemas/savedDestination.schema";

export const savedDestinationRouter = Router();

savedDestinationRouter.get("/", authRequired, savedDestinationController.list);
savedDestinationRouter.put(
  "/:destinationId",
  authRequired,
  validate({ params: savedDestinationParamsSchema }),
  savedDestinationController.save,
);
savedDestinationRouter.delete(
  "/:destinationId",
  authRequired,
  validate({ params: savedDestinationParamsSchema }),
  savedDestinationController.remove,
);
