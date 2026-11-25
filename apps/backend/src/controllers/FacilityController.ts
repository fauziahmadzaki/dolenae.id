import type { RequestHandler } from "express";
import { getValidated } from "../middleware/validate";
import { facilityService, type FacilityActor } from "../services/FacilityService";
import type {
  CreateFacilityBody,
  CreateFacilityProductBody,
  FacilityIdParams,
  FacilityListQuery,
  FacilityProductParams,
  ProductListQuery,
  UpdateFacilityBody,
  UpdateFacilityProductBody,
} from "../types/facility";
import { UnauthorizedError } from "../utils/errors";
import { ok } from "../utils/response";

class FacilityController {
  private actor(req: Express.Request): FacilityActor {
    if (!req.user) throw new UnauthorizedError();
    return { id: req.user.id, role: req.user.role };
  }

  private optionalActor(req: Express.Request): FacilityActor | undefined {
    return req.user ? { id: req.user.id, role: req.user.role } : undefined;
  }

  /** GET /api/destinations/:id/facilities */
  listByDestination: RequestHandler = async (req, res, next) => {
    try {
      const { id } = getValidated<{ id: string }>(req, "params");
      const query = getValidated<FacilityListQuery>(req, "query");
      const result = await facilityService.listForDestination(id, query);
      ok(res, result.items, result.meta);
    } catch (error) {
      next(error);
    }
  };

  /** GET /api/facilities/mine */
  listMine: RequestHandler = async (req, res, next) => {
    try {
      const query = getValidated<FacilityListQuery>(req, "query");
      const result = await facilityService.listMine(this.actor(req), query);
      ok(res, result.items, result.meta);
    } catch (error) {
      next(error);
    }
  };

  /** GET /api/products/mine */
  listMyProducts: RequestHandler = async (req, res, next) => {
    try {
      const query = getValidated<ProductListQuery>(req, "query");
      const result = await facilityService.listMyProducts(this.actor(req), query);
      ok(res, result.items, result.meta);
    } catch (error) {
      next(error);
    }
  };

  /** GET /api/facilities/:id */
  getById: RequestHandler = async (req, res, next) => {
    try {
      const { id } = getValidated<FacilityIdParams>(req, "params");
      const facility = await facilityService.getById(id, this.optionalActor(req));
      ok(res, facility);
    } catch (error) {
      next(error);
    }
  };

  /** POST /api/facilities */
  create: RequestHandler = async (req, res, next) => {
    try {
      const body = getValidated<CreateFacilityBody>(req, "body");
      const facility = await facilityService.create(this.actor(req), body);
      ok(res, facility, undefined, 201);
    } catch (error) {
      next(error);
    }
  };

  /** PATCH /api/facilities/:id */
  update: RequestHandler = async (req, res, next) => {
    try {
      const { id } = getValidated<FacilityIdParams>(req, "params");
      const body = getValidated<UpdateFacilityBody>(req, "body");
      const facility = await facilityService.update(id, this.actor(req), body);
      ok(res, facility);
    } catch (error) {
      next(error);
    }
  };

  /** DELETE /api/facilities/:id */
  remove: RequestHandler = async (req, res, next) => {
    try {
      const { id } = getValidated<FacilityIdParams>(req, "params");
      ok(res, await facilityService.remove(id, this.actor(req)));
    } catch (error) {
      next(error);
    }
  };

  /** POST /api/facilities/:id/products */
  createProduct: RequestHandler = async (req, res, next) => {
    try {
      const { id } = getValidated<FacilityIdParams>(req, "params");
      const body = getValidated<CreateFacilityProductBody>(req, "body");
      const product = await facilityService.createProduct(
        id,
        this.actor(req),
        body,
      );
      ok(res, product, undefined, 201);
    } catch (error) {
      next(error);
    }
  };

  /** PATCH /api/facilities/:id/products/:productId */
  updateProduct: RequestHandler = async (req, res, next) => {
    try {
      const { id, productId } = getValidated<FacilityProductParams>(
        req,
        "params",
      );
      const body = getValidated<UpdateFacilityProductBody>(req, "body");
      const product = await facilityService.updateProduct(
        id,
        productId,
        this.actor(req),
        body,
      );
      ok(res, product);
    } catch (error) {
      next(error);
    }
  };

  /** DELETE /api/facilities/:id/products/:productId */
  deleteProduct: RequestHandler = async (req, res, next) => {
    try {
      const { id, productId } = getValidated<FacilityProductParams>(
        req,
        "params",
      );
      ok(res, await facilityService.deleteProduct(id, productId, this.actor(req)));
    } catch (error) {
      next(error);
    }
  };

  /** GET /api/supports/:id (legacy mobile contract). */
  legacyGetById: RequestHandler = async (req, res, next) => {
    try {
      const { id } = getValidated<{ id: string }>(req, "params");
      ok(res, await facilityService.legacyGetById(id));
    } catch (error) {
      next(error);
    }
  };

  /** GET /api/destinations/:id/supports (legacy mobile contract). */
  legacyList: RequestHandler = async (req, res, next) => {
    try {
      const { id } = getValidated<{ id: string }>(req, "params");
      const query = getValidated<{ page: number; limit: number }>(req, "query");
      const result = await facilityService.legacyList(id, query);
      ok(res, result.items, result.meta);
    } catch (error) {
      next(error);
    }
  };
}

export const facilityController = new FacilityController();
