import type { RequestHandler } from "express";
import { getValidated } from "../middleware/validate";
import { routeService } from "../services/route.service";
import { ok } from "../utils/response";
import type {
  CreateRouteSegmentBody,
  CreateTrackNodeBody,
  CreateTrailRouteBody,
  UpdateRouteSegmentBody,
  UpdateTrackNodeBody,
  UpdateTrailRouteBody,
} from "./route.schema";

type DestinationParams = { destinationId: string };
type EntityParams = { id: string };

export const routeController = {
  graph: (async (req, res, next) => {
    try {
      const { destinationId } = getValidated<DestinationParams>(req, "params");
      return ok(res, await routeService.graph(destinationId));
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,

  listNodes: (async (req, res, next) => {
    try {
      const { destinationId } = getValidated<DestinationParams>(req, "params");
      return ok(res, await routeService.listNodes(destinationId));
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,

  createNode: (async (req, res, next) => {
    try {
      const { destinationId } = getValidated<DestinationParams>(req, "params");
      const body = getValidated<CreateTrackNodeBody>(req, "body");
      return ok(res, await routeService.createNode(destinationId, body), undefined, 201);
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,

  updateNode: (async (req, res, next) => {
    try {
      const { id } = getValidated<EntityParams>(req, "params");
      const body = getValidated<UpdateTrackNodeBody>(req, "body");
      return ok(res, await routeService.updateNode(id, body));
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,

  deleteNode: (async (req, res, next) => {
    try {
      const { id } = getValidated<EntityParams>(req, "params");
      return ok(res, await routeService.deleteNode(id));
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,

  listSegments: (async (req, res, next) => {
    try {
      const { destinationId } = getValidated<DestinationParams>(req, "params");
      return ok(res, await routeService.listSegments(destinationId));
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,

  createSegment: (async (req, res, next) => {
    try {
      const { destinationId } = getValidated<DestinationParams>(req, "params");
      const body = getValidated<CreateRouteSegmentBody>(req, "body");
      return ok(
        res,
        await routeService.createSegment(destinationId, body),
        undefined,
        201,
      );
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,

  updateSegment: (async (req, res, next) => {
    try {
      const { id } = getValidated<EntityParams>(req, "params");
      const body = getValidated<UpdateRouteSegmentBody>(req, "body");
      return ok(res, await routeService.updateSegment(id, body));
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,

  deleteSegment: (async (req, res, next) => {
    try {
      const { id } = getValidated<EntityParams>(req, "params");
      return ok(res, await routeService.deleteSegment(id));
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,

  listRoutes: (async (req, res, next) => {
    try {
      const { destinationId } = getValidated<DestinationParams>(req, "params");
      return ok(res, await routeService.listRoutes(destinationId));
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,

  getRoute: (async (req, res, next) => {
    try {
      const { id } = getValidated<EntityParams>(req, "params");
      return ok(res, await routeService.getRoute(id));
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,

  createRoute: (async (req, res, next) => {
    try {
      const { destinationId } = getValidated<DestinationParams>(req, "params");
      const body = getValidated<CreateTrailRouteBody>(req, "body");
      return ok(
        res,
        await routeService.createRoute(destinationId, body),
        undefined,
        201,
      );
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,

  updateRoute: (async (req, res, next) => {
    try {
      const { id } = getValidated<EntityParams>(req, "params");
      const body = getValidated<UpdateTrailRouteBody>(req, "body");
      return ok(res, await routeService.updateRoute(id, body));
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,

  deleteRoute: (async (req, res, next) => {
    try {
      const { id } = getValidated<EntityParams>(req, "params");
      return ok(res, await routeService.deleteRoute(id));
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,

  profile: (async (req, res, next) => {
    try {
      const { id } = getValidated<EntityParams>(req, "params");
      return ok(res, await routeService.profile(id));
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,
};
