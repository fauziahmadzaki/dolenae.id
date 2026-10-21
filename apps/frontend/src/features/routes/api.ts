import { del, get, patch, post } from "~/lib/api/client";
import type {
  RouteGraph,
  RouteProfile,
  RouteSegment,
  TrackNode,
  TrailRoute,
} from "./schema";

export interface TrackNodeInput {
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  notes?: string | null;
}

export interface RouteSegmentInput {
  fromNodeId?: string;
  toNodeId?: string;
  surface?: string;
  grade?: string;
  traversableBy?: string[];
  bidirectional?: boolean;
  distanceKm?: number | null;
  estimatedDurationMinutes?: number | null;
  seasonal?: boolean;
  notes?: string | null;
  status?: string;
}

export interface TrailRouteInput {
  name?: string;
  description?: string | null;
  basecampNodeId?: string | null;
  nodeIds?: string[];
  surface?: string;
  grade?: string;
  traversableBy?: string[];
  difficulty?: string;
  recommended?: boolean;
  status?: string;
}

const auth = (token?: string | null) => ({ token: token ?? undefined });

export const routesApi = {
  graph: (destinationId: string, token?: string | null, signal?: AbortSignal) =>
    get<RouteGraph>(`/destinations/${destinationId}/route-graph`, {
      ...auth(token),
      signal,
    }),

  profile: (routeId: string, token?: string | null, signal?: AbortSignal) =>
    get<RouteProfile>(`/routes/${routeId}/profile`, {
      ...auth(token),
      signal,
    }),

  createNode: (destinationId: string, body: TrackNodeInput, token?: string | null) =>
    post<TrackNode>(`/destinations/${destinationId}/track-nodes`, body, auth(token)),
  updateNode: (id: string, body: Partial<TrackNodeInput>, token?: string | null) =>
    patch<TrackNode>(`/track-nodes/${id}`, body, auth(token)),
  deleteNode: (id: string, token?: string | null) =>
    del<{ id: string; deleted: true }>(`/track-nodes/${id}`, auth(token)),

  createSegment: (
    destinationId: string,
    body: RouteSegmentInput,
    token?: string | null,
  ) => post<RouteSegment>(`/destinations/${destinationId}/segments`, body, auth(token)),
  updateSegment: (
    id: string,
    body: Partial<RouteSegmentInput>,
    token?: string | null,
  ) => patch<RouteSegment>(`/segments/${id}`, body, auth(token)),
  deleteSegment: (id: string, token?: string | null) =>
    del<{ id: string; deleted: true }>(`/segments/${id}`, auth(token)),

  createRoute: (
    destinationId: string,
    body: TrailRouteInput,
    token?: string | null,
  ) => post<TrailRoute>(`/destinations/${destinationId}/routes`, body, auth(token)),
  updateRoute: (
    id: string,
    body: Partial<TrailRouteInput>,
    token?: string | null,
  ) => patch<TrailRoute>(`/routes/${id}`, body, auth(token)),
  deleteRoute: (id: string, token?: string | null) =>
    del<{ id: string; deleted: true }>(`/routes/${id}`, auth(token)),
};
