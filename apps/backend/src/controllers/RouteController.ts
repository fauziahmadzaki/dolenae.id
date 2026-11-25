import type { RequestHandler } from "express";
import { getValidated } from "../middleware/validate";
import { routeService } from "../services/RouteService";
import { ok } from "../utils/response";
import type {
  CreateRouteSegmentBody,
  CreateTrackNodeBody,
  CreateTrailRouteBody,
  RouteDestinationParams,
  RouteEntityParams,
  UpdateRouteSegmentBody,
  UpdateTrackNodeBody,
  UpdateTrailRouteBody,
} from "../types/route";

class RouteController {
  publicProfile: RequestHandler = async (req, res, next) => {
    try {
      const { id } = getValidated<RouteEntityParams>(req, "params");
      ok(res, await routeService.profile(id, true));
    } catch (error) {
      next(error);
    }
  };

  publicGraph: RequestHandler = async (req, res, next) => {
    try {
      const { destinationId } = getValidated<RouteDestinationParams>(req, "params");
      ok(res, await routeService.graph(destinationId, true));
    } catch (error) {
      next(error);
    }
  };

  graph: RequestHandler = async (req, res, next) => {
    try {
      const { destinationId } = getValidated<RouteDestinationParams>(req, "params");
      ok(res, await routeService.graph(destinationId));
    } catch (error) {
      next(error);
    }
  };

  listNodes: RequestHandler = async (req, res, next) => {
    try {
      const { destinationId } = getValidated<RouteDestinationParams>(req, "params");
      ok(res, await routeService.listNodes(destinationId));
    } catch (error) {
      next(error);
    }
  };

  createNode: RequestHandler = async (req, res, next) => {
    try {
      const { destinationId } = getValidated<RouteDestinationParams>(req, "params");
      const body = getValidated<CreateTrackNodeBody>(req, "body");
      ok(res, await routeService.createNode(destinationId, body), undefined, 201);
    } catch (error) {
      next(error);
    }
  };

  updateNode: RequestHandler = async (req, res, next) => {
    try {
      const { id } = getValidated<RouteEntityParams>(req, "params");
      const body = getValidated<UpdateTrackNodeBody>(req, "body");
      ok(res, await routeService.updateNode(id, body));
    } catch (error) {
      next(error);
    }
  };

  deleteNode: RequestHandler = async (req, res, next) => {
    try {
      const { id } = getValidated<RouteEntityParams>(req, "params");
      ok(res, await routeService.deleteNode(id));
    } catch (error) {
      next(error);
    }
  };

  listSegments: RequestHandler = async (req, res, next) => {
    try {
      const { destinationId } = getValidated<RouteDestinationParams>(req, "params");
      ok(res, await routeService.listSegments(destinationId));
    } catch (error) {
      next(error);
    }
  };

  createSegment: RequestHandler = async (req, res, next) => {
    try {
      const { destinationId } = getValidated<RouteDestinationParams>(req, "params");
      const body = getValidated<CreateRouteSegmentBody>(req, "body");
      ok(
        res,
        await routeService.createSegment(destinationId, body),
        undefined,
        201,
      );
    } catch (error) {
      next(error);
    }
  };

  updateSegment: RequestHandler = async (req, res, next) => {
    try {
      const { id } = getValidated<RouteEntityParams>(req, "params");
      const body = getValidated<UpdateRouteSegmentBody>(req, "body");
      ok(res, await routeService.updateSegment(id, body));
    } catch (error) {
      next(error);
    }
  };

  deleteSegment: RequestHandler = async (req, res, next) => {
    try {
      const { id } = getValidated<RouteEntityParams>(req, "params");
      ok(res, await routeService.deleteSegment(id));
    } catch (error) {
      next(error);
    }
  };

  listRoutes: RequestHandler = async (req, res, next) => {
    try {
      const { destinationId } = getValidated<RouteDestinationParams>(req, "params");
      ok(res, await routeService.listRoutes(destinationId));
    } catch (error) {
      next(error);
    }
  };

  getRoute: RequestHandler = async (req, res, next) => {
    try {
      const { id } = getValidated<RouteEntityParams>(req, "params");
      ok(res, await routeService.getRoute(id));
    } catch (error) {
      next(error);
    }
  };

  createRoute: RequestHandler = async (req, res, next) => {
    try {
      const { destinationId } = getValidated<RouteDestinationParams>(req, "params");
      const body = getValidated<CreateTrailRouteBody>(req, "body");
      ok(
        res,
        await routeService.createRoute(destinationId, body),
        undefined,
        201,
      );
    } catch (error) {
      next(error);
    }
  };

  updateRoute: RequestHandler = async (req, res, next) => {
    try {
      const { id } = getValidated<RouteEntityParams>(req, "params");
      const body = getValidated<UpdateTrailRouteBody>(req, "body");
      ok(res, await routeService.updateRoute(id, body));
    } catch (error) {
      next(error);
    }
  };

  deleteRoute: RequestHandler = async (req, res, next) => {
    try {
      const { id } = getValidated<RouteEntityParams>(req, "params");
      ok(res, await routeService.deleteRoute(id));
    } catch (error) {
      next(error);
    }
  };

  profile: RequestHandler = async (req, res, next) => {
    try {
      const { id } = getValidated<RouteEntityParams>(req, "params");
      ok(res, await routeService.profile(id));
    } catch (error) {
      next(error);
    }
  };
}

export const routeController = new RouteController();
