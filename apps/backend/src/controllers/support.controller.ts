import type { RequestHandler } from "express";
import { getValidated } from "../middleware/validate";
import { supportService } from "../services/support.service";
import { ok } from "../utils/response";
import type { SupportListQuery } from "./support.schema";

export const supportController = {
  getById: (async (req, res, next) => {
    try {
      const { id } = getValidated<{ id: string }>(req, "params");
      return ok(res, await supportService.getById(id));
    } catch (err) { next(err); }
  }) as RequestHandler,
  list: (async (req, res, next) => {
    try {
      const { id } = getValidated<{ id: string }>(req, "params");
      const query = getValidated<SupportListQuery>(req, "query");
      const result = await supportService.list(id, { ...query, order: "asc" });
      return ok(res, result.items, result.meta);
    } catch (err) { next(err); }
  }) as RequestHandler,
};
