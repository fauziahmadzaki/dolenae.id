import type { RequestHandler } from "express";
import { getValidated } from "../middleware/validate";
import { aiService } from "../services/ai/ai.service";
import { UnauthorizedError } from "../utils/errors";
import { ok } from "../utils/response";
import type { AiItineraryBody } from "./ai.schema";

export const aiController = {
  /** POST /api/ai/itineraries — grounded itinerary for the signed-in user. */
  generate: (async (req, res, next) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const body = getValidated<AiItineraryBody>(req, "body");
      const result = await aiService.generate(req.user.id, body);
      return ok(res, result);
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,
};
