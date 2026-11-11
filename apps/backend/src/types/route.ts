import type { z } from "zod";
import type {
  createRouteSegmentSchema,
  createTrackNodeSchema,
  createTrailRouteSchema,
  destinationIdParamsSchema,
  routeEntityIdParamsSchema,
  updateRouteSegmentSchema,
  updateTrackNodeSchema,
  updateTrailRouteSchema,
} from "../schemas/route.schema";

export type CreateTrackNodeBody = z.infer<typeof createTrackNodeSchema>;
export type UpdateTrackNodeBody = z.infer<typeof updateTrackNodeSchema>;
export type CreateRouteSegmentBody = z.infer<typeof createRouteSegmentSchema>;
export type UpdateRouteSegmentBody = z.infer<typeof updateRouteSegmentSchema>;
export type CreateTrailRouteBody = z.infer<typeof createTrailRouteSchema>;
export type UpdateTrailRouteBody = z.infer<typeof updateTrailRouteSchema>;
export type RouteDestinationParams = z.infer<typeof destinationIdParamsSchema>;
export type RouteEntityParams = z.infer<typeof routeEntityIdParamsSchema>;
