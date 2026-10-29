import type { RequestHandler } from "express";
import { getValidated } from "../middleware/validate";
import { aiService } from "../services/ai/ai.service";
import { UnauthorizedError } from "../utils/errors";
import { ok } from "../utils/response";
import type { AiItineraryBody } from "./ai.schema";

export const aiController = {
  /** GET /api/ai/options — filter values derived from the catalog. */
  options: (async (_req, res, next) => {
    try {
      return ok(res, await aiService.getOptions());
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,

  /** POST /api/ai/itineraries — grounded itinerary for the signed-in user. */
  generate: (async (req, res, next) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const body = getValidated<AiItineraryBody>(req, "body");
      const { refresh, ...input } = body;
      const result = await aiService.generate(req.user.id, input, {
        refresh,
      });
      return ok(res, result);
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,
};
