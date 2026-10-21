import { Router } from "express";
import { routeController } from "../controllers/route.controller";
import {
  createRouteSegmentSchema,
  createTrackNodeSchema,
  createTrailRouteSchema,
  destinationIdParamsSchema,
  routeEntityIdParamsSchema,
  updateRouteSegmentSchema,
  updateTrackNodeSchema,
  updateTrailRouteSchema,
} from "../controllers/route.schema";
import { authRequired, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";

export const routeBuilderRouter = Router();

// Admin-only while the builder is still a curation tool. Applied per route so
// unknown /api paths still fall through to the 404 handler.
const admin = [authRequired, requireRole("admin")] as const;

routeBuilderRouter.get(
  "/destinations/:destinationId/route-graph",
  ...admin,
  validate({ params: destinationIdParamsSchema }),
  routeController.graph,
);

routeBuilderRouter.get(
  "/destinations/:destinationId/track-nodes",
  ...admin,
  validate({ params: destinationIdParamsSchema }),
  routeController.listNodes,
);
routeBuilderRouter.post(
  "/destinations/:destinationId/track-nodes",
  ...admin,
  validate({ params: destinationIdParamsSchema, body: createTrackNodeSchema }),
  routeController.createNode,
);
routeBuilderRouter.patch(
  "/track-nodes/:id",
  ...admin,
  validate({ params: routeEntityIdParamsSchema, body: updateTrackNodeSchema }),
  routeController.updateNode,
);
routeBuilderRouter.delete(
  "/track-nodes/:id",
  ...admin,
  validate({ params: routeEntityIdParamsSchema }),
  routeController.deleteNode,
);

routeBuilderRouter.get(
  "/destinations/:destinationId/segments",
  ...admin,
  validate({ params: destinationIdParamsSchema }),
  routeController.listSegments,
);
routeBuilderRouter.post(
  "/destinations/:destinationId/segments",
  ...admin,
  validate({ params: destinationIdParamsSchema, body: createRouteSegmentSchema }),
  routeController.createSegment,
);
routeBuilderRouter.patch(
  "/segments/:id",
  ...admin,
  validate({ params: routeEntityIdParamsSchema, body: updateRouteSegmentSchema }),
  routeController.updateSegment,
);
routeBuilderRouter.delete(
  "/segments/:id",
  ...admin,
  validate({ params: routeEntityIdParamsSchema }),
  routeController.deleteSegment,
);

routeBuilderRouter.get(
  "/destinations/:destinationId/routes",
  ...admin,
  validate({ params: destinationIdParamsSchema }),
  routeController.listRoutes,
);
routeBuilderRouter.post(
  "/destinations/:destinationId/routes",
  ...admin,
  validate({ params: destinationIdParamsSchema, body: createTrailRouteSchema }),
  routeController.createRoute,
);
routeBuilderRouter.get(
  "/routes/:id",
  ...admin,
  validate({ params: routeEntityIdParamsSchema }),
  routeController.getRoute,
);
routeBuilderRouter.patch(
  "/routes/:id",
  ...admin,
  validate({ params: routeEntityIdParamsSchema, body: updateTrailRouteSchema }),
  routeController.updateRoute,
);
routeBuilderRouter.delete(
  "/routes/:id",
  ...admin,
  validate({ params: routeEntityIdParamsSchema }),
  routeController.deleteRoute,
);
routeBuilderRouter.get(
  "/routes/:id/profile",
  ...admin,
  validate({ params: routeEntityIdParamsSchema }),
  routeController.profile,
);
