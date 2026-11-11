import type { RequestHandler } from "express";
import { getValidated } from "../middleware/validate";
import { supportService } from "../services/support.service";
import { ok } from "../utils/response";
import type { SupportIdParams, SupportListQuery } from "../types/support";

class SupportController {
  getById: RequestHandler = async (req, res, next) => {
    try {
      const { id } = getValidated<SupportIdParams>(req, "params");
      ok(res, await supportService.getById(id));
    } catch (err) { next(err); }
  };

  list: RequestHandler = async (req, res, next) => {
    try {
      const { id } = getValidated<SupportIdParams>(req, "params");
      const query = getValidated<SupportListQuery>(req, "query");
      const result = await supportService.list(id, { ...query, order: "asc" });
      ok(res, result.items, result.meta);
    } catch (err) { next(err); }
  };
}

export const supportController = new SupportController();
