import type { RequestHandler } from "express";
import { getValidated } from "../middleware/validate";
import { planService } from "../services/PlanService";
import type {
  CreatePlanBody,
  PlanClientIdParams,
  PlanIdParams,
  UpdatePlanBody,
} from "../types/plan";
import { UnauthorizedError } from "../utils/errors";
import { ok } from "../utils/response";

class PlanController {
  /** GET /api/plans — list plans owned by the signed-in user. */
  list: RequestHandler = async (req, res, next) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      ok(res, await planService.list(req.user.id));
    } catch (error) {
      next(error);
    }
  };

  /** GET /api/plans/:id — fetch one plan owned by the signed-in user. */
  detail: RequestHandler = async (req, res, next) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { id } = getValidated<PlanIdParams>(req, "params");
      ok(res, await planService.getById(id, req.user.id));
    } catch (error) {
      next(error);
    }
  };

  /** POST /api/plans — create a new trip plan for the signed-in user. */
  create: RequestHandler = async (req, res, next) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const body = getValidated<CreatePlanBody>(req, "body");
      const { plan, created } = await planService.create(req.user.id, body);
      ok(res, plan, undefined, created ? 201 : 200);
    } catch (error) {
      next(error);
    }
  };

  /** PATCH /api/plans/:id — update an existing trip plan owned by the user. */
  update: RequestHandler = async (req, res, next) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { id } = getValidated<PlanIdParams>(req, "params");
      const body = getValidated<UpdatePlanBody>(req, "body");
      ok(res, await planService.update(id, req.user.id, body));
    } catch (error) {
      next(error);
    }
  };

  /** DELETE /api/plans/:id — delete a trip plan owned by the user. */
  remove: RequestHandler = async (req, res, next) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { id } = getValidated<PlanIdParams>(req, "params");
      ok(res, await planService.remove(id, req.user.id));
    } catch (error) {
      next(error);
    }
  };

  /** DELETE /api/plans/client/:clientId — tombstone a clientId and delete matching plan. */
  removeByClientId: RequestHandler = async (req, res, next) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { clientId } = getValidated<PlanClientIdParams>(req, "params");
      ok(res, await planService.removeByClientId(clientId, req.user.id));
    } catch (error) {
      next(error);
    }
  };
}

export const planController = new PlanController();
