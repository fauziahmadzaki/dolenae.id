import type { RequestHandler } from "express";
import { getValidated } from "../middleware/validate";
import { aiService } from "../services/ai/ai.service";
import { UnauthorizedError } from "../utils/errors";
import { ok } from "../utils/response";
import type { AiItineraryBody } from "../types/ai";

class AiController {
  /** GET /api/ai/options — filter values derived from the catalog. */
  options: RequestHandler = async (_req, res, next) => {
    try {
      ok(res, await aiService.getOptions());
    } catch (error) {
      next(error);
    }
  };

  /** POST /api/ai/itineraries — grounded itinerary for the signed-in user. */
  generate: RequestHandler = async (req, res, next) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const body = getValidated<AiItineraryBody>(req, "body");
      const { refresh, ...input } = body;
      const result = await aiService.generate(req.user.id, input, {
        refresh,
      });
      ok(res, result);
    } catch (error) {
      next(error);
    }
  };
}

export const aiController = new AiController();
