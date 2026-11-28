import type { RequestHandler } from "express";
import { getValidated } from "../middleware/validate";
import { savedDestinationService } from "../services/SavedDestinationService";
import type { SavedDestinationParams } from "../types/savedDestination";
import { UnauthorizedError } from "../utils/errors";
import { ok } from "../utils/response";

class SavedDestinationController {
  /** GET /api/saved-destinations — list saved destinations owned by the user. */
  list: RequestHandler = async (req, res, next) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      ok(res, await savedDestinationService.list(req.user.id));
    } catch (error) {
      next(error);
    }
  };

  /** PUT /api/saved-destinations/:destinationId — idempotently save a destination. */
  save: RequestHandler = async (req, res, next) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { destinationId } = getValidated<SavedDestinationParams>(req, "params");
      const { item, created } = await savedDestinationService.save(
        req.user.id,
        destinationId,
      );
      ok(res, item, undefined, created ? 201 : 200);
    } catch (error) {
      next(error);
    }
  };

  /** DELETE /api/saved-destinations/:destinationId — idempotently unsave a destination. */
  remove: RequestHandler = async (req, res, next) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { destinationId } = getValidated<SavedDestinationParams>(req, "params");
      ok(res, await savedDestinationService.remove(req.user.id, destinationId));
    } catch (error) {
      next(error);
    }
  };
}

export const savedDestinationController = new SavedDestinationController();
