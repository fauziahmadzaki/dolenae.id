import type { RequestHandler } from "express";
import { getValidated } from "../middleware/validate";
import { statsService } from "../services/StatsService";
import type { StatsQuery } from "../types/stats";
import { ok } from "../utils/response";

class StatsController {
  /** GET /api/admin/stats — ringkasan angka untuk dashboard admin. */
  overview: RequestHandler = async (req, res, next) => {
    try {
      const query = getValidated<StatsQuery>(req, "query");
      ok(res, await statsService.overview(query.months));
    } catch (err) {
      next(err);
    }
  };
}

export const statsController = new StatsController();
