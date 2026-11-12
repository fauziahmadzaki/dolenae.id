import type { z } from "zod";
import type {
  Difficulty,
  NewRouteSegmentRow,
  NewTrackNodeRow,
  NewTrailRouteRow,
  RouteGrade,
  RouteStatus,
  RouteSurface,
  TrackNodeType,
  TrailRouteStatus,
} from "../db/models";
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

/** Fields a caller may update after the track node exists. */
export type TrackNodePatch = Partial<
  Pick<
    NewTrackNodeRow,
    | "name"
    | "type"
    | "latitude"
    | "longitude"
    | "elevationMeters"
    | "notes"
    | "imageUrl"
  >
>;

/** Fields a caller may update after the route segment exists. */
export type RouteSegmentPatch = Partial<
  Pick<
    NewRouteSegmentRow,
    | "surface"
    | "grade"
    | "traversableBy"
    | "bidirectional"
    | "distanceKm"
    | "estimatedDurationMinutes"
    | "seasonal"
    | "notes"
    | "status"
  >
>;

/** Fields a caller may update after the trail route exists. */
export type TrailRoutePatch = Partial<
  Pick<
    NewTrailRouteRow,
    | "name"
    | "description"
    | "basecampNodeId"
    | "surface"
    | "grade"
    | "traversableBy"
    | "difficulty"
    | "recommended"
    | "status"
  >
>;

// --- Public shapes ---------------------------------------------------------

export interface TrackNodeDto {
  id: string;
  destinationId: string;
  name: string;
  type: TrackNodeType;
  coordinate: { latitude: number; longitude: number };
  elevationMeters: number;
  notes: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RouteSegmentDto {
  id: string;
  destinationId: string;
  fromNodeId: string;
  toNodeId: string;
  surface: RouteSurface;
  grade: RouteGrade;
  traversableBy: string[];
  bidirectional: boolean;
  /** Null = computed from the node coordinates on the fly. */
  distanceKm: number | null;
  estimatedDurationMinutes: number | null;
  seasonal: boolean;
  notes: string | null;
  status: RouteStatus;
  createdAt: string;
  updatedAt: string;
}

/** One point of the trail geometry; `nodeId` is set for named anchors. */
export interface RoutePointDto {
  latitude: number;
  longitude: number;
  elevationMeters: number | null;
  nodeId: string | null;
}

export interface TrailRouteDto {
  id: string;
  destinationId: string;
  name: string;
  description: string | null;
  basecampNodeId: string | null;
  nodeIds: string[];
  segmentIds: string[];
  points: RoutePointDto[];
  surface: string;
  grade: RouteGrade;
  traversableBy: string[];
  difficulty: Difficulty;
  recommended: boolean;
  status: TrailRouteStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ElevationPoint {
  distanceKm: number;
  elevationMeters: number;
  nodeId: string;
  name: string;
  type: TrackNodeType | "belokan";
}

export interface RouteProfileDto {
  routeId: string;
  points: ElevationPoint[];
  totalDistanceKm: number;
  totalGainMeters: number;
  totalLossMeters: number;
  maxElevationMeters: number;
  minElevationMeters: number;
  steepestGradePercent: number;
  estimatedDurationMinutes: number;
}

export type PublicRouteProfileDto = Omit<RouteProfileDto,
  "points" | "totalGainMeters" | "totalLossMeters" | "maxElevationMeters" |
  "minElevationMeters" | "steepestGradePercent" | "estimatedDurationMinutes"
> & {
  points: (Omit<ElevationPoint, "elevationMeters"> & { elevationMeters: number | null })[];
  totalGainMeters: number | null;
  totalLossMeters: number | null;
  maxElevationMeters: number | null;
  minElevationMeters: number | null;
  steepestGradePercent: number | null;
  estimatedDurationMinutes: number | null;
  elevationAvailable: boolean;
  elevationEstimated: boolean;
};

export interface RouteGraph {
  nodes: TrackNodeDto[];
  segments: RouteSegmentDto[];
  routes: TrailRouteDto[];
}

// --- DTOs -----------------------------------------------------------------

export interface CreateTrackNodeDto {
  name: string;
  type: TrackNodeType;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  notes?: string | null;
  imageUrl?: string | null;
}

export type UpdateTrackNodeDto = Partial<CreateTrackNodeDto>;

export interface CreateRouteSegmentDto {
  fromNodeId: string;
  toNodeId: string;
  surface?: RouteSurface;
  grade?: RouteGrade;
  traversableBy?: string[];
  bidirectional?: boolean;
  distanceKm?: number | null;
  estimatedDurationMinutes?: number | null;
  seasonal?: boolean;
  notes?: string | null;
  status?: RouteStatus;
}

export type UpdateRouteSegmentDto = Omit<
  Partial<CreateRouteSegmentDto>,
  "fromNodeId" | "toNodeId"
>;

export interface RoutePointInput {
  latitude: number;
  longitude: number;
  elevationMeters?: number | null;
  nodeId?: string | null;
}

export interface CreateTrailRouteDto {
  name: string;
  description?: string | null;
  basecampNodeId?: string | null;
  /** Explicit geometry; takes precedence over `nodeIds`. */
  points?: RoutePointInput[];
  /** Legacy input: anchors only, converted into points. */
  nodeIds?: string[];
  surface?: string;
  grade?: RouteGrade;
  traversableBy?: string[];
  difficulty?: Difficulty;
  recommended?: boolean;
  status?: TrailRouteStatus;
}

export type UpdateTrailRouteDto = Partial<CreateTrailRouteDto>;
